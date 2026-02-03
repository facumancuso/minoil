'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  Database,
  Loader2,
  HardDrive,
  Calendar,
  FileJson,
  Upload,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCurrentUserAction } from '@/app/auth-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type BackupInfo = {
  filename: string;
  date: string;
  size: number;
  sizeFormatted: string;
};

export default function BackupsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Verificar si el usuario actual es Facundo Mancuso
  const isFacundoMancuso = currentUser?.email?.toLowerCase().includes('facundo') ||
                           currentUser?.name?.toLowerCase().includes('facundo mancuso');

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUserAction();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  const loadBackupsList = async () => {
    try {
      setIsLoadingList(true);
      const response = await fetch('/api/backup/list');
      const data = await response.json();

      if (data.success) {
        setBackups(data.backups);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error loading backups list:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la lista de backups',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadBackupsList();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setIsCreating(true);

      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Backup creado',
          description: `Backup guardado exitosamente. Total de documentos: ${data.metadata.totalDocuments}`,
        });

        // Reload backups list
        await loadBackupsList();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el backup',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch('/api/backup/download');

      if (!response.ok) {
        throw new Error('Failed to download backup');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `backup-${new Date().toISOString()}.json`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Backup descargado',
        description: `Archivo guardado como ${filename}`,
      });
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo descargar el backup',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast({
          title: 'Error',
          description: 'Por favor selecciona un archivo JSON válido',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      setShowRestoreDialog(true);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) return;

    try {
      setIsRestoring(true);
      setShowRestoreDialog(false);

      // Leer el archivo
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      // Validar estructura del backup
      if (!backupData.collections || !backupData.timestamp) {
        throw new Error('Formato de backup inválido');
      }

      // Enviar a la API
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '¡Backup restaurado exitosamente!',
          description: `Se restauraron ${Object.values(data.restored).reduce((a: any, b: any) => a + b, 0)} documentos`,
        });

        // Recargar la página después de 2 segundos para reflejar los cambios
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Error al restaurar',
        description: error.message || 'No se pudo restaurar el backup',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelRestore = () => {
    setShowRestoreDialog(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Backups</h1>
        <p className="text-muted-foreground mt-2">
          Administra los respaldos de la base de datos
        </p>
      </div>

      {/* Botones principales - Acceso especial para Facundo Mancuso */}
      {isFacundoMancuso && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <CheckCircle2 className="h-5 w-5" />
              Controles de Administrador Principal
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Como administrador principal, tienes acceso completo a las funciones de backup y restauración
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Crear Backup Manual</h3>
              <Button
                onClick={handleCreateBackup}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Backup...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Guardar Backup Ahora
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Restaurar desde Archivo</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
                variant="outline"
                className="w-full border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones para todos los usuarios con permisos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear Backup Completo
            </CardTitle>
            <CardDescription>
              Crea un backup completo de todas las colecciones (Órdenes de Trabajo, Clientes, Inventario y Herramientas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando Backup...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Crear Backup Ahora
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Descargar Backup
            </CardTitle>
            <CardDescription>
              Descarga un backup completo en formato JSON a tu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadBackup}
              disabled={isDownloading}
              variant="outline"
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Backup JSON
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backups Almacenados en el Servidor
          </CardTitle>
          <CardDescription>
            Lista de backups guardados en el servidor (se mantienen los últimos 30)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay backups disponibles</p>
              <p className="text-sm mt-2">Crea tu primer backup usando el botón de arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup, index) => (
                <div
                  key={backup.filename}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileJson className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{backup.filename}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(backup.date), { addSuffix: true, locale: es })}
                        </span>
                        <span>{backup.sizeFormatted}</span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                      Más reciente
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información sobre backups automáticos */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">
            Backups Automáticos Activos
          </CardTitle>
          <CardDescription className="text-yellow-700 dark:text-yellow-300">
            El sistema crea backups automáticamente en las siguientes situaciones:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-yellow-800 dark:text-yellow-200">
          <ul className="list-disc list-inside space-y-2">
            <li>Cuando se crea una nueva Orden de Trabajo</li>
            <li>Cuando se actualiza una Orden de Trabajo existente</li>
            <li>Cuando se crea o actualiza un Cliente</li>
          </ul>
          <p className="mt-4 text-xs text-yellow-700 dark:text-yellow-300">
            Los backups incrementales se almacenan en el directorio backups/incremental del servidor.
          </p>
        </CardContent>
      </Card>

      {/* Dialog de confirmación para restaurar */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Confirmar Restauración de Backup?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div className="font-semibold text-destructive">
                  ⚠️ ADVERTENCIA: Esta acción es irreversible
                </div>
                <div>
                  Estás a punto de restaurar el backup:
                </div>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {selectedFile?.name}
                </div>
                <div className="text-sm">
                  Esto eliminará TODOS los datos actuales de la base de datos y los reemplazará con los datos del backup seleccionado.
                </div>
                <div className="text-sm font-semibold">
                  ¿Estás seguro de que quieres continuar?
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestore}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreBackup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Restaurar Backup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

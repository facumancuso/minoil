
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { UploadCloud, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type Category = 'Repuesto' | 'Herramienta';

interface UploadedFile {
  id: string;
  file: File;
  description: string;
  uploadDate: Date;
  category: Category;
}

const ACCEPTED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
};

// --- Start: Example Data ---
const createMockFile = (name: string, content: string): File => {
    return new File([content], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const getInitialFiles = (): UploadedFile[] => [
    {
        id: 'mock-1',
        file: createMockFile('stock_repuestos_enero_2024.xlsx', 'Contenido de repuestos Enero'),
        description: 'Inventario de repuestos al cierre de Enero. Incluye filtros y sellos.',
        uploadDate: new Date('2024-02-01T10:00:00Z'),
        category: 'Repuesto',
    },
    {
        id: 'mock-2',
        file: createMockFile('inventario_herramientas_Q1.xlsx', 'Contenido de herramientas Q1'),
        description: 'Control de herramientas especiales del primer trimestre.',
        uploadDate: new Date('2024-04-02T14:30:00Z'),
        category: 'Herramienta',
    },
];
// --- End: Example Data ---


export function UploadedFilesManager() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Repuesto');
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize state on the client to avoid hydration mismatch
    setUploadedFiles(getInitialFiles());
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0];
      setError(`Error: ${firstError.message}. Solo se permiten archivos Excel (.xlsx, .xls).`);
      setCurrentFile(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      setCurrentFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
  });

  const handleUpload = () => {
    if (!currentFile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un archivo para cargar.' });
      return;
    }

    const newFile: UploadedFile = {
      id: crypto.randomUUID(),
      file: currentFile,
      description,
      uploadDate: new Date(),
      category,
    };

    setUploadedFiles(prev => [newFile, ...prev]);
    setCurrentFile(null);
    setDescription('');
    setCategory('Repuesto');
    setError(null);
    toast({ title: 'Archivo Cargado', description: `"${currentFile.name}" ha sido añadido a la lista.` });
  };
  
  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleDeleteFile = () => {
    if (!fileToDelete) return;

    setUploadedFiles(prev => prev.filter(file => file.id !== fileToDelete.id));
    toast({
      title: 'Archivo Eliminado',
      description: `"${fileToDelete.file.name}" ha sido eliminado.`,
    });
    setFileToDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga de Archivos de Stock</CardTitle>
        <CardDescription>
          Sube tus archivos de Excel con el stock de repuestos y herramientas. Estos quedarán listados aquí para tu consulta y descarga.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sección de Carga */}
        <div className="space-y-4 max-w-xl mx-auto">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
            {isDragActive ? (
              <p className="text-primary font-semibold">Suelta el archivo aquí...</p>
            ) : (
              <p className="text-muted-foreground text-sm text-center">
                Arrastra un archivo de Excel aquí, o <span className="font-semibold text-primary">haz clic para buscar</span>
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          
          {currentFile && (
            <div className="p-4 border rounded-md bg-muted/50 space-y-4">
               <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                      <p className="text-sm font-medium truncate">{currentFile.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(currentFile.size)}</p>
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-select">Categoría del archivo</Label>
                <Select value={category} onValueChange={(value: Category) => setCategory(value)}>
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Repuesto">Repuestos</SelectItem>
                    <SelectItem value="Herramienta">Herramientas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file-description">Descripción</Label>
                <Textarea
                  id="file-description"
                  placeholder="Añade un detalle o descripción para este archivo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleUpload} className="w-full">
                Cargar a la Lista
              </Button>
            </div>
          )}
        </div>

        {/* Sección de Archivos Cargados */}
        <div className="space-y-4">
           <h4 className="text-sm font-medium text-muted-foreground">Archivos Cargados Recientemente</h4>
           {uploadedFiles.length > 0 ? (
              <div className="border rounded-md">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead className="w-[30%]">Archivo</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead>Categoría</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {uploadedFiles.map(uploaded => (
                              <TableRow key={uploaded.id}>
                                  <TableCell>
                                      <p className="font-medium truncate">{uploaded.file.name}</p>
                                      <p className="text-xs text-muted-foreground/80 mt-1">{format(uploaded.uploadDate, "dd MMM yyyy, HH:mm", { locale: es })}</p>
                                  </TableCell>
                                  <TableCell>
                                      <p className="text-sm text-muted-foreground truncate">{uploaded.description || 'Sin descripción'}</p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={uploaded.category === 'Repuesto' ? 'default' : 'secondary'}>
                                        {uploaded.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleDownload(uploaded.file)} title="Descargar archivo">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setFileToDelete(uploaded)} title="Eliminar archivo">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </div>
           ) : (
              <div className="h-40 flex items-center justify-center text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Aún no se han cargado archivos.</p>
              </div>
           )}
        </div>
      </CardContent>
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el archivo{' '}
              <strong>{fileToDelete?.file.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}


'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminPermissionsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Gestión de Permisos
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
          <CardDescription>
            Esta sección permitirá a los administradores gestionar los roles de los usuarios y controlar el acceso a las diferentes partes de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">Próximamente</p>
            <p className="text-muted-foreground mt-2">
              Estamos trabajando para traer la gestión detallada de permisos. ¡Vuelve pronto!
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

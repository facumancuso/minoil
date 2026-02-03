# Sistema de Backups Automáticos - Minoil

## Descripción General

El sistema de backups automáticos está completamente implementado y funcional. Los backups se crean automáticamente en las siguientes situaciones:

- ✅ Cuando se crea una nueva Orden de Trabajo
- ✅ Cuando se actualiza una Orden de Trabajo existente
- ✅ Cuando se crea un nuevo Cliente
- ✅ Cuando se actualiza un Cliente existente

## Tipos de Backups

### 1. Backups Incrementales (Automáticos)
Se crean automáticamente cada vez que se modifica un documento crítico.
- **Ubicación**: `backups/incremental/`
- **Formato**: `incremental-{collection}-{timestamp}.json`
- **Contenido**: Solo el documento modificado

### 2. Backups Completos (Manuales)
Puedes crear backups completos manualmente desde la interfaz de administración.
- **Ubicación**: `backups/`
- **Formato**: `backup-{timestamp}.json`
- **Contenido**: Todas las colecciones (WorkOrders, Clients, Inventory, Tools)
- **Retención**: Se mantienen los últimos 30 backups automáticamente

## Acceso a la Interfaz de Backups

1. Inicia sesión con una cuenta de **Admin** o **Director**
2. Ve a la pestaña **"Backups"** en el menú de administración
3. Desde ahí podrás:
   - Crear backups completos manualmente
   - Descargar backups en formato JSON
   - Ver la lista de backups almacenados en el servidor

## Ubicación de los Backups

Los backups se guardan en el directorio raíz del proyecto:

```
Minoil/
├── backups/
│   ├── backup-2026-01-14T10-30-00-000Z.json
│   ├── backup-2026-01-14T11-00-00-000Z.json
│   └── incremental/
│       ├── incremental-workOrders-2026-01-14T10-35-00-000Z.json
│       ├── incremental-clients-2026-01-14T10-40-00-000Z.json
│       └── ...
```

**IMPORTANTE**: Asegúrate de que el directorio `backups/` esté en tu `.gitignore` para no subir los backups al repositorio.

## Configuración Adicional: Google Drive (Opcional)

Si deseas sincronizar automáticamente los backups con Google Drive, sigue estos pasos:

### Opción 1: Sincronización Manual con Google Drive Desktop

1. Instala [Google Drive para Desktop](https://www.google.com/drive/download/)
2. Configura una carpeta sincronizada en Google Drive
3. Crea un enlace simbólico desde tu carpeta de backups:

**Windows:**
```cmd
mklink /D "C:\Users\TuUsuario\Google Drive\Minoil-Backups" "C:\ruta\a\Minoil\backups"
```

**Linux/Mac:**
```bash
ln -s /ruta/a/Minoil/backups ~/GoogleDrive/Minoil-Backups
```

### Opción 2: Script de Sincronización con rclone

1. Instala [rclone](https://rclone.org/downloads/)
2. Configura Google Drive:
```bash
rclone config
# Sigue las instrucciones para configurar Google Drive
```

3. Crea un script de sincronización:

**Windows (sync-backups.bat):**
```batch
@echo off
rclone sync "C:\ruta\a\Minoil\backups" "gdrive:Minoil-Backups" --progress
```

**Linux/Mac (sync-backups.sh):**
```bash
#!/bin/bash
rclone sync /ruta/a/Minoil/backups gdrive:Minoil-Backups --progress
```

4. Programa el script para ejecutarse automáticamente:

**Windows (Task Scheduler):**
- Abre "Programador de tareas"
- Crea una nueva tarea básica
- Configúrala para ejecutar el script cada hora o diario

**Linux/Mac (cron):**
```bash
# Editar crontab
crontab -e

# Ejecutar cada hora
0 * * * * /ruta/a/sync-backups.sh

# O ejecutar diariamente a las 2 AM
0 2 * * * /ruta/a/sync-backups.sh
```

### Opción 3: Integración con API de Google Drive (Avanzado)

Para integrar directamente con la API de Google Drive, necesitarás:

1. Crear un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar la API de Google Drive
3. Crear credenciales de servicio (Service Account)
4. Descargar el archivo JSON de credenciales
5. Instalar el paquete de Google Drive:

```bash
npm install googleapis
```

6. Crear un archivo `src/lib/google-drive-backup.ts`:

```typescript
import { google } from 'googleapis';
import { promises as fs } from 'fs';
import path from 'path';

const KEYFILE_PATH = path.join(process.cwd(), 'google-credentials.json');
const FOLDER_ID = 'TU_FOLDER_ID'; // ID de la carpeta en Google Drive

async function uploadToGoogleDrive(filepath: string) {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: path.basename(filepath),
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: 'application/json',
    body: await fs.readFile(filepath),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  console.log('Backup uploaded to Google Drive:', response.data.id);
  return response.data.id;
}

export { uploadToGoogleDrive };
```

7. Modificar `src/lib/backup.ts` para subir automáticamente:

```typescript
import { uploadToGoogleDrive } from './google-drive-backup';

// En la función saveBackupToFile, agregar:
export async function saveBackupToFile(backupData: BackupData): Promise<string> {
  // ... código existente ...

  // Subir a Google Drive (opcional)
  try {
    await uploadToGoogleDrive(filepath);
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    // No lanzar error - el backup local ya está guardado
  }

  return filepath;
}
```

## Restauración de Backups

Para restaurar un backup, usa el siguiente script:

```javascript
// scripts/restore-backup.js
const mongoose = require('mongoose');
const fs = require('fs').promises;

async function restoreBackup(backupFilePath) {
  const backupData = JSON.parse(await fs.readFile(backupFilePath, 'utf-8'));

  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;

  // Restaurar cada colección
  for (const [collectionName, documents] of Object.entries(backupData.collections)) {
    const collection = db.collection(collectionName);

    // Vaciar colección existente
    await collection.deleteMany({});

    // Insertar documentos del backup
    if (documents.length > 0) {
      await collection.insertMany(documents);
    }

    console.log(`✅ Restored ${documents.length} documents to ${collectionName}`);
  }

  await mongoose.connection.close();
  console.log('✅ Backup restored successfully');
}

// Uso: node scripts/restore-backup.js path/to/backup.json
const backupPath = process.argv[2];
if (!backupPath) {
  console.error('Usage: node scripts/restore-backup.js <backup-file-path>');
  process.exit(1);
}

restoreBackup(backupPath).catch(console.error);
```

## Recomendaciones de Seguridad

1. **No subir backups al repositorio**: Asegúrate de tener `backups/` en tu `.gitignore`
2. **Cifrado**: Considera cifrar los backups si contienen información sensible
3. **Almacenamiento remoto**: Configura Google Drive o un servicio de almacenamiento en la nube
4. **Retención**: El sistema mantiene automáticamente los últimos 30 backups completos
5. **Monitoreo**: Revisa periódicamente que los backups se estén creando correctamente

## Verificación del Sistema

Para verificar que el sistema de backups está funcionando:

1. Crea una nueva Orden de Trabajo o Cliente
2. Verifica que se haya creado un archivo en `backups/incremental/`
3. Ve a la pestaña "Backups" en la interfaz de administración
4. Crea un backup completo manualmente
5. Descarga el backup y verifica su contenido

## Soporte

Si tienes problemas con el sistema de backups, revisa:
- Los logs del servidor (busca mensajes con 📦 o ✅ relacionados con backups)
- Permisos del directorio `backups/`
- Conexión a la base de datos MongoDB

## Variables de Entorno

Asegúrate de tener configurada la variable:
```
MONGODB_URI=mongodb://localhost:27017/minoil_db
```

No se requieren variables adicionales para el funcionamiento básico de los backups.

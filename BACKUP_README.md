# Sistema de Backups Automáticos ✅

## Resumen

El sistema de backups automáticos ha sido completamente implementado y está funcionando. Los backups se crean automáticamente cada vez que:

- ✅ Creas una nueva Orden de Trabajo
- ✅ Actualizas una Orden de Trabajo
- ✅ Creas un nuevo Cliente
- ✅ Actualizas un Cliente

## Acceso Rápido

### Interfaz Web
1. Inicia sesión como **Admin** o **Director**
2. Ve a la pestaña **"Backups"** en el menú de administración
3. Opciones disponibles:
   - Crear backup completo manualmente
   - Descargar backup en formato JSON
   - Ver lista de backups del servidor
   - **[Usuario Facundo Mancuso]** Restaurar backup desde archivo (botón "Importar Backup")

### Ubicación de Archivos

```
Minoil/
├── backups/                          # Backups completos (máx. 30)
│   ├── backup-2026-01-14T10-30-00-000Z.json
│   └── incremental/                 # Backups automáticos incrementales
│       ├── incremental-workOrders-2026-01-14T10-35-00-000Z.json
│       └── incremental-clients-2026-01-14T10-40-00-000Z.json
```

## Restaurar un Backup

### Opción 1: Desde la Interfaz Web (Solo para Facundo Mancuso)

1. Inicia sesión con tu usuario
2. Ve a Admin → Backups
3. En la sección "Controles de Administrador Principal", haz clic en **"Importar Backup"**
4. Selecciona el archivo JSON del backup
5. Confirma la restauración en el diálogo de advertencia
6. Espera a que se complete el proceso (la página se recargará automáticamente)

### Opción 2: Desde la Línea de Comandos

Para restaurar un backup completo usando el script:

```bash
node scripts/restore-backup.js backups/backup-2026-01-14T10-30-00-000Z.json
```

**⚠️ ADVERTENCIA**: Este comando eliminará todos los datos existentes y los reemplazará con los del backup.

## Configuración con Google Drive (Opcional)

Para sincronizar automáticamente con Google Drive, consulta el archivo [BACKUP_SETUP.md](./BACKUP_SETUP.md) que contiene:

- ✅ Sincronización con Google Drive Desktop
- ✅ Script de sincronización con rclone
- ✅ Integración con API de Google Drive

## Archivos Creados

### Código
- ✅ [`src/lib/backup.ts`](src/lib/backup.ts) - Funciones de backup
- ✅ [`src/app/api/backup/create/route.ts`](src/app/api/backup/create/route.ts) - API para crear backup
- ✅ [`src/app/api/backup/download/route.ts`](src/app/api/backup/download/route.ts) - API para descargar backup
- ✅ [`src/app/api/backup/list/route.ts`](src/app/api/backup/list/route.ts) - API para listar backups
- ✅ [`src/app/api/backup/restore/route.ts`](src/app/api/backup/restore/route.ts) - API para restaurar backup
- ✅ [`src/app/admin/backups/page.tsx`](src/app/admin/backups/page.tsx) - Interfaz de administración con restauración

### Modificaciones
- ✅ [`src/app/actions.ts`](src/app/actions.ts) - Backups automáticos integrados
- ✅ [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) - Pestaña de Backups agregada
- ✅ [`.gitignore`](.gitignore) - Backups excluidos del repositorio

### Scripts
- ✅ [`scripts/restore-backup.js`](scripts/restore-backup.js) - Script de restauración

### Documentación
- ✅ [`BACKUP_SETUP.md`](BACKUP_SETUP.md) - Guía completa de configuración
- ✅ [`BACKUP_README.md`](BACKUP_README.md) - Este archivo (resumen)

## Verificación

Para verificar que todo funciona:

1. ✅ Crea una nueva OT o Cliente
2. ✅ Verifica que se creó un archivo en `backups/incremental/`
3. ✅ Ve a Admin → Backups
4. ✅ Crea un backup completo
5. ✅ Descarga el backup y verifica su contenido

## Características

### Backups Automáticos
- Se crean en segundo plano (no bloquean la operación principal)
- No afectan el rendimiento de la aplicación
- Incluyen logs detallados en la consola del servidor

### Backups Manuales
- Interfaz web fácil de usar
- Descarga directa a tu dispositivo
- Visualización de backups existentes
- **Restauración desde interfaz web** (usuario Facundo Mancuso)
  - Sube un archivo JSON de backup
  - Confirmación con advertencia de seguridad
  - Validación automática del formato del backup
  - Recarga automática después de la restauración

### Gestión Inteligente
- Mantiene automáticamente los últimos 30 backups completos
- Backups incrementales ilimitados (puedes limpiarlos manualmente)
- Incluye metadata (timestamp, versión, cantidad de documentos)

## Soporte

Si tienes problemas:
1. Revisa los logs del servidor (busca 📦, ✅, ❌)
2. Verifica permisos del directorio `backups/`
3. Confirma la conexión a MongoDB

## Próximos Pasos (Opcionales)

- [ ] Configurar sincronización con Google Drive
- [ ] Configurar backups programados diarios (cron job)
- [ ] Configurar alertas por email cuando falla un backup
- [ ] Implementar cifrado de backups
- [ ] Configurar almacenamiento en la nube (AWS S3, etc.)

---

Para más detalles, consulta [BACKUP_SETUP.md](./BACKUP_SETUP.md)

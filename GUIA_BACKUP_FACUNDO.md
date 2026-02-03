# Guía de Backups para Facundo Mancuso

## Acceso Especial de Administrador Principal

Como usuario principal del sistema, tienes acceso completo a las funcionalidades de backup y restauración directamente desde la interfaz web.

---

## 🔵 Panel de Control Especial

Cuando inicies sesión con tu cuenta, verás una sección especial en azul en la página de Backups:

**"Controles de Administrador Principal"**

Esta sección solo es visible para ti y contiene dos funciones críticas:

### 1. 💾 Crear Backup Manual
- Botón: **"Guardar Backup Ahora"**
- Crea un respaldo completo de toda la base de datos
- Se guarda automáticamente en el servidor
- Incluye: Órdenes de Trabajo, Clientes, Inventario y Herramientas

### 2. 📥 Importar Backup (Restauración)
- Botón: **"Importar Backup"**
- Permite restaurar la base de datos desde un archivo de backup
- Solo tú tienes acceso a esta función crítica

---

## 📋 Guía Paso a Paso

### ✅ Crear un Backup Manual

1. **Accede a la interfaz:**
   - Inicia sesión en Minoil
   - Ve a: Admin → Backups

2. **Crea el backup:**
   - En la sección azul "Controles de Administrador Principal"
   - Clic en **"Guardar Backup Ahora"**
   - Espera unos segundos mientras se crea

3. **Confirmación:**
   - Verás una notificación verde: "Backup creado"
   - El backup aparecerá en la lista de "Backups Almacenados"

4. **Descarga (opcional):**
   - Usa el botón **"Descargar Backup JSON"** para guardar una copia local
   - El archivo se descargará a tu dispositivo con el nombre: `minoil-backup-[fecha].json`

---

### 🔄 Restaurar un Backup (En caso de pérdida de datos)

**⚠️ IMPORTANTE: Esta acción eliminará TODOS los datos actuales y los reemplazará con los del backup**

1. **Prepara el archivo de backup:**
   - Asegúrate de tener el archivo JSON del backup que quieres restaurar
   - Puede ser un backup descargado previamente o uno de los backups del servidor

2. **Accede a la función de restauración:**
   - Ve a: Admin → Backups
   - En la sección azul "Controles de Administrador Principal"
   - Clic en **"Importar Backup"**

3. **Selecciona el archivo:**
   - Se abrirá un selector de archivos
   - Busca y selecciona el archivo `.json` del backup
   - El sistema validará que sea un archivo JSON válido

4. **Confirma la restauración:**
   - Aparecerá un diálogo de advertencia en rojo
   - Lee cuidadosamente la advertencia
   - Si estás seguro, clic en **"Sí, Restaurar Backup"**
   - Si tienes dudas, clic en **"Cancelar"**

5. **Espera la restauración:**
   - El sistema mostrará "Restaurando..."
   - NO cierres la ventana ni recargues la página
   - Verás una notificación verde cuando termine
   - La página se recargará automáticamente en 2 segundos

6. **Verifica:**
   - Revisa que todos los datos se hayan restaurado correctamente
   - Verifica Órdenes de Trabajo, Clientes, etc.

---

## 📊 Información Adicional

### Tipos de Backups Disponibles

1. **Backups Automáticos (Incrementales):**
   - Se crean automáticamente cada vez que:
     - Creas una nueva OT
     - Actualizas una OT
     - Creas/actualizas un Cliente
   - Ubicación: `backups/incremental/`
   - Contienen solo el documento modificado

2. **Backups Completos (Manuales):**
   - Creados con el botón "Guardar Backup Ahora"
   - Ubicación: `backups/`
   - Contienen TODA la base de datos
   - Se mantienen los últimos 30 automáticamente

### Cuándo Crear un Backup Manual

**Se recomienda crear backups manuales:**
- ✅ Antes de hacer cambios importantes en el sistema
- ✅ Al final de cada semana/mes
- ✅ Antes de actualizar la aplicación
- ✅ Después de cargar muchos datos nuevos
- ✅ Antes de eliminar información masivamente

### Cuándo Restaurar un Backup

**Solo restaura un backup cuando:**
- ❌ Se hayan perdido datos importantes
- ❌ La base de datos esté corrupta
- ❌ Necesites volver a un estado anterior del sistema
- ❌ Después de un error crítico

**⚠️ NO restaures un backup si:**
- Los datos actuales son más recientes y correctos
- No estás seguro de qué backup usar
- No has creado un backup de los datos actuales primero

---

## 🛡️ Mejores Prácticas de Seguridad

### 1. Backups Regulares
```
✅ Diario: Descarga un backup al final del día
✅ Semanal: Guarda copias en Google Drive o disco externo
✅ Mensual: Guarda copia de seguridad en ubicación física diferente
```

### 2. Organización de Archivos
```
Mi PC/
├── Minoil-Backups/
│   ├── 2026/
│   │   ├── 01-Enero/
│   │   │   ├── backup-2026-01-14.json
│   │   │   ├── backup-2026-01-21.json
│   │   │   └── backup-2026-01-28.json
│   │   ├── 02-Febrero/
│   │   └── ...
```

### 3. Verificación de Backups

Verifica tus backups regularmente:

1. **Descarga un backup**
2. **Abre el archivo JSON** con un editor de texto
3. **Verifica que contenga:**
   - `timestamp`: Fecha del backup
   - `collections`: workOrders, clients, inventory, tools
   - `metadata.totalDocuments`: Número total de documentos

### 4. Google Drive (Recomendado)

Para mayor seguridad, sincroniza tus backups con Google Drive:

**Opción Simple:**
1. Descarga backups regularmente
2. Súbelos manualmente a una carpeta en Google Drive
3. Nombra la carpeta: "Minoil-Backups-[Año]"

**Opción Avanzada:**
- Consulta el archivo [BACKUP_SETUP.md](BACKUP_SETUP.md)
- Sección: "Configuración con Google Drive"

---

## ⚡ Acciones Rápidas

### Crear backup y descargar (Rutina diaria recomendada):
1. Admin → Backups
2. "Guardar Backup Ahora" → Esperar confirmación
3. "Descargar Backup JSON" → Guardar en carpeta organizada

### Restaurar en emergencia:
1. Admin → Backups
2. "Importar Backup" → Seleccionar archivo
3. Confirmar restauración → Esperar recarga

---

## 📞 Notas Importantes

- ✅ Los backups automáticos están siempre activos en segundo plano
- ✅ Tienes acceso exclusivo a la función de restauración
- ✅ El sistema mantiene automáticamente los últimos 30 backups completos
- ✅ Los backups descargados son tuyos para siempre (no se borran)
- ⚠️ La restauración es IRREVERSIBLE - siempre crea un backup antes de restaurar
- ⚠️ Durante la restauración, otros usuarios pueden experimentar interrupciones

---

## 🔍 Solución de Problemas

### Error: "Formato de backup inválido"
- El archivo JSON está corrupto o no es un backup válido
- Intenta con otro archivo de backup

### Error: "No se pudo restaurar el backup"
- Verifica que el archivo sea un backup de Minoil
- Revisa los logs del servidor para más detalles
- Intenta con un backup más reciente

### La página no se recarga después de restaurar
- Recarga manualmente (F5)
- Verifica que la restauración haya sido exitosa en la consola del servidor

---

## 📚 Recursos Adicionales

- [BACKUP_README.md](BACKUP_README.md) - Resumen general del sistema
- [BACKUP_SETUP.md](BACKUP_SETUP.md) - Configuración avanzada y Google Drive
- `scripts/restore-backup.js` - Script de restauración por línea de comandos

---

**Última actualización:** Enero 2026
**Sistema de Backups:** v1.0
**Acceso Especial:** Facundo Mancuso

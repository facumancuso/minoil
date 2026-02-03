# 🏭 Minoil - Sistema de Gestión de Órdenes de Trabajo

Sistema completo de gestión para talleres de reparación y mantenimiento industrial, con seguimiento de órdenes de trabajo, clientes, inventario y más.

![Next.js](https://img.shields.io/badge/Next.js-15.3.8-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

---

## 🌟 Características Principales

### Gestión de Órdenes de Trabajo
- ✅ Creación y seguimiento de OT completo
- ✅ Estados de flujo de trabajo (Evaluación, Cotización, Reparación, Entrega)
- ✅ Historial de cambios y notas
- ✅ Archivos adjuntos (reportes, cotizaciones)
- ✅ Repuestos asociados con seguimiento de estado

### Gestión de Clientes
- ✅ Base de datos de clientes
- ✅ Historial de órdenes por cliente
- ✅ Información de contacto completa

### Gestión de Inventario
- ✅ Control de repuestos
- ✅ Herramientas y equipos
- ✅ Estado y disponibilidad

### Dashboard y Reportes
- ✅ KPIs y métricas en tiempo real
- ✅ Gráficos de tendencias
- ✅ Distribución de componentes
- ✅ Estado de bancos de prueba

### Visualización Gantt
- ✅ Timeline visual de órdenes de trabajo
- ✅ Seguimiento de fechas estimadas vs reales
- ✅ Vista de planificación

### Sistema de Backups
- ✅ **Backups automáticos** al crear/modificar OT y clientes
- ✅ **Backups manuales** con un click
- ✅ **Descarga de backups** en formato JSON
- ✅ **Restauración desde interfaz** (administrador principal)
- ✅ Mantiene últimos 30 backups automáticamente

### Control de Usuarios y Permisos
- ✅ Roles diferenciados (Admin, Director, Gerente, etc.)
- ✅ Autenticación segura
- ✅ Permisos granulares por rol

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** 20.x o superior
- **MongoDB** 7.0 o superior
- **npm** 10.x o superior

### Instalación Rápida

```bash
# 1. Clonar el repositorio (o descomprimir ZIP)
cd Minoil

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar MongoDB (si no está corriendo)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community@7.0
# Linux: sudo systemctl start mongod

# 5. Iniciar servidor de desarrollo
npm run dev

# 6. Abrir en el navegador
# http://localhost:3000
```

### 📚 Documentación Completa

Para instalación desde cero en una PC nueva, consulta:
**[GUIA_INSTALACION_COMPLETA.md](GUIA_INSTALACION_COMPLETA.md)** - Instalación paso a paso de todo (Node, MongoDB, etc.)

---

## 📂 Estructura del Proyecto

```
Minoil/
├── src/
│   ├── app/                    # Páginas y rutas de Next.js
│   │   ├── admin/             # Panel de administración
│   │   │   ├── backups/       # Gestión de backups
│   │   │   ├── clients/       # Gestión de clientes
│   │   │   ├── work-orders/   # Gestión de OT
│   │   │   └── ...
│   │   ├── api/               # API Routes
│   │   │   ├── backup/        # Endpoints de backup
│   │   │   └── ...
│   │   └── actions.ts         # Server actions
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes UI (shadcn/ui)
│   │   ├── clients/          # Componentes de clientes
│   │   ├── work-order/       # Componentes de OT
│   │   └── dashboard/        # Componentes del dashboard
│   ├── lib/                   # Utilidades y configuración
│   │   ├── backup.ts         # Sistema de backups
│   │   ├── db.ts             # Conexión a MongoDB
│   │   ├── types.ts          # Tipos TypeScript
│   │   └── utils.ts          # Funciones utilitarias
│   ├── models/                # Modelos de MongoDB (Mongoose)
│   │   ├── Client.ts
│   │   ├── WorkOrder.ts
│   │   ├── User.ts
│   │   └── ...
│   └── firebase/              # Configuración de Firebase
├── scripts/                   # Scripts de utilidad
│   ├── restore-backup.js     # Restaurar backup
│   ├── clean-old-backups.js  # Limpiar backups antiguos
│   └── test-*.js             # Scripts de prueba
├── backups/                   # Backups locales (no en Git)
│   └── incremental/          # Backups automáticos
├── docs/                      # Documentación
│   ├── GUIA_INSTALACION_COMPLETA.md
│   ├── GUIA_BACKUP_FACUNDO.md
│   ├── BACKUP_README.md
│   ├── BACKUP_SETUP.md
│   └── ...
├── .env.local                 # Variables de entorno (no en Git)
├── .env.example               # Plantilla de variables
└── package.json
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/minoil_db

# Firebase (opcional)
FIREBASE_SERVICE_ACCOUNT_KEY={...credenciales JSON...}

# Gemini AI (opcional)
GEMINI_API_KEY=tu_api_key
```

### Primera Vez

1. **Crear usuario inicial:**
   ```bash
   # Opción 1: Usando script de seed
   node scripts/seed-users.js

   # Opción 2: Manualmente con MongoDB
   mongosh minoil_db
   db.users.insertOne({
     name: "Admin",
     email: "admin@minoil.com",
     password: "admin123",
     role: "Admin",
     createdAt: new Date()
   })
   ```

2. **Acceder a la aplicación:**
   - URL: `http://localhost:3000`
   - Email: `admin@minoil.com`
   - Password: `admin123`
   - **Cambia la contraseña después del primer login**

---

## 📖 Guías y Documentación

### Guías de Instalación
- **[GUIA_INSTALACION_COMPLETA.md](GUIA_INSTALACION_COMPLETA.md)** - Instalación desde cero (Node, MongoDB, etc.)
- **[.env.example](.env.example)** - Plantilla de configuración

### Guías de Uso
- **[GUIA_BACKUP_FACUNDO.md](GUIA_BACKUP_FACUNDO.md)** - Sistema de backups (usuario administrador)
- **[BACKUP_README.md](BACKUP_README.md)** - Resumen del sistema de backups
- **[BACKUP_SETUP.md](BACKUP_SETUP.md)** - Configuración avanzada de backups

### Solución de Problemas
- **[PROBLEMA_CLIENTES_SOLUCIONADO.md](PROBLEMA_CLIENTES_SOLUCIONADO.md)** - Fix UUID vs ObjectId
- **[SOLUCION_BACKUP.md](SOLUCION_BACKUP.md)** - Backups no bloqueantes

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (localhost:3000)
npm run build            # Compila para producción
npm run start            # Inicia servidor de producción
npm run lint             # Revisa código con ESLint

# Base de Datos
npm run db               # Abre mongo-express (GUI para MongoDB)

# Backups
node scripts/restore-backup.js <archivo>     # Restaurar backup
node scripts/clean-old-backups.js            # Limpiar backups antiguos
node scripts/test-client-creation.js         # Probar conexión a MongoDB
```

---

## 🔒 Sistema de Backups

El proyecto incluye un sistema completo de backups automáticos y manuales.

### Backups Automáticos
- Se crean automáticamente al:
  - Crear nueva Orden de Trabajo
  - Actualizar Orden de Trabajo
  - Crear nuevo Cliente
  - Actualizar Cliente

### Backups Manuales
- Desde la interfaz: **Admin → Backups**
- Botón **"Guardar Backup Ahora"** - Backup completo del servidor
- Botón **"Descargar Backup JSON"** - Descarga copia local
- Botón **"Importar Backup"** - Restaurar desde archivo (solo admin principal)

### Características
- ✅ No bloquean operaciones principales
- ✅ Mantiene últimos 30 backups automáticamente
- ✅ Formato JSON legible
- ✅ Incluye todas las colecciones (OT, Clientes, Inventario, Herramientas)

**Más información:** [GUIA_BACKUP_FACUNDO.md](GUIA_BACKUP_FACUNDO.md)

---

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso completo + Backups y configuración |
| **Director** | Acceso completo + Estadísticas |
| **Gerente** | OT, Clientes, Inventario, Gantt, Historial |
| **Gerente Técnico** | OT, Inventario |
| **Gerente de Taller** | OT, Inventario |
| **Responsable de Compras** | Solo Inventario |

---

## 🏗️ Stack Tecnológico

### Frontend
- **Next.js 15.3.8** - Framework React con SSR
- **React 18.3.1** - Biblioteca de UI
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 3.4** - Estilos utilitarios
- **shadcn/ui** - Componentes UI

### Backend
- **Next.js API Routes** - Endpoints de API
- **Server Actions** - Lógica del servidor
- **MongoDB 7.0+** - Base de datos NoSQL
- **Mongoose 9.1** - ODM para MongoDB

### Herramientas
- **Firebase** - Autenticación (opcional)
- **date-fns** - Manejo de fechas
- **recharts** - Gráficos y visualizaciones
- **react-hook-form** - Formularios
- **zod** - Validación de schemas

---

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar que MongoDB está corriendo
# Windows
net start MongoDB

# macOS
brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod
```

### Puerto 3000 ocupado
```bash
# Usar otro puerto
PORT=3001 npm run dev
```

### Error al instalar dependencias
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Clientes no se guardan
- Reinicia el servidor después de los últimos cambios
- Verifica que MongoDB esté corriendo
- Revisa [PROBLEMA_CLIENTES_SOLUCIONADO.md](PROBLEMA_CLIENTES_SOLUCIONADO.md)

**Más soluciones:** [GUIA_INSTALACION_COMPLETA.md](GUIA_INSTALACION_COMPLETA.md#verificación-y-troubleshooting)

---

## 📝 Changelog

### v1.1.0 (2026-01-14)
- ✅ Sistema completo de backups automáticos y manuales
- ✅ Restauración de backups desde interfaz web
- ✅ Fix: Problema UUID vs ObjectId en creación de clientes
- ✅ Fix: Backups no bloqueantes
- ✅ Documentación completa de instalación

### v1.0.0 (2026-01-01)
- 🎉 Versión inicial
- ✅ Gestión de Órdenes de Trabajo
- ✅ Gestión de Clientes
- ✅ Dashboard y métricas
- ✅ Sistema de usuarios y permisos

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2026 Minoil

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisa la [Guía de Instalación](GUIA_INSTALACION_COMPLETA.md)
2. Consulta la sección de [Troubleshooting](#-solución-de-problemas)
3. Revisa los logs del servidor y navegador

---

**Desarrollado con ❤️ para la gestión industrial eficiente**

**Versión:** 1.1.0
**Última actualización:** Enero 14, 2026
**Mantenedor:** Facundo Mancuso

# 🚀 Guía Completa de Instalación - Minoil

Esta guía te llevará paso a paso desde una PC limpia hasta tener Minoil funcionando completamente.

---

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación de Software Base](#instalación-de-software-base)
3. [Instalación de Node.js](#instalación-de-nodejs)
4. [Instalación de MongoDB](#instalación-de-mongodb)
5. [Instalación del Proyecto Minoil](#instalación-del-proyecto-minoil)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Primera Ejecución](#primera-ejecución)
8. [Creación de Usuario Inicial](#creación-de-usuario-inicial)
9. [Verificación y Troubleshooting](#verificación-y-troubleshooting)

---

## 📌 Requisitos del Sistema

### Sistema Operativo
- ✅ Windows 10/11 (64-bit)
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 20.04+, Debian 11+)

### Hardware Mínimo
- **CPU:** Dual-core 2.0 GHz
- **RAM:** 4 GB (8 GB recomendado)
- **Disco:** 2 GB libres (para el proyecto + MongoDB)
- **Internet:** Conexión activa (solo para instalación inicial)

---

## 🛠️ Instalación de Software Base

### Windows

#### 1. Git (Opcional pero recomendado)

1. Descarga Git desde: https://git-scm.com/download/win
2. Ejecuta el instalador
3. Acepta las opciones por defecto
4. Verifica la instalación:
   ```cmd
   git --version
   ```

#### 2. Editor de Código (Recomendado)

**Visual Studio Code:**
- Descarga: https://code.visualstudio.com/
- Instala con opciones por defecto

### macOS

#### Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Git

```bash
brew install git
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install git curl wget
```

---

## 📦 Instalación de Node.js

Node.js es el entorno de ejecución para el proyecto.

### Windows

#### Opción 1: Instalador Oficial (Recomendado)

1. Ve a: https://nodejs.org/
2. Descarga **"LTS"** (Long Term Support) - versión 20.x o superior
3. Ejecuta el instalador
4. Acepta las opciones por defecto
5. **IMPORTANTE:** Marca la casilla "Automatically install necessary tools"

#### Opción 2: Usando nvm-windows

1. Descarga nvm-windows: https://github.com/coreybutler/nvm-windows/releases
2. Instala `nvm-setup.exe`
3. Abre PowerShell como Administrador:
   ```powershell
   nvm install 20
   nvm use 20
   ```

### macOS

```bash
# Usando Homebrew
brew install node@20

# O usando nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Linux

```bash
# Ubuntu/Debian usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# O usando nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Verificar Instalación

Abre una **nueva** terminal/cmd y ejecuta:

```bash
node --version
# Debe mostrar: v20.x.x

npm --version
# Debe mostrar: 10.x.x o superior
```

---

## 🗄️ Instalación de MongoDB

MongoDB es la base de datos del proyecto.

### Windows

#### Método 1: Instalador MSI (Recomendado)

1. **Descargar MongoDB Community Server**
   - Ve a: https://www.mongodb.com/try/download/community
   - Versión: 7.0 o superior
   - Package: MSI
   - Click en "Download"

2. **Instalar**
   - Ejecuta el archivo `.msi`
   - Selecciona: **"Complete"** installation
   - **IMPORTANTE:** Marca "Install MongoDB as a Service"
   - **IMPORTANTE:** Marca "Install MongoDB Compass" (GUI opcional pero útil)
   - Click "Next" y espera la instalación

3. **Verificar que el servicio está corriendo**

   Abre PowerShell como Administrador:
   ```powershell
   # Ver estado del servicio
   Get-Service MongoDB

   # Debe mostrar: Status: Running
   ```

4. **Si el servicio no está corriendo, iniciarlo:**
   ```powershell
   net start MongoDB
   ```

#### Método 2: Usando Chocolatey

```powershell
# Instalar Chocolatey primero (si no lo tienes)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar MongoDB
choco install mongodb -y

# Iniciar servicio
net start MongoDB
```

### macOS

```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Iniciar MongoDB como servicio
brew services start mongodb-community@7.0

# Verificar que está corriendo
brew services list | grep mongodb
```

### Linux (Ubuntu/Debian)

```bash
# Importar clave pública de MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Agregar repositorio
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Actualizar e instalar
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod  # Para que inicie automáticamente

# Verificar estado
sudo systemctl status mongod
```

### Verificar MongoDB Funciona

En cualquier sistema, abre una terminal y ejecuta:

```bash
# Conectar al shell de MongoDB
mongosh

# Si MongoDB está corriendo, verás algo como:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017
# Using MongoDB: 7.0.x

# Para salir:
exit
```

**Si `mongosh` no está instalado:**
```bash
# Windows (PowerShell como Admin)
npm install -g mongosh

# macOS
brew install mongosh

# Linux
sudo apt install mongodb-mongosh
```

---

## 💻 Instalación del Proyecto Minoil

### 1. Obtener el Proyecto

#### Si tienes el proyecto en un archivo ZIP:

```bash
# Windows (PowerShell) o macOS/Linux (Terminal)
cd C:\Users\TuUsuario\Documents  # Windows
cd ~/Documents                    # macOS/Linux

# Extraer el ZIP aquí
# Luego navegar a la carpeta:
cd Minoil
```

#### Si tienes el proyecto en Git:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/minoil.git
cd minoil
```

### 2. Instalar Dependencias

Este paso descarga todas las librerías necesarias (puede tomar 5-10 minutos):

```bash
npm install
```

**Si aparece un error de permisos en Windows:**
```powershell
# Ejecutar PowerShell como Administrador y ejecutar:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**Si aparece error de red:**
```bash
# Limpiar caché y reintentar
npm cache clean --force
npm install
```

### 3. Verificar package.json

El archivo debe contener estos scripts principales:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "NODE_ENV=production next build",
    "start": "next start"
  }
}
```

---

## ⚙️ Configuración de Variables de Entorno

### 1. Crear archivo .env.local

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

### 2. Editar .env.local

Abre el archivo `.env.local` con tu editor de texto y configura:

```bash
# =============================================================================
# MINOIL - Variables de Entorno
# =============================================================================

# -----------------------------------------------------------------------------
# MongoDB - Base de Datos Principal
# -----------------------------------------------------------------------------
MONGODB_URI=mongodb://localhost:27017/minoil_db

# -----------------------------------------------------------------------------
# Firebase - Credenciales de Service Account (Backend)
# -----------------------------------------------------------------------------
# NOTA: Si aún no tienes credenciales de Firebase, puedes dejar esto
# temporalmente y configurarlo después
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"tu-project-id",...}

# -----------------------------------------------------------------------------
# Gemini AI (Opcional)
# -----------------------------------------------------------------------------
GEMINI_API_KEY=tu_api_key_aqui
```

### 3. Configurar Firebase (Opcional pero Recomendado)

Si quieres usar autenticación y otras funcionalidades de Firebase:

1. **Crear proyecto en Firebase:**
   - Ve a: https://console.firebase.google.com/
   - Click en "Add project" o "Agregar proyecto"
   - Nombre: "Minoil" (o el que prefieras)
   - Sigue los pasos

2. **Obtener credenciales de Service Account:**
   - En tu proyecto Firebase → ⚙️ Settings → Service Accounts
   - Click en "Generate new private key"
   - Se descargará un archivo JSON

3. **Copiar credenciales al .env.local:**
   - Abre el archivo JSON descargado
   - Copia TODO el contenido
   - Pégalo en una sola línea en `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **IMPORTANTE:** Debe quedar en UNA SOLA LÍNEA (sin saltos de línea)

**Ejemplo de formato correcto:**
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"minoil-abc123",...todo el JSON en una línea...}
```

---

## 🎯 Primera Ejecución

### 1. Iniciar MongoDB (si no está corriendo)

**Windows:**
```powershell
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community@7.0
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Iniciar el Servidor de Desarrollo

En la carpeta del proyecto:

```bash
npm run dev
```

Deberías ver algo como:

```
▲ Next.js 15.3.8
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3.2s
```

### 3. Abrir en el Navegador

Abre tu navegador y ve a:
```
http://localhost:3000
```

Deberías ver la página de inicio/login de Minoil.

---

## 👤 Creación de Usuario Inicial

### Método 1: Script de Seed (Recomendado)

El proyecto incluye usuarios de prueba. Para crearlos:

```bash
# En una nueva terminal (mantén el servidor corriendo)
node scripts/seed-users.js
```

O si tienes un endpoint de seed en la aplicación:
```bash
# Con el servidor corriendo, desde otra terminal:
curl http://localhost:3000/api/seed
```

### Método 2: Crear Usuario Manualmente con MongoDB

```bash
# Conectar a MongoDB
mongosh minoil_db

# Crear usuario administrador
db.users.insertOne({
  name: "Facundo Mancuso",
  email: "facundo@minoil.com",
  password: "admin123",  // CAMBIAR después del primer login
  role: "Admin",
  createdAt: new Date()
})

# Verificar
db.users.find().pretty()

# Salir
exit
```

### Método 3: Desde la Aplicación

Si la aplicación tiene un endpoint de registro público:
1. Ve a `http://localhost:3000/register` (si existe)
2. Completa el formulario
3. Inicia sesión

---

## ✅ Verificación y Troubleshooting

### Verificar que Todo Funciona

#### 1. Verificar MongoDB

```bash
# Conectar a MongoDB
mongosh minoil_db

# Listar colecciones
show collections

# Debe mostrar: users, clients, workorders, etc.

# Contar documentos
db.users.countDocuments()
db.clients.countDocuments()

exit
```

#### 2. Verificar el Servidor

Con el servidor corriendo (`npm run dev`), en otra terminal:

```bash
# Windows (PowerShell)
curl http://localhost:3000

# macOS/Linux
curl http://localhost:3000

# Debe retornar HTML de la página
```

#### 3. Verificar Logs

En la terminal donde corre el servidor, deberías ver logs sin errores rojos.

---

## 🐛 Solución de Problemas Comunes

### Error: ECONNREFUSED MongoDB

**Problema:** MongoDB no está corriendo

**Solución:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod
```

### Error: Port 3000 already in use

**Problema:** El puerto 3000 ya está ocupado

**Solución 1 - Usar otro puerto:**
```bash
# Windows
$env:PORT=3001; npm run dev

# macOS/Linux
PORT=3001 npm run dev
```

**Solución 2 - Matar el proceso:**
```bash
# Windows (PowerShell como Admin)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Error: Cannot find module

**Problema:** Dependencias no instaladas correctamente

**Solución:**
```bash
# Limpiar y reinstalar
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

### Error: MongoDB connection failed

**Problema:** URI de MongoDB incorrecta

**Solución:**
1. Verificar `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/minoil_db
   ```
2. Verificar que MongoDB está corriendo (ver arriba)
3. Reiniciar el servidor: Ctrl+C y `npm run dev`

### Error: Firebase credentials

**Problema:** Credenciales de Firebase mal configuradas

**Solución temporal:**
- Comenta temporalmente el código de Firebase
- O deja las credenciales de ejemplo por ahora
- La app puede funcionar sin Firebase si solo usas MongoDB

### Error: Permission denied en node_modules

**Windows:**
```powershell
# Ejecutar como Administrador
npm install
```

**macOS/Linux:**
```bash
# NO uses sudo con npm. En su lugar:
sudo chown -R $USER:$USER ~/.npm
npm install
```

---

## 📚 Comandos Útiles de Referencia

### npm

```bash
npm install              # Instalar dependencias
npm run dev             # Iniciar servidor de desarrollo
npm run build           # Compilar para producción
npm run start           # Iniciar servidor de producción
npm run lint            # Revisar código
```

### MongoDB

```bash
mongosh                 # Conectar a MongoDB
mongosh minoil_db       # Conectar a base de datos específica

# Dentro de mongosh:
show dbs                # Listar bases de datos
use minoil_db           # Usar base de datos
show collections        # Listar colecciones
db.users.find()         # Ver todos los usuarios
db.clients.find()       # Ver todos los clientes
exit                    # Salir
```

### Git (Opcional)

```bash
git status              # Ver estado
git add .               # Agregar cambios
git commit -m "mensaje" # Crear commit
git pull                # Obtener cambios
git push                # Subir cambios
```

---

## 🚀 Siguiente Pasos

Una vez que todo esté funcionando:

1. ✅ Cambia las contraseñas por defecto
2. ✅ Configura Firebase completamente (si lo usas)
3. ✅ Crea backups regulares (Admin → Backups)
4. ✅ Lee la documentación de funcionalidades:
   - [GUIA_BACKUP_FACUNDO.md](GUIA_BACKUP_FACUNDO.md)
   - [BACKUP_README.md](BACKUP_README.md)

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de Troubleshooting arriba
2. Verifica los logs del servidor (terminal)
3. Verifica los logs del navegador (F12 → Console)
4. Revisa que MongoDB esté corriendo
5. Revisa el archivo `.env.local`

---

## 📄 Checklist de Instalación

Marca cada paso al completarlo:

- [ ] Node.js instalado y verificado
- [ ] MongoDB instalado y corriendo
- [ ] Proyecto descargado/clonado
- [ ] `npm install` ejecutado exitosamente
- [ ] `.env.local` creado y configurado
- [ ] `npm run dev` funciona sin errores
- [ ] Navegador abre `http://localhost:3000`
- [ ] Usuario inicial creado
- [ ] Login funciona correctamente
- [ ] Puedes ver/crear clientes y órdenes de trabajo

---

**Última actualización:** Enero 14, 2026
**Versión del proyecto:** 1.0
**Autor:** Facundo Mancuso

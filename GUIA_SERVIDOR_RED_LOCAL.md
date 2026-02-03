# 🌐 Guía: Servidor Minoil en Red Local

Esta guía explica cómo configurar Minoil para que funcione en una red local y sea accesible desde múltiples computadoras.

---

## 📋 Índice

1. [Opción 1: Servidor Dedicado en Red Local](#opción-1-servidor-dedicado-en-red-local-recomendado) ⭐ Recomendado
2. [Opción 2: MongoDB Cloud (Atlas)](#opción-2-mongodb-cloud-atlas)
3. [Opción 3: Docker](#opción-3-docker-avanzado)
4. [Comparación de Opciones](#comparación-de-opciones)

---

## Opción 1: Servidor Dedicado en Red Local (Recomendado)

### 🎯 Concepto

Una PC actúa como servidor permanente donde corre MongoDB y Next.js. Las demás PCs acceden vía navegador.

```
┌─────────────────────────────────────────────────┐
│  PC SERVIDOR (siempre encendida)                │
│  IP: 192.168.1.100                              │
│  ├─ MongoDB (puerto 27017)                      │
│  └─ Next.js Server (puerto 3000)                │
└─────────────────────────────────────────────────┘
             │
             │ Red Local (WiFi/Ethernet)
             │
    ┌────────┴────────┬──────────────┐
    │                 │              │
┌───▼────┐      ┌────▼───┐     ┌────▼────┐
│ PC 1   │      │ PC 2   │     │ PC 3    │
│ Chrome │      │ Chrome │     │ Chrome  │
└────────┘      └────────┘     └─────────┘
http://192.168.1.100:3000
```

### ✅ Ventajas
- ✅ Base de datos centralizada
- ✅ Una sola instalación
- ✅ Todos ven los mismos datos en tiempo real
- ✅ Backups centralizados
- ✅ No necesita internet

### ❌ Desventajas
- ❌ La PC servidor debe estar siempre encendida
- ❌ Si se apaga el servidor, nadie puede usar la app

---

## 📝 Configuración Paso a Paso

### Paso 1: Elegir PC Servidor

Requisitos recomendados:
- **RAM:** 8 GB o más
- **Conexión:** Ethernet (más estable que WiFi)
- **Sistema:** Windows/Linux (Linux es más eficiente)
- **Disponibilidad:** Encendida durante horario laboral

### Paso 2: Obtener IP Local del Servidor

**En Windows (PowerShell):**
```powershell
ipconfig
# Busca "IPv4 Address" en tu adaptador de red principal
# Ejemplo: 192.168.1.100
```

**En Linux/macOS:**
```bash
ip addr show
# O
ifconfig
# Busca "inet" en tu interfaz principal (eth0 o wlan0)
```

**Anotar la IP:** Por ejemplo `192.168.1.100`

### Paso 3: Configurar IP Estática (Recomendado)

Para que la IP no cambie:

**Windows:**
1. Panel de Control → Centro de redes → Cambiar configuración del adaptador
2. Click derecho en tu red → Propiedades
3. Protocolo de Internet versión 4 (TCP/IPv4) → Propiedades
4. Seleccionar "Usar la siguiente dirección IP"
5. Ingresar:
   - IP: `192.168.1.100` (o la que tenías)
   - Máscara: `255.255.255.0`
   - Puerta de enlace: `192.168.1.1` (IP de tu router)
   - DNS: `8.8.8.8` y `8.8.4.4` (Google DNS)

**O configurar en el Router (Mejor):**
1. Accede a tu router (generalmente `192.168.1.1`)
2. Busca "DHCP Reservation" o "Reserva de IP"
3. Asigna la MAC address de la PC servidor a una IP fija

### Paso 4: Configurar MongoDB para Acceso en Red

**Editar archivo de configuración de MongoDB:**

**Windows:**
```
C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg
```

**Linux:**
```
/etc/mongod.conf
```

**Cambiar:**
```yaml
# network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0  # ⬅️ Cambiar de 127.0.0.1 a 0.0.0.0
```

**Reiniciar MongoDB:**

**Windows (PowerShell como Admin):**
```powershell
net stop MongoDB
net start MongoDB
```

**Linux:**
```bash
sudo systemctl restart mongod
```

### Paso 5: Configurar Firewall

**Windows Firewall:**
```powershell
# Ejecutar PowerShell como Administrador

# Permitir MongoDB (puerto 27017)
New-NetFirewallRule -DisplayName "MongoDB" -Direction Inbound -LocalPort 27017 -Protocol TCP -Action Allow

# Permitir Next.js (puerto 3000)
New-NetFirewallRule -DisplayName "Minoil Next.js" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Linux (UFW):**
```bash
sudo ufw allow 27017/tcp
sudo ufw allow 3000/tcp
sudo ufw reload
```

### Paso 6: Configurar Next.js para Red Local

**Editar package.json:**
```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "start": "next start -H 0.0.0.0"
  }
}
```

**O al ejecutar:**
```bash
# Para desarrollo
npm run dev -- -H 0.0.0.0

# Para producción
npm run build
npm run start -- -H 0.0.0.0
```

### Paso 7: Configurar Variables de Entorno

En el servidor, editar `.env.local`:

```bash
# MongoDB - Usar localhost en el servidor
MONGODB_URI=mongodb://localhost:27017/minoil_db

# Las demás variables igual...
FIREBASE_SERVICE_ACCOUNT_KEY=...
```

### Paso 8: Iniciar el Servidor

```bash
# En la PC servidor
cd Minoil

# Opción 1: Modo desarrollo (para pruebas)
npm run dev -- -H 0.0.0.0

# Opción 2: Modo producción (recomendado para uso real)
npm run build
npm run start -- -H 0.0.0.0 -p 3000
```

### Paso 9: Acceder desde Otras PCs

En cualquier PC de la red local, abrir navegador y visitar:

```
http://192.168.1.100:3000
```

(Reemplaza `192.168.1.100` con la IP de tu servidor)

---

## 🔄 Mantener el Servidor Siempre Funcionando

### Opción A: PM2 (Recomendado para Windows/Linux)

**Instalar PM2:**
```bash
npm install -g pm2
```

**Iniciar aplicación:**
```bash
cd Minoil
npm run build

# Iniciar con PM2
pm2 start npm --name "minoil" -- start -- -H 0.0.0.0
```

**Configurar inicio automático:**

**Windows:**
```bash
pm2 startup
# Sigue las instrucciones que muestra

pm2 save
```

**Linux:**
```bash
pm2 startup systemd
# Copia y ejecuta el comando que muestra
pm2 save
```

**Comandos útiles de PM2:**
```bash
pm2 list              # Ver aplicaciones corriendo
pm2 logs minoil       # Ver logs
pm2 restart minoil    # Reiniciar
pm2 stop minoil       # Detener
pm2 delete minoil     # Eliminar
```

### Opción B: Servicio de Windows

Crear archivo `minoil-service.bat`:
```batch
@echo off
cd C:\ruta\a\Minoil
npm run start -- -H 0.0.0.0
```

Usar NSSM (Non-Sucking Service Manager):
1. Descargar: https://nssm.cc/download
2. Instalar servicio:
```cmd
nssm install Minoil "C:\ruta\a\Minoil\minoil-service.bat"
nssm start Minoil
```

### Opción C: Systemd (Linux)

Crear archivo `/etc/systemd/system/minoil.service`:
```ini
[Unit]
Description=Minoil Application
After=network.target mongod.service

[Service]
Type=simple
User=tuusuario
WorkingDirectory=/home/tuusuario/Minoil
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start -- -H 0.0.0.0
Restart=always

[Install]
WantedBy=multi-user.target
```

**Habilitar e iniciar:**
```bash
sudo systemctl enable minoil
sudo systemctl start minoil
sudo systemctl status minoil
```

---

## 🔒 Seguridad en Red Local

### 1. Autenticación MongoDB

**Crear usuario administrador:**
```bash
mongosh

use admin
db.createUser({
  user: "minoil_admin",
  pwd: "password_seguro_aqui",
  roles: ["readWriteAnyDatabase"]
})

exit
```

**Actualizar .env.local:**
```bash
MONGODB_URI=mongodb://minoil_admin:password_seguro_aqui@localhost:27017/minoil_db?authSource=admin
```

### 2. HTTPS (Opcional para Red Local)

Si quieres usar HTTPS:

**Generar certificado self-signed:**
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

**Configurar Next.js con HTTPS:**
Crear `server.js`:
```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on https://0.0.0.0:3000');
  });
});
```

**package.json:**
```json
{
  "scripts": {
    "start:https": "node server.js"
  }
}
```

---

## 📱 Acceso desde Móviles

Si quieres acceder desde tablets o móviles en la misma red:

1. Abre el navegador del móvil
2. Visita: `http://192.168.1.100:3000`
3. (Opcional) Agregar a pantalla de inicio para usarlo como "app"

---

## 🧪 Verificación

### Desde el Servidor

```bash
# Verificar MongoDB escucha en todas las interfaces
netstat -an | grep 27017
# Debe mostrar 0.0.0.0:27017

# Verificar Next.js escucha en todas las interfaces
netstat -an | grep 3000
# Debe mostrar 0.0.0.0:3000
```

### Desde Otra PC

**Probar conexión:**
```bash
# Ping al servidor
ping 192.168.1.100

# Probar puerto 3000
telnet 192.168.1.100 3000
# O usando PowerShell:
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000
```

**Abrir navegador:**
```
http://192.168.1.100:3000
```

---

## 🔧 Troubleshooting

### Problema: No puedo acceder desde otra PC

**Soluciones:**
1. Verificar firewall del servidor
2. Verificar que Next.js corre con `-H 0.0.0.0`
3. Verificar que ambas PCs están en la misma red
4. Probar con IP en lugar de hostname

### Problema: Lento desde otras PCs

**Soluciones:**
1. Usar conexión Ethernet en servidor
2. Verificar congestión de red WiFi
3. Compilar en modo producción (`npm run build`)
4. Considerar servidor más potente

### Problema: El servidor se apaga/reinicia

**Soluciones:**
1. Usar PM2 o servicio del sistema
2. Deshabilitar suspensión del PC servidor
3. Configurar política de energía en "Alto rendimiento"

---

## 📊 Monitoreo

### Ver uso de recursos:

**Windows:**
```powershell
# CPU y RAM de Node.js
Get-Process node
```

**Linux:**
```bash
# Top con filtro
top -p $(pgrep -d',' -f node)

# O usar htop
htop
```

### Logs de aplicación:

**Con PM2:**
```bash
pm2 logs minoil
pm2 monit
```

### Backup automático en red:

Crear script que ejecute backups y los copie a otra PC:

**backup-to-network.bat (Windows):**
```batch
@echo off
cd C:\Minoil
node scripts/clean-old-backups.js

REM Copiar backups a otra PC en red
xcopy backups \\OTRA-PC\Minoil-Backups\ /E /I /Y
```

Programar con Task Scheduler para ejecutar diariamente.

---

## 💡 Recomendaciones Finales

### Para Pequeña Oficina (1-10 usuarios):
- ✅ PC dedicada como servidor
- ✅ IP estática en router
- ✅ PM2 para mantener corriendo
- ✅ Backup diario manual
- ✅ MongoDB sin autenticación (red local segura)

### Para Oficina Media (10-50 usuarios):
- ✅ Servidor dedicado o mini-PC
- ✅ Linux Ubuntu Server
- ✅ Servicio systemd
- ✅ MongoDB con autenticación
- ✅ Backups automáticos a NAS
- ✅ UPS para protección eléctrica

### Para Oficina Grande (50+ usuarios):
- ✅ Servidor dedicado potente
- ✅ MongoDB Cloud (Atlas)
- ✅ Contenedor Docker
- ✅ Reverse proxy (Nginx)
- ✅ HTTPS con certificado válido
- ✅ Monitoreo 24/7
- ✅ Backups automáticos redundantes

---

## 📞 Próximos Pasos

1. ✅ Decidir qué PC será el servidor
2. ✅ Configurar IP estática
3. ✅ Seguir pasos de configuración
4. ✅ Probar desde otra PC
5. ✅ Configurar PM2 o servicio
6. ✅ Configurar backups automáticos

---

## Opción 2: MongoDB Cloud (Atlas)

### 🎯 Concepto

Cada PC tiene su propia instalación de Next.js, pero todos se conectan a una base de datos MongoDB en la nube (Atlas).

```
┌──────────────────────────────────────┐
│  MongoDB Atlas (Cloud)               │
│  cluster0.mongodb.net                │
│  ├─ minoil_db                        │
│  └─ Accesible desde cualquier lado   │
└──────────────────────────────────────┘
             ▲
             │ Internet
             │
    ┌────────┼────────┬──────────────┐
    │        │        │              │
┌───▼────┐ ┌─▼──────┐ ┌───▼──────┐
│ PC 1   │ │ PC 2   │ │ PC 3     │
│ Next.js│ │ Next.js│ │ Next.js  │
└────────┘ └────────┘ └──────────┘
localhost:3000 (cada uno)
```

### ✅ Ventajas
- ✅ No necesita PC servidor dedicada
- ✅ Accesible desde cualquier ubicación con internet
- ✅ Backups automáticos incluidos
- ✅ Alta disponibilidad y redundancia
- ✅ Escalable fácilmente
- ✅ Free tier disponible (512 MB)

### ❌ Desventajas
- ❌ Requiere conexión a internet
- ❌ Latencia mayor que red local
- ❌ Límites en el plan gratuito
- ❌ Cada PC necesita instalar el proyecto

---

## 📝 Configuración MongoDB Atlas

### Paso 1: Crear Cuenta en MongoDB Atlas

1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Crear Cluster

1. Click en "Build a Database"
2. Selecciona **FREE** (M0 Sandbox)
3. Elige región más cercana (ejemplo: AWS - São Paulo)
4. Nombre del cluster: `minoil-cluster`
5. Click "Create"

Espera 3-5 minutos mientras se crea el cluster.

### Paso 3: Configurar Acceso de Red

1. En el menú lateral: **Network Access**
2. Click "Add IP Address"
3. **Opción A - Para oficina con IP fija:**
   - Click "Add Current IP Address"
   - O ingresar tu IP pública manualmente

4. **Opción B - Para múltiples ubicaciones (menos seguro):**
   - Click "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`
   - **Advertencia:** Solo si usas autenticación fuerte

5. Click "Confirm"

### Paso 4: Crear Usuario de Base de Datos

1. En el menú lateral: **Database Access**
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `minoil_user`
5. Password: Genera una contraseña segura (guárdala)
   - Ejemplo: `Mn0il2026!Secure`
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

### Paso 5: Obtener Connection String

1. Ve a **Database** en el menú lateral
2. Click en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copia el connection string:

```
mongodb+srv://minoil_user:<password>@minoil-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Paso 6: Configurar Variables de Entorno

En cada PC que use la app, edita `.env.local`:

```bash
# MongoDB Atlas - Reemplaza <password> con tu contraseña real
MONGODB_URI=mongodb+srv://minoil_user:Mn0il2026!Secure@minoil-cluster.xxxxx.mongodb.net/minoil_db?retryWrites=true&w=majority

# Importante: Agrega el nombre de la base de datos (minoil_db) después de .net/
```

### Paso 7: Instalar en Cada PC

En cada computadora que usará la aplicación:

```bash
# 1. Instalar Node.js (si no lo tiene)
# Ver GUIA_INSTALACION_COMPLETA.md

# 2. Copiar proyecto
cd Documentos
git clone <tu-repositorio>
# O copiar la carpeta Minoil desde USB/red

# 3. Instalar dependencias
cd Minoil
npm install

# 4. Configurar .env.local (con el mismo MONGODB_URI)
cp .env.example .env.local
# Editar y poner el MONGODB_URI de Atlas

# 5. Iniciar aplicación
npm run dev
# O para producción:
npm run build
npm start
```

### Paso 8: Acceder a la Aplicación

Cada usuario en su PC:
```
http://localhost:3000
```

Todos verán los mismos datos porque comparten la misma base de datos en la nube.

---

## 🔧 Configuración Avanzada de Atlas

### Límites del Free Tier

- **Storage:** 512 MB
- **RAM compartido:** 512 MB
- **Conexiones simultáneas:** 500
- **No backups automáticos** en plan gratuito

### Habilitar Backups en Atlas (Plan Paid)

Si actualizas a plan pago (M10+):

1. Database → Cluster → "Backup" tab
2. Enable Cloud Backup
3. Configura retención:
   - Snapshots diarios: 7 días
   - Snapshots semanales: 4 semanas
   - Snapshots mensuales: 12 meses

### Monitoreo en Atlas

1. Ve a **Metrics** en tu cluster
2. Verás:
   - Operaciones por segundo
   - Conexiones activas
   - Uso de red
   - Uso de storage

### Alertas

1. Ve a **Alerts**
2. Crea alertas para:
   - Storage mayor a 80%
   - Conexiones cercanas al límite
   - Operaciones lentas

---

## 📊 Costos de MongoDB Atlas (2026)

| Plan | Storage | RAM | Precio/mes |
|------|---------|-----|------------|
| M0 (Free) | 512 MB | Shared | $0 |
| M10 | 10 GB | 2 GB | ~$57 |
| M20 | 20 GB | 4 GB | ~$114 |
| M30 | 40 GB | 8 GB | ~$227 |

Para la mayoría de talleres pequeños/medianos, el **Free tier (M0)** es suficiente.

---

## 🌐 Alternativa: Cada PC Independiente

Si NO quieres usar MongoDB Atlas, cada PC puede tener su propia base de datos local:

**Ventajas:**
- ✅ No necesita internet
- ✅ Velocidad máxima
- ✅ Sin límites de storage

**Desventajas:**
- ❌ Los datos NO se sincronizan entre PCs
- ❌ Cada PC tiene sus propios clientes y órdenes
- ❌ No sirve para trabajo colaborativo

**Configuración:**
```bash
# En cada PC
MONGODB_URI=mongodb://localhost:27017/minoil_db
```

Cada PC trabajará independientemente.

---

## Opción 3: Docker (Avanzado)

### 🎯 Concepto

Usar contenedores Docker para empaquetar la aplicación y MongoDB, facilitando el despliegue y la portabilidad.

```
┌─────────────────────────────────────────────┐
│  PC SERVIDOR (Docker Host)                  │
│  IP: 192.168.1.100                          │
│  ├─ Container 1: MongoDB                    │
│  │  └─ Puerto: 27017                        │
│  └─ Container 2: Next.js App                │
│     └─ Puerto: 3000                         │
└─────────────────────────────────────────────┘
             │
             │ Red Local
             │
    ┌────────┴────────┬──────────────┐
    │                 │              │
┌───▼────┐      ┌────▼───┐     ┌────▼────┐
│ PC 1   │      │ PC 2   │     │ PC 3    │
│ Chrome │      │ Chrome │     │ Chrome  │
└────────┘      └────────┘     └─────────┘
http://192.168.1.100:3000
```

### ✅ Ventajas
- ✅ Fácil despliegue y portabilidad
- ✅ Aislamiento del entorno
- ✅ Fácil actualización (rebuild imagen)
- ✅ Configuración reproducible
- ✅ Rollback rápido a versiones anteriores
- ✅ Ideal para producción

### ❌ Desventajas
- ❌ Requiere aprender Docker
- ❌ Overhead de recursos (mínimo)
- ❌ Más complejo para desarrollo

---

## 📝 Configuración Docker

### Paso 1: Instalar Docker

**Windows:**
1. Descarga Docker Desktop: https://www.docker.com/products/docker-desktop
2. Instala con opciones por defecto
3. Reinicia PC
4. Abre Docker Desktop para iniciarlo

**Linux (Ubuntu/Debian):**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

**macOS:**
1. Descarga Docker Desktop: https://www.docker.com/products/docker-desktop
2. Instala arrastrando a Applications
3. Abre Docker Desktop

### Paso 2: Crear Dockerfile

En la raíz del proyecto `Minoil/`, crea `Dockerfile`:

```dockerfile
# =============================================================================
# Dockerfile para Minoil - Next.js Application
# =============================================================================

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build de Next.js
RUN npm run build

# =============================================================================
# Etapa 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cambiar ownership
RUN chown -R nextjs:nodejs /app

# Usar usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
```

### Paso 3: Crear docker-compose.yml

En la raíz del proyecto, crea `docker-compose.yml`:

```yaml
# =============================================================================
# Docker Compose - Minoil Application
# =============================================================================
version: '3.8'

services:
  # MongoDB Service
  mongodb:
    image: mongo:7.0
    container_name: minoil-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: minoil_admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password_here
      MONGO_INITDB_DATABASE: minoil_db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - minoil-network

  # Next.js Application
  minoil-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: minoil-app
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://minoil_admin:secure_password_here@mongodb:27017/minoil_db?authSource=admin
      - FIREBASE_SERVICE_ACCOUNT_KEY=${FIREBASE_SERVICE_ACCOUNT_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    networks:
      - minoil-network
    volumes:
      - ./backups:/app/backups  # Para mantener backups fuera del contenedor

# Volúmenes persistentes
volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local

# Red privada
networks:
  minoil-network:
    driver: bridge
```

### Paso 4: Configurar .env para Docker

Crea `.env` (para Docker Compose):

```bash
# Firebase Service Account
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Gemini API
GEMINI_API_KEY=tu_api_key_aqui
```

### Paso 5: Actualizar next.config.js

Edita `next.config.js` para habilitar modo standalone:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... resto de la configuración
}

module.exports = nextConfig
```

### Paso 6: Construir y Ejecutar

```bash
# Construir imágenes
docker compose build

# Iniciar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Verificar que están corriendo
docker compose ps
```

### Paso 7: Acceder desde Red Local

**En el servidor:**
```
http://localhost:3000
```

**Desde otras PCs en la red:**
```
http://192.168.1.100:3000
```

---

## 🛠️ Comandos Útiles de Docker

### Gestión de Contenedores

```bash
# Ver contenedores corriendo
docker compose ps

# Ver logs
docker compose logs -f minoil-app
docker compose logs -f mongodb

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar TODO (incluyendo volúmenes)
docker compose down -v
```

### Actualizar la Aplicación

```bash
# 1. Detener servicios
docker compose down

# 2. Obtener último código
git pull

# 3. Reconstruir imagen
docker compose build --no-cache

# 4. Iniciar servicios
docker compose up -d
```

### Backup de MongoDB en Docker

```bash
# Exportar base de datos
docker exec minoil-mongodb mongodump --out=/tmp/backup --db=minoil_db

# Copiar backup al host
docker cp minoil-mongodb:/tmp/backup ./backup-$(date +%Y%m%d)

# Restaurar backup
docker exec minoil-mongodb mongorestore --db=minoil_db /tmp/backup/minoil_db
```

### Acceder al Shell de MongoDB

```bash
docker exec -it minoil-mongodb mongosh minoil_db
```

### Ver Uso de Recursos

```bash
# Uso de recursos por contenedor
docker stats

# Espacio en disco
docker system df
```

---

## 🔒 Seguridad en Docker

### 1. Usar Secrets para Contraseñas

En lugar de poner contraseñas en `docker-compose.yml`, usa Docker secrets:

```bash
# Crear secret
echo "secure_password_here" | docker secret create mongodb_password -

# Usar en compose (requiere Docker Swarm)
```

### 2. Limitar Recursos

Edita `docker-compose.yml` para limitar CPU/RAM:

```yaml
services:
  minoil-app:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

### 3. Red Aislada

Los contenedores ya usan una red privada (`minoil-network`). MongoDB NO está expuesto directamente a la red externa.

---

## 📊 Monitoreo Docker

### Logs Centralizados

```bash
# Logs en tiempo real
docker compose logs -f --tail=100

# Filtrar por servicio
docker compose logs -f minoil-app
```

### Health Checks

Agrega health checks en `docker-compose.yml`:

```yaml
services:
  minoil-app:
    # ...
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 🚀 Deploy en Servidor Dedicado

Si tienes un servidor Linux dedicado:

### 1. Configurar Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Configurar firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Clonar Proyecto

```bash
cd /opt
sudo git clone https://github.com/tu-usuario/minoil.git
cd minoil
```

### 3. Configurar Variables

```bash
sudo nano .env
# Agregar credenciales
```

### 4. Iniciar con Docker Compose

```bash
sudo docker compose up -d
```

### 5. Configurar Auto-restart

Docker Compose con `restart: always` ya maneja esto automáticamente.

---

## 🌐 Nginx Reverse Proxy (Opcional)

Para usar dominio y HTTPS:

### docker-compose.yml (actualizado)

```yaml
services:
  # ... MongoDB y minoil-app ...

  nginx:
    image: nginx:alpine
    container_name: minoil-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - minoil-app
    networks:
      - minoil-network
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream minoil {
        server minoil-app:3000;
    }

    server {
        listen 80;
        server_name minoil.tudominio.com;

        location / {
            proxy_pass http://minoil;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## Comparación de Opciones

| Característica | Opción 1: Servidor Local | Opción 2: MongoDB Atlas | Opción 3: Docker |
|---|---|---|---|
| **Complejidad** | Media | Baja | Alta |
| **Costo** | Hardware del servidor | Gratis hasta 512MB | Hardware del servidor |
| **Internet requerido** | ❌ No | ✅ Sí | ❌ No |
| **PC servidor 24/7** | ✅ Sí | ❌ No (cada PC independiente) | ✅ Sí |
| **Instalación por PC** | Solo navegador | Node + Proyecto completo | Solo navegador |
| **Velocidad** | ⚡ Rápida (LAN) | 🐢 Depende de internet | ⚡ Rápida (LAN) |
| **Backups** | Manuales/automáticos locales | Automáticos en Atlas (plan pago) | Volúmenes Docker + scripts |
| **Escalabilidad** | Limitada por hardware | Excelente (Atlas escala) | Buena (multi-container) |
| **Mantenimiento** | Manual | Automático (Atlas) | Manual pero simplificado |
| **Datos centralizados** | ✅ Sí | ✅ Sí | ✅ Sí |
| **Portabilidad** | Baja | Alta | Muy alta |
| **Para desarrollo** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Para producción** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Ideal para** | Oficinas 1-50 usuarios | Trabajo remoto/distribuido | Producción profesional |

---

## 🎯 Recomendación por Caso de Uso

### Caso 1: Taller Pequeño (1-10 usuarios, misma ubicación)
**Recomendación:** Opción 1 - Servidor Dedicado Local
- Rápido, simple, no necesita internet
- PC dedicada o cualquier PC disponible
- PM2 para mantener corriendo

### Caso 2: Taller Mediano (10-50 usuarios, misma ubicación)
**Recomendación:** Opción 3 - Docker
- Más profesional y mantenible
- Fácil de actualizar y hacer rollback
- Mejor aislamiento y seguridad

### Caso 3: Múltiples Ubicaciones / Trabajo Remoto
**Recomendación:** Opción 2 - MongoDB Atlas
- Accesible desde cualquier lugar
- No necesita infraestructura local
- Plan gratuito suficiente para empezar

### Caso 4: Híbrido (oficina principal + remoto ocasional)
**Recomendación:** Opción 3 (Docker) + VPN
- Servidor Docker en oficina principal
- VPN para acceso remoto seguro
- Best of both worlds

---

## 🔗 Recursos Adicionales

### Documentación Oficial
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Docker:** https://docs.docker.com/
- **PM2:** https://pm2.keymetrics.io/docs/usage/quick-start/

### Tutoriales Recomendados
- Desplegar Next.js con Docker: https://nextjs.org/docs/deployment#docker-image
- MongoDB Atlas Getting Started: https://www.mongodb.com/docs/atlas/getting-started/
- Docker Compose para aplicaciones full-stack: https://docs.docker.com/compose/

---

## 📞 Soporte y Próximos Pasos

1. ✅ Elige la opción que mejor se adapte a tu caso
2. ✅ Sigue la guía paso a paso de esa opción
3. ✅ Prueba desde otra PC en la red
4. ✅ Configura backups automáticos
5. ✅ Monitorea el uso y ajusta recursos si es necesario

Para cualquier problema, consulta la sección de **Troubleshooting** de cada opción.

---

**Última actualización:** Enero 14, 2026
**Versión:** 1.0
**Autor:** Facundo Mancuso

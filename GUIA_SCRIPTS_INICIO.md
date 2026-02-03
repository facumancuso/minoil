# 🚀 Guía de Scripts de Inicio - Minoil

Esta guía explica cómo usar los scripts `.bat` para iniciar Minoil de forma simple, sin necesidad de usar la consola.

---

## 📂 Scripts Disponibles

### 1. `INICIAR_MINOIL.bat` ⭐ **Recomendado para comenzar**

**Qué hace:**
- Verifica e inicia MongoDB
- Inicia el servidor en modo desarrollo
- Muestra la ventana de consola con logs

**Cómo usar:**
1. Doble click en el archivo
2. Espera 10-15 segundos
3. Abre tu navegador en: `http://localhost:3000`

**Ventajas:**
- Simple y directo
- Ves los logs en tiempo real
- Ideal para desarrollo y pruebas

**Desventajas:**
- La ventana debe permanecer abierta
- Si cierras la ventana, el servidor se detiene

---

### 2. `INICIAR_MINOIL_PRODUCCION.bat` ⚡ **Para uso diario**

**Qué hace:**
- Igual que el anterior pero en modo producción (más rápido)
- Compila el proyecto si no existe el build
- Inicia el servidor optimizado

**Cómo usar:**
1. Doble click en el archivo
2. Espera a que compile (solo la primera vez)
3. Abre navegador en: `http://localhost:3000`

**Cuándo usar:**
- Para uso diario en la oficina
- Cuando quieres máximo rendimiento
- Después de hacer cambios al código (recompila automáticamente)

---

### 3. `INICIAR_Y_ABRIR_NAVEGADOR.bat` 🌐 **El más fácil**

**Qué hace:**
- Inicia MongoDB
- Inicia el servidor
- **Abre el navegador automáticamente**
- Cierra la ventana de comando al terminar

**Cómo usar:**
1. Doble click en el archivo
2. Espera 15 segundos
3. El navegador se abre solo
4. ¡Listo para usar!

**Ideal para:**
- Usuarios que no son técnicos
- Inicio rápido sin complicaciones
- Acceso directo desde el escritorio

---

### 4. `INICIAR_MINOIL_OCULTO.vbs` 👻 **Modo invisible**

**Qué hace:**
- Inicia todo en segundo plano (sin ventanas)
- Muestra un mensaje pequeño de confirmación
- El servidor corre invisible

**Cómo usar:**
1. Doble click en el archivo
2. Verás un mensaje emergente
3. Espera 15-20 segundos
4. Abre navegador en: `http://localhost:3000`

**Ideal para:**
- Inicio automático con Windows
- Entorno limpio sin ventanas
- Usuarios finales

**Para configurar inicio automático:**
1. Presiona `Win + R`
2. Escribe: `shell:startup` y presiona Enter
3. Arrastra `INICIAR_MINOIL_OCULTO.vbs` a esa carpeta
4. Ahora Minoil se iniciará al encender la PC

---

### 5. `DETENER_MINOIL.bat` 🛑 **Detener servidor**

**Qué hace:**
- Detiene todos los procesos de Node.js
- Opcionalmente detiene MongoDB
- Cierre seguro de servicios

**Cómo usar:**
1. Doble click en el archivo
2. Confirma que quieres detener (S/N)
3. Opcionalmente detén MongoDB

**Cuándo usar:**
- Para cerrar el servidor de forma segura
- Antes de apagar la PC
- Al finalizar el día de trabajo

---

### 6. `INICIAR_CON_PM2.bat` 🔄 **Modo servidor permanente**

**Qué hace:**
- Instala PM2 (si no está instalado)
- Configura Minoil para correr permanentemente
- El servidor se reinicia automáticamente si hay errores
- Puede configurarse para iniciar con Windows

**Cómo usar:**
1. **Ejecutar como Administrador** (click derecho → "Ejecutar como administrador")
2. Sigue las instrucciones en pantalla
3. Cuando pregunte sobre inicio automático, elige S o N

**Ideal para:**
- PC servidor dedicada
- Entorno de producción
- Oficinas donde el servidor debe estar siempre disponible

**Comandos útiles después de configurar PM2:**
```bash
# Ver estado del servidor
pm2 list

# Ver logs en tiempo real
pm2 logs minoil

# Reiniciar servidor
pm2 restart minoil

# Detener servidor
pm2 stop minoil

# Eliminar de PM2
pm2 delete minoil
```

---

## 🎯 ¿Cuál Debo Usar?

### Para Desarrollo / Pruebas:
→ **`INICIAR_MINOIL.bat`**

### Para Uso Diario Personal:
→ **`INICIAR_Y_ABRIR_NAVEGADOR.bat`**

### Para PC Servidor (Red Local):
→ **`INICIAR_CON_PM2.bat`** (ejecutar una sola vez como Admin)

### Para Usuarios No Técnicos:
→ **`INICIAR_Y_ABRIR_NAVEGADOR.bat`** o **`INICIAR_MINOIL_OCULTO.vbs`**

---

## 📋 Crear Acceso Directo en el Escritorio

Para facilitar el acceso:

1. **Click derecho** en el script que quieras usar
2. Selecciona **"Crear acceso directo"**
3. Arrastra el acceso directo al escritorio
4. (Opcional) Click derecho → Propiedades → Cambiar icono

Ahora puedes iniciar Minoil con un simple doble click desde el escritorio.

---

## 🔧 Solución de Problemas

### "MongoDB no se pudo iniciar"
**Solución:**
- Ejecuta el script como Administrador (click derecho → Ejecutar como administrador)
- O inicia MongoDB manualmente primero: Abre CMD como Admin y ejecuta `net start MongoDB`

### "npm no se reconoce como comando"
**Solución:**
- Asegúrate de que Node.js esté instalado
- Reinicia la PC después de instalar Node.js
- Verifica con: `node --version` en CMD

### "Puerto 3000 ya está en uso"
**Solución:**
- Ejecuta `DETENER_MINOIL.bat` primero
- O abre el Administrador de Tareas y cierra todos los procesos "Node.js"

### La ventana se cierra inmediatamente
**Solución:**
- Haz click derecho en el archivo `.bat`
- Selecciona "Editar" para ver el error
- O abre CMD manualmente y ejecuta los comandos uno por uno

---

## 🔒 Permisos de Administrador

Algunos scripts pueden necesitar permisos de administrador, especialmente:
- `INICIAR_CON_PM2.bat`
- Scripts que inician MongoDB

**Para ejecutar como Administrador:**
1. Click derecho en el archivo
2. Selecciona "Ejecutar como administrador"

**Para que siempre se ejecute como Admin:**
1. Click derecho en el archivo → Crear acceso directo
2. Click derecho en el acceso directo → Propiedades
3. Click en "Avanzadas"
4. Marca "Ejecutar como administrador"
5. Aceptar

---

## 📦 Compartir con Otros Usuarios

Si quieres compartir la aplicación con otros usuarios en la red:

### Opción 1: Compartir script simple
Comparte `INICIAR_Y_ABRIR_NAVEGADOR.bat` con la nota:
```
"Doble click para iniciar Minoil"
```

### Opción 2: Servidor permanente
1. Configura PM2 en una PC servidor con `INICIAR_CON_PM2.bat`
2. Los demás usuarios solo abren el navegador en:
   ```
   http://192.168.1.XXX:3000
   ```
   (donde XXX es la IP del servidor)

---

## 🌐 Configurar para Red Local

Si quieres que otros en la red accedan:

1. **Ejecuta** `INICIAR_CON_PM2.bat` como Administrador
2. **Obtén tu IP local:**
   - Abre CMD
   - Ejecuta: `ipconfig`
   - Anota tu "Dirección IPv4" (ejemplo: 192.168.1.100)
3. **Configura el firewall:**
   - Abre PowerShell como Administrador
   - Ejecuta:
     ```powershell
     New-NetFirewallRule -DisplayName "Minoil" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
     ```
4. **Comparte la URL con tu equipo:**
   ```
   http://192.168.1.100:3000
   ```

---

## ⚙️ Personalizar Scripts

Los scripts son archivos de texto simples. Para editarlos:

1. Click derecho en el archivo `.bat`
2. Selecciona "Editar" o "Editar con Notepad"
3. Modifica según necesites
4. Guarda

**Ejemplo de personalización:**
- Cambiar el puerto (de 3000 a otro)
- Cambiar el tiempo de espera
- Agregar mensajes personalizados
- Abrir URLs específicas

---

## 📞 Soporte

Si tienes problemas con los scripts:

1. Revisa la sección "Solución de Problemas" arriba
2. Verifica que MongoDB y Node.js estén instalados correctamente
3. Intenta ejecutar los comandos manualmente en CMD para ver errores específicos
4. Consulta la [GUIA_INSTALACION_COMPLETA.md](GUIA_INSTALACION_COMPLETA.md)

---

## 🎉 Resumen Rápido

| Script | Para Qué | Ventana | Auto-abre Navegador |
|--------|----------|---------|---------------------|
| `INICIAR_MINOIL.bat` | Desarrollo | ✅ Visible | ❌ |
| `INICIAR_MINOIL_PRODUCCION.bat` | Producción | ✅ Visible | ❌ |
| `INICIAR_Y_ABRIR_NAVEGADOR.bat` | Uso fácil | ⚡ Se cierra | ✅ |
| `INICIAR_MINOIL_OCULTO.vbs` | Segundo plano | ❌ Oculta | ❌ |
| `INICIAR_CON_PM2.bat` | Servidor 24/7 | ✅ Inicial | ✅ |
| `DETENER_MINOIL.bat` | Detener todo | ✅ Visible | ❌ |

---

**Última actualización:** Enero 14, 2026
**Autor:** Facundo Mancuso

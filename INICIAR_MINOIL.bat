@echo off
REM =============================================================================
REM INICIAR MINOIL - Script de Inicio Simple
REM =============================================================================
REM Este script inicia MongoDB y luego la aplicación Minoil en modo desarrollo
REM Doble click para ejecutar
REM =============================================================================

title Minoil - Iniciando...

echo.
echo ========================================
echo   MINOIL - Sistema de Gestion
echo ========================================
echo.
echo Iniciando servicios...
echo.

REM Verificar si MongoDB está corriendo
echo [1/3] Verificando MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB no esta corriendo. Intentando iniciar...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: No se pudo iniciar MongoDB
        echo Por favor, inicia MongoDB manualmente o ejecuta como Administrador
        echo.
        pause
        exit /b 1
    )
    echo MongoDB iniciado correctamente!
) else (
    echo MongoDB ya esta corriendo
)

echo.
echo [2/3] Cambiando al directorio del proyecto...
cd /d "%~dp0"
echo Directorio: %CD%

echo.
echo [3/3] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo   Servidor iniciando...
echo   URL: http://localhost:3000
echo ========================================
echo.
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo La aplicacion se esta ejecutando aqui
echo.
echo Para detener el servidor: Presiona Ctrl+C
echo.

REM Iniciar servidor de desarrollo
npm run dev

REM Si npm run dev falla, mostrar mensaje
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar el servidor
    echo Verifica que Node.js este instalado y las dependencias esten instaladas
    echo Ejecuta: npm install
    echo.
    pause
)

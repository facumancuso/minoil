@echo off
REM =============================================================================
REM INICIAR MINOIL EN MODO PRODUCCION
REM =============================================================================
REM Este script inicia MongoDB y luego la aplicación Minoil en modo producción
REM Más rápido y optimizado que el modo desarrollo
REM =============================================================================

title Minoil - Modo Produccion

echo.
echo ========================================
echo   MINOIL - Modo Produccion
echo ========================================
echo.

REM Verificar si MongoDB está corriendo
echo [1/4] Verificando MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo MongoDB no esta corriendo. Intentando iniciar...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: No se pudo iniciar MongoDB
        echo Por favor, ejecuta este script como Administrador
        echo.
        pause
        exit /b 1
    )
    echo MongoDB iniciado correctamente!
) else (
    echo MongoDB ya esta corriendo
)

echo.
echo [2/4] Cambiando al directorio del proyecto...
cd /d "%~dp0"
echo Directorio: %CD%

echo.
echo [3/4] Verificando si existe build de produccion...
if not exist ".next" (
    echo No se encontro build de produccion. Compilando...
    echo Esto puede tomar 1-2 minutos...
    npm run build
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: No se pudo compilar el proyecto
        echo.
        pause
        exit /b 1
    )
) else (
    echo Build encontrado
)

echo.
echo [4/4] Iniciando servidor de produccion...
echo.
echo ========================================
echo   Servidor iniciado!
echo   URL: http://localhost:3000
echo ========================================
echo.
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo.
echo Para detener el servidor: Presiona Ctrl+C
echo.

REM Iniciar servidor de producción
npm start

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar el servidor
    echo.
    pause
)

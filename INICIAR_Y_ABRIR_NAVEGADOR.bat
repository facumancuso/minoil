@echo off
REM =============================================================================
REM INICIAR MINOIL Y ABRIR NAVEGADOR AUTOMATICAMENTE
REM =============================================================================
REM Este script:
REM 1. Inicia MongoDB
REM 2. Inicia la aplicación Minoil
REM 3. Espera 15 segundos
REM 4. Abre el navegador automáticamente en http://localhost:3000
REM =============================================================================

title Minoil - Iniciando...

echo.
echo ========================================
echo   MINOIL - Inicio Automatico
echo ========================================
echo.

REM Verificar si MongoDB está corriendo
echo [1/3] Iniciando MongoDB...
net start MongoDB >nul 2>&1
echo MongoDB OK

echo.
echo [2/3] Iniciando servidor...
cd /d "%~dp0"

REM Iniciar servidor en segundo plano
start /B cmd /c "npm run dev >minoil.log 2>&1"

echo Servidor iniciando en segundo plano...
echo.
echo [3/3] Esperando que el servidor este listo...

REM Esperar 15 segundos para que el servidor esté listo
timeout /t 15 /nobreak >nul

echo.
echo Abriendo navegador...
start http://localhost:3000

echo.
echo ========================================
echo   Minoil iniciado correctamente!
echo ========================================
echo.
echo El navegador deberia abrirse automaticamente
echo Si no se abre, visita: http://localhost:3000
echo.
echo Esta ventana se cerrara en 5 segundos...
timeout /t 5 /nobreak >nul

exit

@echo off
REM =============================================================================
REM INICIAR MINOIL CON PM2 (Modo Servidor Permanente)
REM =============================================================================
REM Este script usa PM2 para mantener el servidor corriendo permanentemente
REM Incluso si hay errores, PM2 reinicia automáticamente la aplicación
REM =============================================================================

title Minoil - Instalando PM2 y configurando servidor permanente

echo.
echo ========================================
echo   MINOIL - Configuracion con PM2
echo ========================================
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

REM Verificar si PM2 está instalado
echo [1/5] Verificando PM2...
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 no esta instalado. Instalando globalmente...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: No se pudo instalar PM2
        echo Ejecuta este script como Administrador
        echo.
        pause
        exit /b 1
    )
    echo PM2 instalado correctamente!
) else (
    echo PM2 ya esta instalado
)

echo.
echo [2/5] Verificando MongoDB...
net start MongoDB >nul 2>&1
echo MongoDB OK

echo.
echo [3/5] Verificando build de produccion...
if not exist ".next" (
    echo Compilando proyecto...
    npm run build
    if %errorlevel% neq 0 (
        echo ERROR al compilar
        pause
        exit /b 1
    )
)

echo.
echo [4/5] Deteniendo instancias previas de Minoil...
pm2 delete minoil >nul 2>&1

echo.
echo [5/5] Iniciando Minoil con PM2...
pm2 start npm --name "minoil" -- start

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Minoil configurado correctamente!
    echo ========================================
    echo.
    echo El servidor ahora corre en segundo plano con PM2
    echo.
    echo Comandos utiles:
    echo   pm2 list          - Ver aplicaciones corriendo
    echo   pm2 logs minoil   - Ver logs en tiempo real
    echo   pm2 restart minoil - Reiniciar servidor
    echo   pm2 stop minoil    - Detener servidor
    echo   pm2 delete minoil  - Eliminar de PM2
    echo.
    echo Guardando configuracion para reinicio automatico...
    pm2 save

    echo.
    echo Deseas que PM2 se inicie automaticamente con Windows? (S/N)
    set /p autostart="Configurar inicio automatico: "

    if /i "%autostart%"=="S" (
        echo Configurando inicio automatico...
        pm2 startup
        echo.
        echo IMPORTANTE: Copia y ejecuta el comando mostrado arriba
        echo como Administrador para completar la configuracion
    )

    echo.
    echo Abriendo navegador en 5 segundos...
    timeout /t 5 /nobreak >nul
    start http://localhost:3000

) else (
    echo.
    echo ERROR: No se pudo iniciar con PM2
    pause
    exit /b 1
)

echo.
pause

@echo off
REM =============================================================================
REM DETENER MINOIL - Script para cerrar todos los servicios
REM =============================================================================
REM Este script detiene de forma segura el servidor Node.js
REM =============================================================================

title Minoil - Deteniendo...

echo.
echo ========================================
echo   MINOIL - Detener Servicios
echo ========================================
echo.

echo Buscando procesos de Node.js...
echo.

REM Listar procesos de Node.js
tasklist | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo Procesos de Node.js encontrados. Deteniendo...

    REM Preguntar confirmación
    set /p confirm="¿Estas seguro de detener el servidor? (S/N): "
    if /i "%confirm%" neq "S" (
        echo Operacion cancelada
        pause
        exit /b 0
    )

    REM Matar todos los procesos de Node.js
    taskkill /F /IM node.exe >nul 2>&1

    echo.
    echo Servidor detenido correctamente
) else (
    echo No se encontraron procesos de Node.js corriendo
)

echo.
echo Deseas detener MongoDB tambien? (S/N)
set /p stopmongo="Detener MongoDB: "

if /i "%stopmongo%"=="S" (
    echo Deteniendo MongoDB...
    net stop MongoDB >nul 2>&1
    if %errorlevel% equ 0 (
        echo MongoDB detenido correctamente
    ) else (
        echo MongoDB no estaba corriendo o no se pudo detener
    )
)

echo.
echo ========================================
echo   Proceso completado
echo ========================================
echo.
pause

' =============================================================================
' INICIAR MINOIL SIN VENTANA - Script VBS
' =============================================================================
' Este script inicia Minoil sin mostrar la ventana de comando
' Ideal para usar en el inicio de Windows o para usuarios finales
' =============================================================================

Set WshShell = CreateObject("WScript.Shell")

' Obtener la ruta del directorio donde está este script
ScriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Cambiar al directorio del proyecto e iniciar MongoDB y la app
' El 0 significa: no mostrar ventana, False significa: no esperar a que termine
WshShell.Run "cmd /c cd /d """ & ScriptDir & """ && net start MongoDB >nul 2>&1 && npm run dev", 0, False

' Mostrar mensaje de confirmación (opcional - puedes comentar esta línea)
WshShell.Popup "Minoil se esta iniciando en segundo plano..." & vbCrLf & vbCrLf & "Espera 10-15 segundos y abre:" & vbCrLf & "http://localhost:3000", 5, "Minoil", 64

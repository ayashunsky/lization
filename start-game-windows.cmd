@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "URL=http://127.0.0.1:8765/"
set "LOG_FILE=%ROOT_DIR%tools\serve-local.log"

start "Schtroumpfilization Server" /min cmd /c ""%ROOT_DIR%tools\serve-local-windows.cmd" > "%LOG_FILE%" 2>&1"

ping 127.0.0.1 -n 2 >nul

start "" "%URL%"

exit /b 0

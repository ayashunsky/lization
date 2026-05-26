@echo off
setlocal

set "ROOT_DIR=%~dp0.."
set "GAME_DIR=%ROOT_DIR%\game"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%ROOT_DIR%\tools\serve_local.py" --host 127.0.0.1 --port 8765 --root "%GAME_DIR%" %*
  exit /b %ERRORLEVEL%
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  python "%ROOT_DIR%\tools\serve_local.py" --host 127.0.0.1 --port 8765 --root "%GAME_DIR%" %*
  exit /b %ERRORLEVEL%
)

echo Python 3 not found. Install Python and try again.
exit /b 1

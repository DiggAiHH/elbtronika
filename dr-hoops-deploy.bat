@echo off
REM Dr. Hoops — One-Click Deploy Bundle
REM Doppelklick = ZIP fuer Netlify Drop
REM Oeffnet danach Netlify Drop im Browser

setlocal
set ROOT=D:\Elbtronika\Elbtonika

echo.
echo === Dr. Hoops Bundle Builder ===
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\dr-hoops-deploy.ps1"
if errorlevel 1 (
  echo.
  echo [ERR] PowerShell-Script fehlgeschlagen.
  pause
  exit /b 1
)

echo.
echo === Oeffne Netlify Drop ===
start "" "https://app.netlify.com/drop"

echo.
echo === Oeffne ZIP-Ordner ===
start "" "%ROOT%"

echo.
echo Drag dr-hoops-site.zip in die Browser-Drop-Zone.
echo Site-Name in Netlify aendern auf: dr-hoops-elbtronika
echo Domain alias hinzufuegen: dr-hoops.elbtronika.de
echo.
pause
endlocal

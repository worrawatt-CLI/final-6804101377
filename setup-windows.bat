@echo off
REM Double-click this file (inside the final-exam folder) to install and run the exam project on Windows 11
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-windows.ps1" -RunTests
echo.
pause

@echo off
setlocal

set "PYTHON=C:\Users\A\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not exist "%PYTHON%" set "PYTHON=python"

echo ComPASS local server: http://localhost:5173
"%PYTHON%" -m http.server 5173

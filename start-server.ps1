$python = "C:\Users\A\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if (-not (Test-Path $python)) {
  $python = "python"
}

Write-Host "ComPASS local server: http://localhost:5173"
& $python -m http.server 5173

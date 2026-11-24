$ErrorActionPreference = 'Stop'
$workspace = $PSScriptRoot
$runtime = 'D:\codex-runtime\prasunex-innovathon-2026'
$frontend = Join-Path $workspace 'frontend'
$python = Join-Path $workspace '.venv\Scripts\python.exe'

# Keep Next.js source and dependencies on the same drive on low-space machines.
if (Test-Path "$runtime\node_modules\next\dist\bin\next") {
    $frontend = Join-Path $runtime 'frontend'
    New-Item -ItemType Directory -Force -Path $frontend | Out-Null
    Get-ChildItem (Join-Path $workspace 'frontend') -Force |
        Where-Object { $_.Name -notin @('node_modules', '.next') } |
        Copy-Item -Destination $frontend -Recurse -Force
    $python = Join-Path $runtime 'venv\Scripts\python.exe'
    $env:TEMP = Join-Path $runtime 'temp'
    $env:TMP = $env:TEMP
}
if (-not (Test-Path $python)) { $python = (Get-Command python).Source }
$next = Join-Path $frontend 'node_modules\next\dist\bin\next'
if (-not (Test-Path $next)) {
    $next = Join-Path $runtime 'node_modules\next\dist\bin\next'
}
if (-not (Test-Path $next)) { throw 'Frontend dependencies missing. Install them before starting.' }

if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $python -ArgumentList '-m uvicorn app.main:app --host 0.0.0.0 --port 8000' -WorkingDirectory (Join-Path $workspace 'backend') -WindowStyle Hidden
}
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath (Get-Command node).Source -ArgumentList "`"$next`" dev --hostname 0.0.0.0" -WorkingDirectory $frontend -WindowStyle Hidden
}
Write-Host 'App: http://localhost:3000'
Write-Host 'API: http://localhost:8000/docs'

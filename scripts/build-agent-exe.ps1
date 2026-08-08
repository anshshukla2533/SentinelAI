param(
    [string]$Python = "python"
)

$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

try {
    & $Python -m PyInstaller --version | Out-Null
} catch {
    Write-Host "PyInstaller not found. Installing into the current Python environment..."
    & $Python -m pip install pyinstaller
}

$distPath = Join-Path $PWD "agent\dist"
$workPath = Join-Path $PWD "agent\build"
$specPath = Join-Path $PWD "agent\build"

& $Python -m PyInstaller `
    --clean `
    --noconfirm `
    --onefile `
    --console `
    --name "sentinel-agent" `
    --distpath $distPath `
    --workpath $workPath `
    --specpath $specPath `
    "agent\agent.py"

$exePath = Join-Path $distPath "sentinel-agent.exe"

if (-not (Test-Path $exePath)) {
    throw "Expected executable was not created: $exePath"
}

Write-Host "Built executable: $exePath"

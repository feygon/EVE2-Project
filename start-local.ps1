# Quick start script for local development
# Usage: .\start-local.ps1 [port]

param(
    [int]$Port = 3000
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting RealFeygon.com Locally" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "??  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if MariaDB is running
Write-Host "Checking MariaDB..." -ForegroundColor Cyan
$mysqldProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue

if (-not $mysqldProcess) {
    Write-Host "??  MariaDB is not running. Starting it..." -ForegroundColor Yellow
    
    # Start MariaDB
    try {
        Start-Process -FilePath "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" -ArgumentList "--console" -WindowStyle Hidden
        Write-Host "   Waiting for MariaDB to start..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
        
        # Verify it started
        $mysqldProcess = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
        if ($mysqldProcess) {
            Write-Host "? MariaDB started successfully" -ForegroundColor Green
        } else {
            Write-Host "? Failed to start MariaDB" -ForegroundColor Red
            Write-Host "   Try starting it manually or check if it's installed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "? Error starting MariaDB: $_" -ForegroundColor Red
        Write-Host "   The app may not work without database access" -ForegroundColor Yellow
    }
} else {
    Write-Host "? MariaDB is already running" -ForegroundColor Green
}
Write-Host ""

# Check if local config files exist
$useLocalConfig = $false
if ((Test-Path "dbcon.local.js") -and (Test-Path "dbcon_illusion.local.js")) {
    Write-Host "? Local config files found" -ForegroundColor Green
    $useLocalConfig = $true
} else {
    Write-Host "??  Local config files not found" -ForegroundColor Yellow
    Write-Host "   Using environment variables from .env file" -ForegroundColor Yellow
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "? .env file found" -ForegroundColor Green
} else {
    Write-Host "??  .env file not found" -ForegroundColor Yellow
    Write-Host "   Database connections may fail without credentials" -ForegroundColor Yellow
    Write-Host "   Run setup-env.ps1 to create .env file" -ForegroundColor Yellow
}
Write-Host ""

# Start the server
Write-Host "Starting server on port $Port..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Server will be available at:" -ForegroundColor Green
Write-Host "  http://localhost:$Port" -ForegroundColor White
Write-Host "  http://localhost:$Port/resume" -ForegroundColor White
Write-Host "  http://localhost:$Port/eve2" -ForegroundColor White
Write-Host "  http://localhost:$Port/illusion" -ForegroundColor White
Write-Host ""
Write-Host "BurnRate (Nickerson) routes:" -ForegroundColor Green
Write-Host "  http://localhost:$Port/Nickerson/              Scenarios overview" -ForegroundColor White
Write-Host "  http://localhost:$Port/Nickerson/scenario/:id  Scenario detail + projections" -ForegroundColor White
Write-Host "  POST /Nickerson/scenario/:id/param             Update slider parameter" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenario/:id/update-ltc        Update LTC trigger year" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenario/:id/update-memory-care  Update MC start year" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenario/:id/update-managed-ira  Update managed IRA start" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenario/:id/update-parameter    Update checkbox/toggle" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenario/:id/update-year-of-passing  Update year of passing" -ForegroundColor DarkGray
Write-Host "  POST /Nickerson/scenarios/metrics               Batch metrics for overview cards" -ForegroundColor DarkGray
Write-Host ""

# Ensure tmp directory and restart sentinel exist
if (-not (Test-Path "tmp")) { New-Item -ItemType Directory -Path "tmp" | Out-Null }
if (-not (Test-Path "tmp/restart.txt")) { "" | Out-File -FilePath "tmp/restart.txt" }
$restartFile = (Resolve-Path "tmp/restart.txt").Path
$lastRestart = (Get-Item $restartFile).LastWriteTime

Write-Host "  Restart hook: touch tmp/restart.txt to restart server" -ForegroundColor DarkGray
Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

# Run server with restart loop.
# Exit code 75 = restart requested (from POST /Nickerson/restart).
# Any other exit = stop.
while ($true) {
    node main.js $Port
    $exitCode = $LASTEXITCODE
    if ($exitCode -eq 75) {
        Write-Host ""
        Write-Host "[restart] Server restart requested - restarting..." -ForegroundColor Yellow
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host ""
        Write-Host "Server stopped (exit code: $exitCode)." -ForegroundColor Cyan
        break
    }
}

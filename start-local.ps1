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

try {
    node main.js $Port
} catch {
    Write-Host ""
    Write-Host "? Server stopped with error: $_" -ForegroundColor Red
    exit 1
}

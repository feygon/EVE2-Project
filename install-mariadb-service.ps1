# Install MariaDB as Windows Service
# Run this script as Administrator

Write-Host "Installing MariaDB 12.1 as Windows Service..." -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Define paths
$mariadbBin = "C:\Program Files\MariaDB 12.1\bin"
$mariadbData = "C:\Program Files\MariaDB 12.1\data"

# Check if MariaDB is installed
if (-not (Test-Path "$mariadbBin\mysqld.exe")) {
    Write-Host "ERROR: MariaDB not found at expected location!" -ForegroundColor Red
    exit 1
}

# Check if service already exists
$existingService = Get-Service -Name "MariaDB" -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "MariaDB service already exists. Removing old service..." -ForegroundColor Yellow
    Stop-Service -Name "MariaDB" -Force -ErrorAction SilentlyContinue
    & "$mariadbBin\mysqld.exe" --remove MariaDB
    Start-Sleep -Seconds 2
}

# Install MariaDB as a service
Write-Host "Installing MariaDB service..." -ForegroundColor Green
& "$mariadbBin\mysqld.exe" --install MariaDB --defaults-file="$mariadbData\my.ini"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install MariaDB service!" -ForegroundColor Red
    exit 1
}

# Start the service
Write-Host "Starting MariaDB service..." -ForegroundColor Green
Start-Service -Name "MariaDB"

# Wait a moment for service to start
Start-Sleep -Seconds 3

# Check service status
$service = Get-Service -Name "MariaDB"

if ($service.Status -eq "Running") {
    Write-Host "`n? SUCCESS! MariaDB is now running as a Windows service." -ForegroundColor Green
    Write-Host "`nService Details:" -ForegroundColor Cyan
    $service | Format-Table Name, DisplayName, Status, StartType
    
    Write-Host "You can now:" -ForegroundColor Yellow
    Write-Host "  - Connect to MariaDB: mysql -u root -p" -ForegroundColor White
    Write-Host "  - Stop service: Stop-Service MariaDB" -ForegroundColor White
    Write-Host "  - Start service: Start-Service MariaDB" -ForegroundColor White
    Write-Host "  - Check status: Get-Service MariaDB" -ForegroundColor White
} else {
    Write-Host "`n? ERROR: Service installed but not running!" -ForegroundColor Red
    Write-Host "Status: $($service.Status)" -ForegroundColor Yellow
    Write-Host "`nTry starting manually: Start-Service MariaDB" -ForegroundColor Yellow
}

Write-Host "`n? Installation complete!" -ForegroundColor Cyan

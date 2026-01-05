# Database Backup and Restore Script
# Usage: 
#   Backup: .\db-tools.ps1 backup
#   Restore: .\db-tools.ps1 restore

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "restore")]
    [string]$Action
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "database_backups"

# Function to find MySQL installation
function Find-MySQLPath {
    $possiblePaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin",
        "C:\Program Files\MySQL\MySQL Server 8.1\bin",
        "C:\Program Files\MySQL\MySQL Server 8.2\bin",
        "C:\Program Files\MySQL\MySQL Server 8.3\bin",
        "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin",
        "C:\xampp\mysql\bin",
        "C:\wamp64\bin\mysql\mysql8.0.27\bin",
        "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path (Join-Path $path "mysqldump.exe")) {
            Write-Host "Found MySQL at: $path" -ForegroundColor Green
            return $path
        }
    }
    
    return $null
}

# Find MySQL binaries
$mysqlPath = Find-MySQLPath

if (-not $mysqlPath) {
    Write-Host "================================" -ForegroundColor Red
    Write-Host "ERROR: MySQL Not Found" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Could not locate MySQL installation." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please enter the path to your MySQL bin directory:" -ForegroundColor Cyan
    Write-Host "Example: C:\Program Files\MySQL\MySQL Server 8.0\bin" -ForegroundColor Gray
    Write-Host ""
    $mysqlPath = Read-Host "MySQL bin path"
    
    if (-not (Test-Path (Join-Path $mysqlPath "mysqldump.exe"))) {
        Write-Host ""
        Write-Host "Invalid path or mysqldump.exe not found!" -ForegroundColor Red
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Set full paths to MySQL utilities
$mysqldump = Join-Path $mysqlPath "mysqldump.exe"
$mysql = Join-Path $mysqlPath "mysql.exe"

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Database Tools" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($Action -eq "backup") {
    Write-Host "Creating database backups..." -ForegroundColor Green
    Write-Host ""
    
    # Get MySQL credentials
    Write-Host "Enter MySQL username (default: root):" -ForegroundColor Cyan
    $username = Read-Host
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = "root"
    }
    
    Write-Host "Enter MySQL password:" -ForegroundColor Cyan
    $password = Read-Host -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    # Backup EVE2 database
    Write-Host ""
    Write-Host "Backing up EVE2 database..." -ForegroundColor Cyan
    $eve2BackupFile = Join-Path $backupDir "eve2_backup_$timestamp.sql"
    
    try {
        & $mysqldump -u $username -p"$passwordPlain" realfey_realfey_eve2_project | Out-File -FilePath $eve2BackupFile -Encoding UTF8
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "? EVE2 database backed up to: $eve2BackupFile" -ForegroundColor Green
        } else {
            Write-Host "? Failed to backup EVE2 database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        Write-Host "? Failed to backup EVE2 database: $_" -ForegroundColor Red
    }
    
    # Backup Illusion database
    Write-Host ""
    Write-Host "Backing up Illusion Spells database..." -ForegroundColor Cyan
    $illusionBackupFile = Join-Path $backupDir "illusion_backup_$timestamp.sql"
    
    try {
        & $mysqldump -u $username -p"$passwordPlain" realfey_illusion_spells_DB | Out-File -FilePath $illusionBackupFile -Encoding UTF8
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "? Illusion Spells database backed up to: $illusionBackupFile" -ForegroundColor Green
        } else {
            Write-Host "? Failed to backup Illusion Spells database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
        }
    } catch {
        Write-Host "? Failed to backup Illusion Spells database: $_" -ForegroundColor Red
    }
    
    # Backup Animals database (if exists)
    Write-Host ""
    Write-Host "Backing up Animals database..." -ForegroundColor Cyan
    $animalsBackupFile = Join-Path $backupDir "animals_backup_$timestamp.sql"
    
    try {
        & $mysqldump -u $username -p"$passwordPlain" realfey_animals_db 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            & $mysqldump -u $username -p"$passwordPlain" realfey_animals_db | Out-File -FilePath $animalsBackupFile -Encoding UTF8
            Write-Host "? Animals database backed up to: $animalsBackupFile" -ForegroundColor Green
        } else {
            Write-Host "? Animals database not found (skipped)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "? Animals database backup skipped: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Backup complete!" -ForegroundColor Green
    Write-Host "Backup files are in: $backupDir" -ForegroundColor Cyan
    
} elseif ($Action -eq "restore") {
    Write-Host "Database Restore" -ForegroundColor Green
    Write-Host ""
    
    # List available backups
    $backupFiles = Get-ChildItem -Path $backupDir -Filter "*.sql" | Sort-Object LastWriteTime -Descending
    
    if ($backupFiles.Count -eq 0) {
        Write-Host "? No backup files found in $backupDir" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Available backup files:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $backupFiles.Count; $i++) {
        $file = $backupFiles[$i]
        $size = "{0:N2} MB" -f ($file.Length / 1MB)
        Write-Host "  [$i] $($file.Name) - $($file.LastWriteTime) ($size)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Enter the number of the backup file to restore:" -ForegroundColor Yellow
    $choice = Read-Host
    
    if ($choice -match '^\d+$' -and [int]$choice -ge 0 -and [int]$choice -lt $backupFiles.Count) {
        $selectedFile = $backupFiles[[int]$choice]
        Write-Host ""
        Write-Host "Selected: $($selectedFile.Name)" -ForegroundColor Cyan
        
        # Determine which database
        $database = ""
        if ($selectedFile.Name -like "*eve2*") {
            $database = "realfey_realfey_eve2_project"
            $defaultUser = "realfey_realfey_realfeyuser"
        } elseif ($selectedFile.Name -like "*illusion*") {
            $database = "realfey_illusion_spells_DB"
            $defaultUser = "realfey_illusion_spells_DB"
        } elseif ($selectedFile.Name -like "*animals*") {
            $database = "realfey_animals_db"
            $defaultUser = "realfey_animals_user"
        } else {
            Write-Host "?  Cannot determine database from filename" -ForegroundColor Yellow
            Write-Host "Enter database name:" -ForegroundColor Cyan
            $database = Read-Host
            $defaultUser = "root"
        }
        
        Write-Host ""
        Write-Host "??  WARNING: This will OVERWRITE the current database!" -ForegroundColor Yellow
        Write-Host "Database: $database" -ForegroundColor Yellow
        Write-Host "Continue? (yes/no)" -ForegroundColor Yellow
        $confirm = Read-Host
        
        if ($confirm -eq "yes") {
            Write-Host ""
            Write-Host "Enter MySQL username (default: $defaultUser):" -ForegroundColor Cyan
            $username = Read-Host
            if ([string]::IsNullOrWhiteSpace($username)) {
                $username = $defaultUser
            }
            
            Write-Host "Enter MySQL password:" -ForegroundColor Cyan
            $password = Read-Host -AsSecureString
            $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            
            Write-Host ""
            Write-Host "Restoring database..." -ForegroundColor Cyan
            
            try {
                Get-Content $selectedFile.FullName | & $mysql -u $username -p"$passwordPlain" $database
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "? Database restored successfully!" -ForegroundColor Green
                } else {
                    Write-Host "? Failed to restore database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
                }
            } catch {
                Write-Host "? Failed to restore database: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "Restore cancelled" -ForegroundColor Yellow
        }
    } else {
        Write-Host "? Invalid selection" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

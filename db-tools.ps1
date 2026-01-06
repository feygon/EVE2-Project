# Database Backup and Restore Script
# Usage: 
#   Backup: .\db-tools.ps1 backup
#   Restore: .\db-tools.ps1 restore
#
# Notes:
#   - Illusion Spells DB is the primary local database (always backed up)
#   - EVE2 and Animals DBs are optional (might only exist in production)
#   - Each database can have different credentials
#   - Backups are saved to database_backups/ directory with timestamp

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
        # MariaDB paths (your system!)
        "C:\Program Files\MariaDB 12.1\bin",
        "C:\Program Files\MariaDB 11.0\bin",
        "C:\Program Files\MariaDB 10.11\bin",
        "C:\Program Files (x86)\MariaDB 12.1\bin",
        # MySQL paths
        "C:\Program Files\MySQL\MySQL Server 8.0\bin",
        "C:\Program Files\MySQL\MySQL Server 8.1\bin",
        "C:\Program Files\MySQL\MySQL Server 8.2\bin",
        "C:\Program Files\MySQL\MySQL Server 8.3\bin",
        "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin",
        # XAMPP, WAMP, Laragon
        "C:\xampp\mysql\bin",
        "C:\wamp64\bin\mysql\mysql8.0.27\bin",
        "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path (Join-Path $path "mysqldump.exe")) {
            Write-Host "Found MySQL/MariaDB at: $path" -ForegroundColor Green
            return $path
        }
    }
    
    return $null
}

# Function to get database credentials
function Get-DBCredentials {
    param(
        [string]$DatabaseName,
        [string]$DefaultUser = "root"
    )
    
    Write-Host ""
    Write-Host "=== Credentials for $DatabaseName ===" -ForegroundColor Cyan
    Write-Host "Enter MySQL username (default: $DefaultUser):" -ForegroundColor Cyan
    $username = Read-Host
    if ([string]::IsNullOrWhiteSpace($username)) {
        $username = $DefaultUser
    }
    
    Write-Host "Enter MySQL password for $username@$DatabaseName" -ForegroundColor Cyan
    $password = Read-Host -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    return @{
        Username = $username
        Password = $passwordPlain
    }
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
    Write-Host "NOTE: Each database may have different credentials." -ForegroundColor Yellow
    Write-Host "You will be prompted for credentials for each database." -ForegroundColor Yellow
    Write-Host ""
    
    # Backup EVE2 database (optional - might not exist locally)
    Write-Host "--- Checking for EVE2 database ---" -ForegroundColor Cyan
    Write-Host "Do you want to backup EVE2 database? (y/n) [n]:" -ForegroundColor Yellow
    $backupEve2 = Read-Host
    
    if ($backupEve2 -eq "y") {
        $eve2BackupFile = Join-Path $backupDir "eve2_backup_$timestamp.sql"
        $eve2Creds = Get-DBCredentials -DatabaseName "EVE2 (realfey_realfey_eve2_project)" -DefaultUser "realfey_realfey_realfeyuser"
        
        try {
            & $mysqldump -u $eve2Creds.Username -p"$($eve2Creds.Password)" realfey_realfey_eve2_project | Out-File -FilePath $eve2BackupFile -Encoding UTF8
            
            if ($LASTEXITCODE -eq 0) {
                $fileSize = "{0:N2} MB" -f ((Get-Item $eve2BackupFile).Length / 1MB)
                Write-Host "? EVE2 database backed up to: $eve2BackupFile ($fileSize)" -ForegroundColor Green
            } else {
                Write-Host "? Failed to backup EVE2 database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
                Write-Host "  Database may not exist locally" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "? Failed to backup EVE2 database: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "? EVE2 database backup skipped" -ForegroundColor Yellow
    }
    
    # Backup Illusion database (primary local database)
    Write-Host ""
    Write-Host "--- Backing up Illusion Spells database ---" -ForegroundColor Cyan
    $illusionBackupFile = Join-Path $backupDir "illusion_backup_$timestamp.sql"
    $illusionCreds = Get-DBCredentials -DatabaseName "Illusion Spells (realfey_illusion_spells_DB)" -DefaultUser "realfey_illusion_spells_DB"
    
    try {
        & $mysqldump -u $illusionCreds.Username -p"$($illusionCreds.Password)" realfey_illusion_spells_DB | Out-File -FilePath $illusionBackupFile -Encoding UTF8
        
        if ($LASTEXITCODE -eq 0) {
            $fileSize = "{0:N2} MB" -f ((Get-Item $illusionBackupFile).Length / 1MB)
            Write-Host "? Illusion Spells database backed up to: $illusionBackupFile ($fileSize)" -ForegroundColor Green
        } else {
            Write-Host "? Failed to backup Illusion Spells database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
            Write-Host "  Check username/password for Illusion database" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "? Failed to backup Illusion Spells database: $_" -ForegroundColor Red
    }
    
    # Backup Animals database (optional - future use)
    Write-Host ""
    Write-Host "--- Checking for Animals database ---" -ForegroundColor Cyan
    Write-Host "Do you want to backup Animals database? (y/n) [n]:" -ForegroundColor Yellow
    $backupAnimals = Read-Host
    
    if ($backupAnimals -eq "y") {
        $animalsBackupFile = Join-Path $backupDir "animals_backup_$timestamp.sql"
        $animalsCreds = Get-DBCredentials -DatabaseName "Animals (realfey_animals_db)" -DefaultUser "root"
        
        try {
            & $mysqldump -u $animalsCreds.Username -p"$($animalsCreds.Password)" realfey_animals_db | Out-File -FilePath $animalsBackupFile -Encoding UTF8
            
            if ($LASTEXITCODE -eq 0) {
                $fileSize = "{0:N2} MB" -f ((Get-Item $animalsBackupFile).Length / 1MB)
                Write-Host "? Animals database backed up to: $animalsBackupFile ($fileSize)" -ForegroundColor Green
            } else {
                Write-Host "? Failed to backup Animals database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
                Write-Host "  Database may not exist locally" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "? Failed to backup Animals database: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "? Animals database backup skipped" -ForegroundColor Yellow
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
        $defaultUser = "root"
        
        if ($selectedFile.Name -like "*eve2*") {
            $database = "realfey_realfey_eve2_project"
            $defaultUser = "realfey_realfey_realfeyuser"
            $dbDisplayName = "EVE2"
        } elseif ($selectedFile.Name -like "*illusion*") {
            $database = "realfey_illusion_spells_DB"
            $defaultUser = "realfey_illusion_spells_DB"
            $dbDisplayName = "Illusion Spells"
        } elseif ($selectedFile.Name -like "*animals*") {
            $database = "realfey_animals_db"
            $defaultUser = "realfey_animals_user"
            $dbDisplayName = "Animals"
        } else {
            Write-Host "?  Cannot determine database from filename" -ForegroundColor Yellow
            Write-Host "Enter database name:" -ForegroundColor Cyan
            $database = Read-Host
            $dbDisplayName = $database
            $defaultUser = "root"
        }
        
        Write-Host ""
        Write-Host "??  WARNING: This will OVERWRITE the current database!" -ForegroundColor Yellow
        Write-Host "Database: $database" -ForegroundColor Yellow
        Write-Host "Continue? (yes/no)" -ForegroundColor Yellow
        $confirm = Read-Host
        
        if ($confirm -eq "yes") {
            $restoreCreds = Get-DBCredentials -DatabaseName $dbDisplayName -DefaultUser $defaultUser
            
            Write-Host ""
            Write-Host "Restoring database..." -ForegroundColor Cyan
            
            try {
                Get-Content $selectedFile.FullName | & $mysql -u $restoreCreds.Username -p"$($restoreCreds.Password)" $database
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "? Database restored successfully!" -ForegroundColor Green
                } else {
                    Write-Host "? Failed to restore database (Exit code: $LASTEXITCODE)" -ForegroundColor Red
                    Write-Host "  Check username/password for $dbDisplayName database" -ForegroundColor Yellow
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

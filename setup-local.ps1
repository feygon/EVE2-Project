# Local Development Environment Setup Script
# Run as Administrator if installing MariaDB or using port 80

Write-Host "================================" -ForegroundColor Cyan
Write-Host "RealFeygon.com Local Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "??  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some operations may fail (MariaDB install, port 80 binding)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check Node.js and npm
Write-Host "Step 1: Checking Node.js and npm..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "? Node.js $nodeVersion installed" -ForegroundColor Green
    Write-Host "? npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "? Node.js or npm not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check for MariaDB/MySQL
Write-Host "Step 2: Checking for MariaDB/MySQL..." -ForegroundColor Green
$mysqlInstalled = $false

try {
    $mysqlVersion = mysql --version 2>$null
    if ($mysqlVersion) {
        Write-Host "? MySQL/MariaDB is installed: $mysqlVersion" -ForegroundColor Green
        $mysqlInstalled = $true
    }
} catch {
    Write-Host "? MySQL/MariaDB not found" -ForegroundColor Red
}

if (-not $mysqlInstalled) {
    Write-Host ""
    Write-Host "MariaDB is not installed. Would you like to install it now?" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Install via Winget (Recommended)" -ForegroundColor Yellow
    Write-Host "  2. Open download page in browser" -ForegroundColor Yellow
    Write-Host "  3. Skip installation" -ForegroundColor Yellow
    $choice = Read-Host "Enter choice (1-3)"
    
    switch ($choice) {
        "1" {
            Write-Host "Installing MariaDB via Winget..." -ForegroundColor Cyan
            try {
                winget install MariaDB.Server
                Write-Host "? MariaDB installation initiated" -ForegroundColor Green
                Write-Host "   Please complete the installation wizard, then run this script again" -ForegroundColor Yellow
                exit 0
            } catch {
                Write-Host "? Winget installation failed. Try manual installation." -ForegroundColor Red
                Start-Process "https://mariadb.org/download/"
                exit 1
            }
        }
        "2" {
            Write-Host "Opening MariaDB download page..." -ForegroundColor Cyan
            Start-Process "https://mariadb.org/download/"
            Write-Host "Please install MariaDB and run this script again" -ForegroundColor Yellow
            exit 0
        }
        "3" {
            Write-Host "Skipping MariaDB installation. Database setup will be skipped." -ForegroundColor Yellow
        }
        default {
            Write-Host "Invalid choice. Exiting." -ForegroundColor Red
            exit 1
        }
    }
}
Write-Host ""

# Step 3: Install npm dependencies
Write-Host "Step 3: Installing npm dependencies..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Write-Host "??  node_modules already exists" -ForegroundColor Yellow
    $installNpm = Read-Host "Reinstall dependencies? (y/n)"
    if ($installNpm -eq "y") {
        npm install
        Write-Host "? Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "??  Skipped npm install" -ForegroundColor Yellow
    }
} else {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "? npm install failed" -ForegroundColor Red
    }
}
Write-Host ""

# Step 4: Database setup (only if MySQL is installed)
if ($mysqlInstalled) {
    Write-Host "Step 4: Database Setup" -ForegroundColor Green
    Write-Host "Would you like to set up the local databases now? (y/n)" -ForegroundColor Yellow
    $setupDb = Read-Host
    
    if ($setupDb -eq "y") {
        Write-Host ""
        Write-Host "Please provide MySQL root password:" -ForegroundColor Cyan
        $rootPassword = Read-Host "Root password" -AsSecureString
        $rootPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword))
        
        Write-Host ""
        Write-Host "Creating databases and users..." -ForegroundColor Cyan
        
        # Create SQL file for setup
        $setupSQL = @"
-- Create databases
CREATE DATABASE IF NOT EXISTS realfey_realfey_eve2_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS realfey_illusion_spells_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create users (update these passwords!)
CREATE USER IF NOT EXISTS 'realfey_realfey_realfeyuser'@'localhost' IDENTIFIED BY 'LocalDevPassword123!';
CREATE USER IF NOT EXISTS 'realfey_illusion_spells_DB'@'localhost' IDENTIFIED BY 'LocalDevPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON realfey_realfey_eve2_project.* TO 'realfey_realfey_realfeyuser'@'localhost';
GRANT ALL PRIVILEGES ON realfey_illusion_spells_DB.* TO 'realfey_illusion_spells_DB'@'localhost';

FLUSH PRIVILEGES;

SELECT 'Databases and users created successfully!' as Message;
"@
        
        $setupSQL | Out-File -FilePath "temp_setup.sql" -Encoding UTF8
        
        try {
            # PowerShell-compatible way to pipe SQL file
            Get-Content "temp_setup.sql" | mysql -u root -p"$rootPasswordPlain"
            Write-Host "? Databases and users created" -ForegroundColor Green
            Remove-Item "temp_setup.sql" -Force
            
            # Import schemas
            Write-Host ""
            Write-Host "Would you like to import the database schemas now? (y/n)" -ForegroundColor Yellow
            $importSchemas = Read-Host
            
            if ($importSchemas -eq "y") {
                Write-Host "Importing EVE2 schema (this may take a while)..." -ForegroundColor Cyan
                Get-Content "EVE2 DDQ.sql" | mysql -u realfey_realfey_realfeyuser -pLocalDevPassword123! realfey_realfey_eve2_project
                
                Write-Host "Importing Illusion Spells schema..." -ForegroundColor Cyan
                Get-Content "illusions DDQ.sql" | mysql -u realfey_illusion_spells_DB -pLocalDevPassword123! realfey_illusion_spells_DB
                
                Write-Host "? Database schemas imported" -ForegroundColor Green
            }
        } catch {
            Write-Host "? Database setup failed: $_" -ForegroundColor Red
            Write-Host "   You may need to create databases manually" -ForegroundColor Yellow
            if (Test-Path "temp_setup.sql") {
                Remove-Item "temp_setup.sql" -Force
            }
        }
    } else {
        Write-Host "??  Skipped database setup" -ForegroundColor Yellow
        Write-Host "   You can run the SQL commands manually later" -ForegroundColor Yellow
    }
} else {
    Write-Host "Step 4: Database Setup - SKIPPED (MariaDB not installed)" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Create local config files
Write-Host "Step 5: Configuration Files" -ForegroundColor Green
Write-Host "??  IMPORTANT: Update passwords in dbcon.js and dbcon_illusion.js" -ForegroundColor Yellow
Write-Host "   Current passwords in files are from production!" -ForegroundColor Yellow
Write-Host "   For local dev, use: LocalDevPassword123!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Would you like to create local config files? (y/n)" -ForegroundColor Yellow
$createLocalConfigs = Read-Host

if ($createLocalConfigs -eq "y") {
    # Create dbcon.local.js
    $dbconLocal = @"
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  port            : 3306,
  user            : 'realfey_realfey_realfeyuser',
  password        : 'LocalDevPassword123!',
  database        : 'realfey_realfey_eve2_project',
  multipleStatements: true
});
module.exports.pool = pool;
"@
    
    $dbconLocal | Out-File -FilePath "dbcon.local.js" -Encoding UTF8
    Write-Host "? Created dbcon.local.js" -ForegroundColor Green
    
    # Create dbcon_illusion.local.js
    $dbconIllusionLocal = @"
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  port            : 3306,
  user            : 'realfey_illusion_spells_DB',
  password        : 'LocalDevPassword123!',
  database        : 'realfey_illusion_spells_DB',
  multipleStatements: true
});
module.exports.pool = pool;
"@
    
    $dbconIllusionLocal | Out-File -FilePath "dbcon_illusion.local.js" -Encoding UTF8
    Write-Host "? Created dbcon_illusion.local.js" -ForegroundColor Green
    Write-Host ""
    Write-Host "?? To use local configs, update main.js to require the .local.js files" -ForegroundColor Cyan
}
Write-Host ""

# Step 6: Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Step 6: Creating .gitignore..." -ForegroundColor Green
    $gitignore = @"
# Node modules
node_modules/
npm-debug.log

# Local config files
*.local.js
dbcon.local.js
dbcon_illusion.local.js

# Environment files
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
"@
    $gitignore | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "? Created .gitignore" -ForegroundColor Green
} else {
    Write-Host "Step 6: .gitignore already exists" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Update database passwords in config files" -ForegroundColor White
Write-Host "2. Start the server: node main.js 3000" -ForegroundColor White
Write-Host "3. Open browser to: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "?? See LOCAL_SETUP.md for detailed documentation" -ForegroundColor Cyan
Write-Host ""

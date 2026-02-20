# Import Database Schemas Script
# Imports EVE2 and Illusion database schemas from DDQ files

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Database Schema Import" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$mysqlPath = "C:\Program Files\MariaDB 12.1\bin\mysql.exe"
$eve2User = "realfey_realfey_realfeyuser"
$illusionUser = "realfey_illusion_spells_DB"
$password = "LocalDevPassword123!"
$eve2DB = "realfey_realfey_eve2_project"
$illusionDB = "realfey_illusion_spells_DB"

# Check if SQL files exist
if (-not (Test-Path "scripts\sql\EVE2 DDQ.sql")) {
    Write-Host "? Error: EVE2 DDQ.sql not found in scripts\sql\" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "scripts\sql\illusions DDQ.sql")) {
    Write-Host "? Error: illusions DDQ.sql not found in scripts\sql\" -ForegroundColor Red
    exit 1
}

Write-Host "?? Found SQL files" -ForegroundColor Green
Write-Host ""

# Import EVE2 database
Write-Host "Importing EVE2 database..." -ForegroundColor Cyan
Write-Host "  Reading EVE2 DDQ.sql..." -ForegroundColor Yellow

# Read and modify SQL file to use correct database name
$eve2SQL = Get-Content "scripts\sql\EVE2 DDQ.sql" -Raw
$eve2SQL = $eve2SQL -replace "cs340_nickersr", $eve2DB
$eve2SQL = $eve2SQL -replace "USE .*;", "USE $eve2DB;"

# Save modified SQL to temp file
$tempEve2 = "temp_eve2_import.sql"
$eve2SQL | Out-File -FilePath $tempEve2 -Encoding UTF8

Write-Host "  Importing tables and data..." -ForegroundColor Yellow

try {
    Get-Content $tempEve2 | & $mysqlPath -u $eve2User -p$password $eve2DB 2>&1 | Out-Null
    Write-Host "? EVE2 database imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "? Error importing EVE2 database: $_" -ForegroundColor Red
} finally {
    Remove-Item $tempEve2 -ErrorAction SilentlyContinue
}

Write-Host ""

# Import Illusion database
Write-Host "Importing Illusion Spells database..." -ForegroundColor Cyan
Write-Host "  Reading illusions DDQ.sql..." -ForegroundColor Yellow

# Read and modify SQL file
$illusionSQL = Get-Content "scripts\sql\illusions DDQ.sql" -Raw
$illusionSQL = $illusionSQL -replace "cs340_nickersr", $illusionDB
$illusionSQL = $illusionSQL -replace "USE .*;", "USE $illusionDB;"

# Save modified SQL to temp file
$tempIllusion = "temp_illusion_import.sql"
$illusionSQL | Out-File -FilePath $tempIllusion -Encoding UTF8

Write-Host "  Importing tables and data..." -ForegroundColor Yellow

try {
    Get-Content $tempIllusion | & $mysqlPath -u $illusionUser -p$password $illusionDB 2>&1 | Out-Null
    Write-Host "? Illusion Spells database imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "? Error importing Illusion database: $_" -ForegroundColor Red
} finally {
    Remove-Item $tempIllusion -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

# Verify tables were created
Write-Host "Verifying import..." -ForegroundColor Cyan
Write-Host ""

Write-Host "EVE2 Tables:" -ForegroundColor Yellow
& $mysqlPath -u $eve2User -p$password -D $eve2DB -e "SHOW TABLES;" 2>$null

Write-Host ""
Write-Host "Illusion Tables:" -ForegroundColor Yellow
& $mysqlPath -u $illusionUser -p$password -D $illusionDB -e "SHOW TABLES;" 2>$null

Write-Host ""
Write-Host "? Database import complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run: .\start-local.ps1" -ForegroundColor Cyan

# Cleanup Script - Remove Setup Clutter
# Run this after your initial setup is complete

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This will remove temporary setup files that are no longer needed." -ForegroundColor Yellow
Write-Host ""
Write-Host "Files to be removed:" -ForegroundColor Cyan
Write-Host "  - NEXT_STEPS.md" -ForegroundColor White
Write-Host "  - SETUP_SUMMARY.md" -ForegroundColor White
Write-Host "  - install-phpmyadmin.ps1" -ForegroundColor White
Write-Host "  - temp_setup.sql (if exists)" -ForegroundColor White
Write-Host ""
Write-Host "Files that will be KEPT:" -ForegroundColor Green
Write-Host "  ? README.md" -ForegroundColor White
Write-Host "  ? QUICK_START.md" -ForegroundColor White
Write-Host "  ? LOCAL_SETUP.md" -ForegroundColor White
Write-Host "  ? DATABASE_GUI_GUIDE.md" -ForegroundColor White
Write-Host "  ? GITHUB_SYNC_GUIDE.md" -ForegroundColor White
Write-Host "  ? setup-local.ps1" -ForegroundColor White
Write-Host "  ? start-local.ps1" -ForegroundColor White
Write-Host "  ? db-tools.ps1" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with cleanup? (yes/no)"

if ($confirm -eq "yes") {
    $removedCount = 0
    
    # Remove NEXT_STEPS.md
    if (Test-Path "NEXT_STEPS.md") {
        Remove-Item "NEXT_STEPS.md" -Force
        Write-Host "? Removed NEXT_STEPS.md" -ForegroundColor Green
        $removedCount++
    }
    
    # Remove SETUP_SUMMARY.md
    if (Test-Path "SETUP_SUMMARY.md") {
        Remove-Item "SETUP_SUMMARY.md" -Force
        Write-Host "? Removed SETUP_SUMMARY.md" -ForegroundColor Green
        $removedCount++
    }
    
    # Remove install-phpmyadmin.ps1
    if (Test-Path "install-phpmyadmin.ps1") {
        Remove-Item "install-phpmyadmin.ps1" -Force
        Write-Host "? Removed install-phpmyadmin.ps1" -ForegroundColor Green
        $removedCount++
    }
    
    # Remove temp_setup.sql if it exists
    if (Test-Path "temp_setup.sql") {
        Remove-Item "temp_setup.sql" -Force
        Write-Host "? Removed temp_setup.sql" -ForegroundColor Green
        $removedCount++
    }
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Cleanup Complete!" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Removed $removedCount file(s)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your essential files remain:" -ForegroundColor Cyan
    Write-Host "  ?? QUICK_START.md - Your daily reference" -ForegroundColor White
    Write-Host "  ?? start-local.ps1 - Start your server" -ForegroundColor White
    Write-Host "  ?? db-tools.ps1 - Database backups" -ForegroundColor White
    Write-Host "  ?? Full documentation in other .md files" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Cleanup cancelled" -ForegroundColor Yellow
    Write-Host ""
}

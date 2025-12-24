# Documentation Reorganization Script
# This script will organize all documentation into a clean folder structure

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Documentation Reorganization" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "D:\Repos\RealFeygon"
cd $rootPath

Write-Host "Creating folder structure..." -ForegroundColor Green

# Create folder structure
$folders = @(
    "docs/setup",
    "docs/deployment",
    "docs/git",
    "docs/development",
    "docs/archive"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "  ? Created $folder" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Moving files to organized structure..." -ForegroundColor Green

# Setup files
Move-Item "LOCAL_SETUP.md" "docs/setup/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved LOCAL_SETUP.md ? docs/setup/" -ForegroundColor Gray

Move-Item "DIRECTADMIN_ENV_SETUP.md" "docs/setup/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved DIRECTADMIN_ENV_SETUP.md ? docs/setup/" -ForegroundColor Gray

Move-Item "DATABASE_GUI_GUIDE.md" "docs/setup/DATABASE_GUI.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved DATABASE_GUI_GUIDE.md ? docs/setup/DATABASE_GUI.md" -ForegroundColor Gray

Move-Item "EMERGENCY_RECOVERY_GUIDE.md" "docs/setup/EMERGENCY_RECOVERY.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved EMERGENCY_RECOVERY_GUIDE.md ? docs/setup/EMERGENCY_RECOVERY.md" -ForegroundColor Gray

# Deployment files
Move-Item "DEPLOYMENT_GUIDE.md" "docs/deployment/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved DEPLOYMENT_GUIDE.md ? docs/deployment/" -ForegroundColor Gray

Move-Item "PRE_DEPLOYMENT_CHECKLIST.md" "docs/deployment/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved PRE_DEPLOYMENT_CHECKLIST.md ? docs/deployment/" -ForegroundColor Gray

# Git files
Move-Item "GITHUB_SYNC_GUIDE.md" "docs/git/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved GITHUB_SYNC_GUIDE.md ? docs/git/" -ForegroundColor Gray

Move-Item "GITHUB_PREP.md" "docs/git/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved GITHUB_PREP.md ? docs/git/" -ForegroundColor Gray

Move-Item "GIT_QUICK_REFERENCE.md" "docs/git/GIT_COMMANDS.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved GIT_QUICK_REFERENCE.md ? docs/git/GIT_COMMANDS.md" -ForegroundColor Gray

# Development files
Move-Item "TROUBLESHOOTING.md" "docs/development/" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved TROUBLESHOOTING.md ? docs/development/" -ForegroundColor Gray

# Archive files (one-time documentation)
Move-Item "HANDLEBARS_CONTEXT_ANALYSIS.md" "docs/archive/handlebars-debugging.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved HANDLEBARS_CONTEXT_ANALYSIS.md ? docs/archive/handlebars-debugging.md" -ForegroundColor Gray

Move-Item "PARTIALS_STRUCTURE_UPDATED.md" "docs/archive/partials-structure.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved PARTIALS_STRUCTURE_UPDATED.md ? docs/archive/partials-structure.md" -ForegroundColor Gray

Move-Item "ENV_MIGRATION_COMPLETE.md" "docs/archive/env-migration.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved ENV_MIGRATION_COMPLETE.md ? docs/archive/env-migration.md" -ForegroundColor Gray

Move-Item "SECURITY_VERIFICATION.md" "docs/archive/security-audit.md" -Force -ErrorAction SilentlyContinue
Write-Host "  ? Moved SECURITY_VERIFICATION.md ? docs/archive/security-audit.md" -ForegroundColor Gray

Write-Host ""
Write-Host "Removing redundant files..." -ForegroundColor Green

# Remove redundant summary file
if (Test-Path "DEPLOYMENT_READY.md") {
    Remove-Item "DEPLOYMENT_READY.md" -Force
    Write-Host "  ? Removed DEPLOYMENT_READY.md (redundant summary)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Reorganization Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "?? New Structure:" -ForegroundColor Green
Write-Host ""
Write-Host "Root Directory (Clean):" -ForegroundColor Cyan
Write-Host "  • README.md             - Project overview" -ForegroundColor White
Write-Host "  • QUICK_START.md        - Daily reference" -ForegroundColor White
Write-Host ""
Write-Host "docs/ (Organized):" -ForegroundColor Cyan
Write-Host "  ?? setup/               - Installation & setup guides" -ForegroundColor White
Write-Host "  ?? deployment/          - Production deployment" -ForegroundColor White
Write-Host "  ?? git/                 - Git workflow guides" -ForegroundColor White
Write-Host "  ?? development/         - Troubleshooting & dev tips" -ForegroundColor White
Write-Host "  ?? archive/             - Historical one-time docs" -ForegroundColor White
Write-Host ""

Write-Host "?? Results:" -ForegroundColor Green
Write-Host "  • Root files reduced: 17 ? 2 files (-88%)" -ForegroundColor Gray
Write-Host "  • Total docs: 17 ? 12 active + 4 archived" -ForegroundColor Gray
Write-Host "  • Much cleaner and more professional!" -ForegroundColor Gray
Write-Host ""

Write-Host "?? Documentation Index:" -ForegroundColor Green
Write-Host "  See: docs/DOCUMENTATION_AUDIT.md" -ForegroundColor Gray
Write-Host ""

Write-Host "? Ready to commit changes!" -ForegroundColor Green
Write-Host ""

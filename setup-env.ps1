# Environment Variables Setup Script
# Run this to complete the migration to environment variables

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Environment Variables Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dotenv
Write-Host "Step 1: Installing dotenv package..." -ForegroundColor Green
npm install dotenv --save

if ($LASTEXITCODE -eq 0) {
    Write-Host "? dotenv installed successfully" -ForegroundColor Green
} else {
    Write-Host "? Failed to install dotenv" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check if .env exists
Write-Host "Step 2: Checking environment files..." -ForegroundColor Green
if (Test-Path ".env") {
    Write-Host "? .env file exists" -ForegroundColor Green
} else {
    Write-Host "??  .env file not found" -ForegroundColor Yellow
    Write-Host "   Creating from .env.example..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host "? Created .env file" -ForegroundColor Green
    Write-Host "   Please edit .env and add your actual credentials" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Verify .gitignore
Write-Host "Step 3: Checking .gitignore..." -ForegroundColor Green
$gitignoreContent = Get-Content ".gitignore" -Raw
if ($gitignoreContent -like "*.env*") {
    Write-Host "? .env files are in .gitignore" -ForegroundColor Green
} else {
    Write-Host "??  .env not in .gitignore" -ForegroundColor Yellow
    Write-Host "   This should already be there from earlier setup" -ForegroundColor Cyan
}
Write-Host ""

# Step 4: Test configuration
Write-Host "Step 4: Testing environment configuration..." -ForegroundColor Green
Write-Host ""
Write-Host "Would you like to test the database connection? (y/n)" -ForegroundColor Yellow
$test = Read-Host

if ($test -eq "y") {
    Write-Host ""
    Write-Host "Starting server to test connection..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server after testing" -ForegroundColor Yellow
    Write-Host ""
    node main.js 3000
} else {
    Write-Host "??  Skipped connection test" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Verify .env has correct local credentials" -ForegroundColor White
Write-Host "2. Test locally: .\start-local.ps1 3000" -ForegroundColor White
Write-Host "3. Commit changes to GitHub (without .env!)" -ForegroundColor White
Write-Host "4. Set up environment variables in DirectAdmin" -ForegroundColor White
Write-Host "5. Deploy to production" -ForegroundColor White
Write-Host ""
Write-Host "?? See DIRECTADMIN_ENV_SETUP.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

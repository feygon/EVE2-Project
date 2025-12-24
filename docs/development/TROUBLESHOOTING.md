# ?? Troubleshooting Guide

## ?? Table of Contents

- [Quick Fixes (TL;DR)](#quick-fixes-tldr)
- [Quick Diagnostic Checklist](#quick-diagnostic-checklist)
- [Database Connection Issues](#database-connection-issues)
- [Environment Variable Problems](#environment-variable-problems)
- [Server and Port Issues](#server-and-port-issues)
- [Diagnostic Commands](#diagnostic-commands)
- [Production Issues](#production-issues)
- [Related Documentation](#related-documentation)

---

## ? Quick Fixes (TL;DR)

**Most common problems and solutions:**

1. **Database won't connect?**
   - Run: `.\start-local.ps1 3000`

2. **Missing .env file?**
   - Run: `.\setup-env.ps1`

3. **Module not found errors?**
   - Run: `npm install`

4. **Port already in use?**
   - Run: `.\start-local.ps1 3001`

5. **Server won't start?**
   - Kill processes: `Get-Process -Name "node" | Stop-Process -Force`
   - Restart: `.\start-local.ps1 3000`

---

## ?? Quick Diagnostic Checklist

**Before troubleshooting, check these:**

- [ ] Is MariaDB running? ? `Get-Process -Name "mysqld"`
- [ ] Does .env file exist? ? `Test-Path ".env"`
- [ ] Are node_modules installed? ? `Test-Path "node_modules"`
- [ ] Is port 3000 available? ? `netstat -ano | findstr :3000`

**All checked?** ? See specific issues below

---

## ?? Database Connection Issues

### ?? Error: ECONNREFUSED

**You see this:**
```
Error: connect ECONNREFUSED ::1:3306
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Why:** MariaDB is not running

**Solutions:**

#### Quick Fix (Easiest):
```powershell
.\start-local.ps1 3000
```
The script automatically starts MariaDB for you!

---

#### Manual Start:
```powershell
Start-Process -FilePath "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" -WindowStyle Hidden
Start-Sleep -Seconds 3
.\start-local.ps1 3000
```

---

#### Permanent Fix (Recommended):
**Set up MariaDB as a Windows service:**

```powershell
# Run PowerShell as Administrator

& "C:\Program Files\MariaDB 12.1\bin\mysql_install_db.exe" --service=MariaDB
Start-Service MariaDB
Set-Service -Name MariaDB -StartupType Automatic
```

Now MariaDB starts with Windows!

---

### ??? Database Not Found

**You see this:**
```
Error: ER_BAD_DB_ERROR: Unknown database
```

**Why:** Database hasn't been created yet

**Solution:**

Run the setup script:
```powershell
.\setup-local.ps1
```

This creates both databases automatically.

---

**OR manually import schemas:**

```powershell
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"

mysql -u root realfey_realfey_eve2_project < "EVE2 DDQ.sql"
mysql -u root realfey_illusion_spells_db < "illusions DDQ.sql"
```

---

### ?? Wrong Database Credentials

**You see:**
- Access denied errors
- Authentication failures

**Why:** Credentials in .env don't match database

**Solution:**

**Check your .env file:**
```powershell
Get-Content ".env"
```

**Should look like this:**
```env
DB_HOST=localhost
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=LocalDevPassword123!
DB_NAME=realfey_realfey_eve2_project

DB_ILLUSION_HOST=localhost
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=LocalDevPassword123!
DB_ILLUSION_NAME=realfey_illusion_spells_DB
```

---

## ?? Environment Variable Problems

### ?? Missing .env File

**You see:**
- Database connection fails
- Warning: ".env file not found"

**Solution:**

**Run the setup script:**
```powershell
.\setup-env.ps1
```

---

**OR create manually:**
```powershell
Copy-Item ".env.example" ".env"
```
Then edit .env with your credentials.

---

### ?? Environment Variables Not Loading

**You see:**
- process.env variables are undefined
- Database uses wrong credentials

**Solutions:**

**1. Install dotenv:**
```powershell
npm install dotenv --save
```

---

**2. Check .env exists:**
```powershell
Test-Path ".env"
```

---

**3. Verify dotenv is loaded:**

Check these files have this at the top:
- `dbcon.js`
- `dbcon_illusion.js`

```javascript
require('dotenv').config();
```

---

**4. Check .env format:**

**Correct:**
```env
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
```

**Wrong:**
```env
DB_HOST = localhost          ? (spaces around =)
DB_USER="myuser"            ? (unnecessary quotes)
DB_PASSWORD = "mypassword"  ? (both errors)
```

---

## ??? Server and Port Issues

### ?? Missing node_modules

**You see:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'dotenv'
```

**Solution:**
```powershell
npm install
```

Wait for it to finish, then restart your server.

---

### ?? Port Already in Use

**You see:**
```
Error: EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option A: Use different port**
```powershell
.\start-local.ps1 3001
```

---

**Option B: Kill the process**

**Find what's using the port:**
```powershell
netstat -ano | findstr :3000
```

**Kill it (replace XXXX with PID from above):**
```powershell
taskkill /PID XXXX /F
```

**Restart your server:**
```powershell
.\start-local.ps1 3000
```

---

### ?? Server Won't Restart

**Solution:**

**Kill all Node and MariaDB processes:**
```powershell
Get-Process -Name "node" | Stop-Process -Force
Get-Process -Name "mysqld" | Stop-Process -Force
```

**Start fresh:**
```powershell
.\start-local.ps1 3000
```

---

### ?? MariaDB Won't Start

**Troubleshooting steps:**

**1. Check if MariaDB is installed:**
```powershell
Test-Path "C:\Program Files\MariaDB 12.1"
```

---

**2. Check if port 3306 is in use:**
```powershell
netstat -ano | findstr :3306
```

---

**3. Try starting with error output:**
```powershell
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --console
```
Look for error messages.

---

**4. Check error log:**
```powershell
Get-Content "C:\Program Files\MariaDB 12.1\data\*.err" -Tail 50
```

---

## ??? Diagnostic Commands

**Check if services are running:**

```powershell
# Check MariaDB
Get-Process -Name "mysqld"

# Check Node.js
Get-Process -Name "node"
```

---

**Test database connection:**

```powershell
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"
mysql -u root -e "SELECT 'Connected!' as Status;"
```

---

**Check databases exist:**

```powershell
mysql -u root -e "SHOW DATABASES;"
```

---

**Check .env file:**

```powershell
Get-Content ".env"
```

---

**Check if dotenv is installed:**

```powershell
npm list dotenv
```

---

**Check what's using a port:**

```powershell
# Port 3000
netstat -ano | findstr :3000

# Port 3306
netstat -ano | findstr :3306
```

---

**Check environment variables are loaded:**

Add this temporarily to `main.js`:
```javascript
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
```

---

## ?? Production Issues

### Routes Work Locally but Not in Production

**Common causes:**

**1. Environment variables not set**
- Go to DirectAdmin ? Node.js Setup
- Add all environment variables
- See: docs/setup/DIRECTADMIN_ENV_SETUP.md

---

**2. Database credentials are different**
- Verify production passwords in DirectAdmin
- Check they match your environment variables

---

**3. App not restarted after changes**
- Go to DirectAdmin ? Node.js Setup
- Click "Restart"

---

## ?? Still Having Issues?

**Try a complete restart:**

```powershell
# Stop everything
Get-Process -Name "node", "mysqld" | Stop-Process -Force

# Start fresh
.\start-local.ps1 3000
```

---

**Check the logs:**
- Look at console output for error messages
- Check Node.js logs in DirectAdmin (if production)

---

## ?? Related Documentation

**Setup & Configuration:**
- [Quick Start Guide](../../QUICK_START.md) - Daily commands
- [Local Setup](../setup/LOCAL_SETUP.md) - Initial setup
- [DirectAdmin Setup](../setup/DIRECTADMIN_ENV_SETUP.md) - Production config
- [Database Tools](../setup/DATABASE_GUI.md) - Database management

**Deployment:**
- [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md) - Deploy to production

---

## ?? Pro Tip

**Most problems are solved by:**
```powershell
.\start-local.ps1 3000
```

This script:
- ? Checks if MariaDB is running
- ? Starts it if needed
- ? Loads environment variables
- ? Starts your server

**Keep it simple!** ??

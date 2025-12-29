---
title: "Troubleshooting Guide"
version: v2.0.0
created: 2024-12-22
updated: 2025-12-29
status: current
category: development
tags: [troubleshooting, debugging, errors, fixes]
---

# ?? Troubleshooting Guide

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

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

## ?? Quick Fixes (TL;DR)

**?? TL;DR:** Most issues are database connection, missing .env, wrong port, or stale cache.

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

## ? Quick Diagnostic Checklist

**?? TL;DR:** Run through this 10-step checklist before deep debugging.

**Before troubleshooting, check these:**

- [ ] Is MariaDB running? ? `Get-Process -Name "mysqld"`
- [ ] Does .env file exist? ? `Test-Path ".env"`
- [ ] Are node_modules installed? ? `Test-Path "node_modules"`
- [ ] Is port 3000 available? ? `netstat -ano | findstr :3000`

**All checked?** ? See specific issues below

---

## ??? Database Connection Issues

**?? TL;DR:** Check .env file exists, credentials are correct, MySQL is running, firewall allows connection.

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

**?? TL;DR:** Verify .env file exists, is loaded by dotenv, has all required variables, no typos.

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

## ?? Server and Port Issues

**?? TL;DR:** Check port not in use, firewall allows it, correct port in browser, server actually started.

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

**?? TL;DR:** PowerShell commands to check processes, ports, files, and database connections.

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

**?? TL;DR:** Production problems usually environment variables, file permissions, or Node version mismatch.

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

## ?? Related Documentation

- [LOCAL_SETUP.md](../setup/LOCAL_SETUP.md) - Initial setup guide
- [EMERGENCY_RECOVERY.md](../setup/EMERGENCY_RECOVERY.md) - Disaster recovery
- [CI_CD_SETUP.md](../deployment/CI_CD_SETUP.md) - Deployment guide

---

**Last Updated:** December 29, 2025  
**Maintained By:** Feygon Nickerson

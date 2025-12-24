# ?? Troubleshooting Guide

## Common Issues and Solutions

### ?? **Error: ECONNREFUSED (Cannot connect to database)**

**Symptoms:**
```
Error: connect ECONNREFUSED ::1:3306
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Cause:** MariaDB is not running

**Solutions:**

#### **Quick Fix:**
```powershell
# Start MariaDB manually
Start-Process -FilePath "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" -ArgumentStyle "--console" -WindowStyle Hidden

# Wait a few seconds
Start-Sleep -Seconds 3

# Restart your app
.\start-local.ps1 3000
```

#### **Automatic Fix:**
The updated `start-local.ps1` script now automatically starts MariaDB if it's not running!

```powershell
.\start-local.ps1 3000
```

#### **Permanent Fix (Set up MariaDB as a Service):**
```powershell
# Run as Administrator
# Install MariaDB as a Windows service
& "C:\Program Files\MariaDB 12.1\bin\mysql_install_db.exe" --service=MariaDB

# Start the service
Start-Service MariaDB

# Set it to start automatically
Set-Service -Name MariaDB -StartupType Automatic
```

---

### ?? **Missing .env File**

**Symptoms:**
- Database connection fails
- Warning: ".env file not found"

**Solution:**
```powershell
# Run the environment setup
.\setup-env.ps1

# OR create manually from template
Copy-Item ".env.example" ".env"
# Then edit .env with your actual credentials
```

---

### ?? **Wrong Database Credentials**

**Symptoms:**
- Access denied errors
- Authentication failures

**Solution:**

Check your `.env` file has correct credentials:
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

### ??? **Database Not Found**

**Symptoms:**
```
Error: ER_BAD_DB_ERROR: Unknown database
```

**Solution:**
```powershell
# Run the setup script to create databases
.\setup-local.ps1

# OR manually import schemas
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"
Get-Content "EVE2 DDQ.sql" | mysql -u root realfey_realfey_eve2_project
Get-Content "illusions DDQ.sql" | mysql -u root realfey_illusion_spells_db
```

---

### ?? **Missing node_modules**

**Symptoms:**
```
Error: Cannot find module 'express'
Error: Cannot find module 'dotenv'
```

**Solution:**
```powershell
npm install
```

---

### ?? **Port Already in Use**

**Symptoms:**
```
Error: EADDRINUSE: address already in use :::3000
```

**Solution:**

**Option A: Use different port**
```powershell
.\start-local.ps1 3001
```

**Option B: Kill process using port**
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F
```

---

### ?? **MariaDB Won't Start**

**Symptoms:**
- mysqld.exe process doesn't start
- Error starting MariaDB

**Troubleshooting Steps:**

1. **Check if MariaDB is installed:**
```powershell
Test-Path "C:\Program Files\MariaDB 12.1"
```

2. **Check if port 3306 is in use:**
```powershell
netstat -ano | findstr :3306
```

3. **Try starting with error output:**
```powershell
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --console
```

4. **Check error log:**
```powershell
Get-Content "C:\Program Files\MariaDB 12.1\data\*.err" -Tail 50
```

---

### ?? **Environment Variables Not Loading**

**Symptoms:**
- process.env variables are undefined
- Database connection uses wrong credentials

**Solutions:**

1. **Make sure dotenv is installed:**
```powershell
npm install dotenv --save
```

2. **Check .env file exists:**
```powershell
Test-Path ".env"
```

3. **Verify dotenv is loaded in config files:**
Check that `require('dotenv').config();` is at the top of:
- `dbcon.js`
- `dbcon_illusion.js`

4. **Check .env file format:**
- No spaces around `=`
- No quotes around values (unless needed)
- One variable per line

Example:
```env
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
```

---

### ?? **Server Won't Restart**

**Solution:**

1. **Kill Node processes:**
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

2. **Kill MariaDB processes:**
```powershell
Get-Process -Name "mysqld" | Stop-Process -Force
```

3. **Start fresh:**
```powershell
.\start-local.ps1 3000
```

---

### ?? **Routes Work Locally but Not in Production**

**Common Issues:**

1. **Environment variables not set in DirectAdmin**
   - Check DIRECTADMIN_ENV_SETUP.md

2. **Database credentials different on production**
   - Verify production credentials match DirectAdmin database settings

3. **Node.js app not restarted after changes**
   - Restart app in DirectAdmin control panel

---

## ??? **Diagnostic Commands**

```powershell
# Check if MariaDB is running
Get-Process -Name "mysqld"

# Check if Node is running
Get-Process -Name "node"

# Test MariaDB connection
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"
mysql -u root -e "SELECT 'Connected!' as Status;"

# Check databases exist
mysql -u root -e "SHOW DATABASES;"

# Check .env file
Get-Content ".env"

# Check if dotenv is installed
npm list dotenv

# Check what's using port 3000
netstat -ano | findstr :3000

# Check what's using port 3306
netstat -ano | findstr :3306
```

---

## ?? **Still Having Issues?**

1. **Check all services are running:**
```powershell
Get-Process -Name "mysqld", "node"
```

2. **Restart everything:**
```powershell
# Stop all
Get-Process -Name "node", "mysqld" | Stop-Process -Force

# Start fresh
.\start-local.ps1 3000
```

3. **Review logs in console output**

4. **Check environment variables are loaded:**
Add this temporarily to `main.js`:
```javascript
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
```

---

## ?? **Related Documentation**

- **QUICK_START.md** - Quick reference commands
- **LOCAL_SETUP.md** - Detailed setup instructions
- **DIRECTADMIN_ENV_SETUP.md** - Production deployment
- **DATABASE_GUI_GUIDE.md** - Database management tools

---

**Most Common Fix:** Just restart MariaDB! ??
```powershell
.\start-local.ps1 3000
```

---
title: "Local Development Setup Guide"
version: v2.0.0
created: 2024-12-22
updated: 2025-12-29
status: current
category: setup
tags: [local-setup, mariadb, development, installation]
---

# ??? Local Development Setup Guide

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Prerequisites](#prerequisites)
- [Step 1: Install MariaDB](#step-1-install-mariadb)
- [Step 2: Install Node Dependencies](#step-2-install-node-dependencies)
- [Step 3: Set Up Local Databases](#step-3-set-up-local-databases)
- [Step 4: Create Local Database Configuration](#step-4-create-local-database-configuration)
- [Step 5: Import Database Schemas](#step-5-import-database-schemas)
- [Step 6: Update Database Credentials](#step-6-update-database-credentials)
- [Step 7: Start the Application](#step-7-start-the-application)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## ?? **TL;DR**

**?? Quick setup:** Install MariaDB ? create databases ? create .env file ? import schemas ? start app.

**Prerequisites:** Node.js 14+, MariaDB/MySQL, Git

**Time:** 20-30 minutes first time, 2 minutes after automation scripts

**Automation:** Use `setup-local.ps1` and `start-local.ps1` scripts for one-command setup.

---

## ?? **Prerequisites**

**?? TL;DR:** Need Node.js 14+, MariaDB/MySQL, and Git installed before starting.

- **Node.js:** Download and install from [Node.js official website](https://nodejs.org/). 14.x or later is required.
- **MariaDB/MySQL:** Install using package manager or download from [MariaDB downloads](https://mariadb.org/download/).
- **Git:** Install from [Git official website](https://git-scm.com/downloads).

Verify installations:

```powershell
node --version
npm --version
mysql --version
git --version
```

---

## ??? **Step 1: Install MariaDB**

**?? TL;DR:** Download MariaDB, install with default settings, remember root password.

### Option A: Using Winget (Recommended for Windows)
```powershell
winget install MariaDB.Server
```

### Option B: Manual Download
1. Download MariaDB from: https://mariadb.org/download/
2. Choose Windows version (10.11 LTS or 11.x recommended)
3. Run the installer
4. During installation:
   - Set a root password (remember this!)
   - Enable "Install as Windows Service"
   - Keep default port 3306

### Option C: Using Chocolatey
```powershell
choco install mariadb
```

---

## ?? **Step 2: Install Node Dependencies**

**?? TL;DR:** Run `npm install` in project directory to install all dependencies.

```powershell
cd D:\Repos\RealFeygon
npm install
```

---

## ??? **Step 3: Set Up Local Databases**

**?? TL;DR:** Create two databases - eve2_project and illusion_spells with appropriate users.

After MariaDB is installed, open a command prompt and connect:

```powershell
mysql -u root -p
```

Then run these SQL commands:

```sql
-- Create databases
CREATE DATABASE realfey_realfey_eve2_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE realfey_illusion_spells_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create users (use different passwords than production!)
CREATE USER 'realfey_realfey_realfeyuser'@'localhost' IDENTIFIED BY 'LocalDevPassword123!';
CREATE USER 'realfey_illusion_spells_DB'@'localhost' IDENTIFIED BY 'LocalDevPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON realfey_realfey_eve2_project.* TO 'realfey_realfey_realfeyuser'@'localhost';
GRANT ALL PRIVILEGES ON realfey_illusion_spells_DB.* TO 'realfey_illusion_spells_DB'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

---

## ?? **Step 4: Create Local Database Configuration**

**?? TL;DR:** Create .env file with database credentials for local development.

Copy your database config files and create local versions:

```powershell
# You'll need to manually create these or use the setup script
```

---

## ?? **Step 5: Import Database Schemas**

**?? TL;DR:** Import SQL dumps to populate databases with tables and data.

**PowerShell (Recommended):**
```powershell
# Import EVE2 database
Get-Content "EVE2 DDQ.sql" | mysql -u realfey_realfey_realfeyuser -pLocalDevPassword123! realfey_realfey_eve2_project

# Import Illusion Spells database
Get-Content "illusions DDQ.sql" | mysql -u realfey_illusion_spells_DB -pLocalDevPassword123! realfey_illusion_spells_DB
```

**Command Prompt (Alternative):**
```cmd
mysql -u realfey_realfey_realfeyuser -p realfey_realfey_eve2_project < "EVE2 DDQ.sql"
mysql -u realfey_illusion_spells_DB -p realfey_illusion_spells_DB < "illusions DDQ.sql"
```

---

## ?? **Step 6: Update Database Credentials**

**?? TL;DR:** Verify .env file has correct passwords matching what you set in MariaDB.

**IMPORTANT:** Update your local config files with the passwords you set:
- `dbcon.js` - Update password for EVE2 database user
- `dbcon_illusion.js` - Update password for Illusion database user

---

## ?? **Step 7: Start the Application**

**?? TL;DR:** Run `node main.js` or use start-local.ps1 script to launch server.

```powershell
# Start on default port 80 (requires admin privileges)
node main.js

# Or use a non-privileged port for testing
node main.js 3000
```

The application will be available at:
- `http://localhost` (port 80)
- `http://localhost:3000` (if using port 3000)

---

## ?? **Troubleshooting**

**?? TL;DR:** Common issues - database connection fails, port already in use, missing dependencies, wrong passwords.

### MariaDB won't start
```powershell
# Check if service is running
Get-Service -Name MariaDB

# Start the service
Start-Service MariaDB
```

### Can't connect to database
1. Verify MariaDB is running
2. Check username/password in config files
3. Ensure databases were created
4. Check port 3306 is not blocked by firewall

### Port 80 in use
```powershell
# Find what's using port 80
netstat -ano | findstr :80

# Use a different port
node main.js 3000
```

### PowerShell script execution errors
If you get errors about execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Database import errors
If you get "The '<' operator is reserved" error in PowerShell, use `Get-Content` piping:
```powershell
Get-Content "EVE2 DDQ.sql" | mysql -u username -pPassword database_name
```

---

## ?? **Useful Commands**

**?? TL;DR:** Quick reference for starting server, accessing database, checking status, stopping server.

```powershell
# Check Node/npm versions
node --version
npm --version

# Check MariaDB version
mysql --version

# Check if MariaDB service is running
Get-Service MariaDB

# Stop MariaDB service
Stop-Service MariaDB

# Start MariaDB service
Start-Service MariaDB

# Connect to database
mysql -u root -p

# Show all databases
mysql -u root -p -e "SHOW DATABASES;"
```

---

## ?? **Development vs Production**

**Local Development:**
- Use different database passwords
- Test changes locally before deploying
- Can use different ports (e.g., 3000 instead of 80)
- Database: localhost

**Production (GeniusMojo/DirectAdmin):**
- Use production credentials
- Database: Remote MariaDB on hosting
- Port 80/443
- Keep production config files separate

---

## ?? **Next Steps**

1. Consider using environment variables for configuration
2. Add `.gitignore` to exclude sensitive config files
3. Create a `config.local.js` for local overrides
4. Set up database backup/restore scripts

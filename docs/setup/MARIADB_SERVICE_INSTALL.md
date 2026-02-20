---
title: "MariaDB Service Installation Guide"
version: v1.0.0
created: 2025-12-29
updated: 2025-12-29
status: current
category: setup
tags: [mariadb, service, windows, troubleshooting]
---

# ?? MariaDB Windows Service Installation

**Version:** v1.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

---

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Problem](#problem)
- [Solution](#solution)
- [Manual Steps](#manual-steps)
- [Automated Script](#automated-script)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Service Management](#service-management)

---

## ?? **TL;DR**

**Problem:** MariaDB installed but not configured as Windows service ? can't connect to database.

**Solution:** Run `install-mariadb-service.ps1` as Administrator to install and start the service.

**Time:** 2 minutes

---

## ?? **Problem**

### Symptoms:
- MariaDB installed at `C:\Program Files\MariaDB 12.1\`
- Error when connecting: "Can't connect to server on 'localhost' (10061)"
- No MariaDB service in Windows Services
- `Get-Service MariaDB` returns nothing

### Root Cause:
MariaDB was installed **without** the "Install as Windows Service" option, or the service installation failed during setup.

---

## ? **Solution**

You need to **manually install MariaDB as a Windows service** and start it.

---

## ?? **Manual Steps**

### **Step 1: Open PowerShell as Administrator**

Right-click PowerShell ? "Run as Administrator"

### **Step 2: Navigate to Project**

```powershell
cd D:\Repos\RealFeygon
```

### **Step 3: Install the Service**

```powershell
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --install MariaDB --defaults-file="C:\Program Files\MariaDB 12.1\data\my.ini"
```

Expected output:
```
Service successfully installed.
```

### **Step 4: Start the Service**

```powershell
Start-Service MariaDB
```

### **Step 5: Verify Service is Running**

```powershell
Get-Service MariaDB
```

Expected output:
```
Status   Name               DisplayName
------   ----               -----------
Running  MariaDB            MariaDB
```

---

## ?? **Automated Script**

### **Quick Method (Recommended)**

1. **Open PowerShell as Administrator**
2. **Navigate to project:**
   ```powershell
   cd D:\Repos\RealFeygon
   ```
3. **Run the installation script:**
   ```powershell
   .\install-mariadb-service.ps1
   ```

The script will:
- ? Check for Administrator privileges
- ? Verify MariaDB installation
- ? Remove old service if exists
- ? Install MariaDB as Windows service
- ? Start the service
- ? Verify service is running

---

## ?? **Verification**

### **Test Database Connection**

```powershell
& "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u root -p
```

If you can connect and see the MariaDB prompt, the service is working!

```
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 3
Server version: 12.1.2-MariaDB mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

### **Check Service Status**

```powershell
Get-Service MariaDB | Format-List *
```

Expected values:
- **Status:** Running
- **StartType:** Automatic
- **Name:** MariaDB

---

## ?? **Troubleshooting**

### **Service Won't Install**

**Error:** "Access is denied" or "The specified service already exists"

**Solution:**
```powershell
# Remove existing service (as Administrator)
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --remove MariaDB

# Wait a moment
Start-Sleep -Seconds 2

# Reinstall
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --install MariaDB --defaults-file="C:\Program Files\MariaDB 12.1\data\my.ini"

# Start service
Start-Service MariaDB
```

---

### **Service Won't Start**

**Error:** "The service did not respond to the start or control request in a timely fashion"

**Check logs:**
```powershell
Get-Content "C:\Program Files\MariaDB 12.1\data\*.err" | Select-Object -Last 50
```

**Common issues:**
1. **Port 3306 in use:**
   ```powershell
   netstat -ano | findstr :3306
   ```
   
2. **Corrupted data directory:**
   - Backup `C:\Program Files\MariaDB 12.1\data\`
   - Reinitialize data directory

3. **Permissions issue:**
   - Verify `C:\Program Files\MariaDB 12.1\data\` permissions
   - Service account needs read/write access

---

### **Can't Connect After Service Starts**

**Check if listening:**
```powershell
netstat -ano | findstr :3306
```

Should show:
```
TCP    0.0.0.0:3306           0.0.0.0:0              LISTENING       [PID]
```

**Test connection:**
```powershell
& "C:\Program Files\MariaDB 12.1\bin\mariadb-admin.exe" ping
```

Should output:
```
mariadbd is alive
```

---

### **Service Installed But Not in Services List**

**Refresh services:**
```powershell
Get-Service | Out-Null
Get-Service MariaDB
```

**Or use sc.exe:**
```powershell
sc.exe query MariaDB
```

---

## ??? **Service Management**

### **Common Commands**

```powershell
# Check service status
Get-Service MariaDB

# Start service
Start-Service MariaDB

# Stop service
Stop-Service MariaDB

# Restart service
Restart-Service MariaDB

# Check if service is running
$service = Get-Service MariaDB
if ($service.Status -eq "Running") {
    Write-Host "? MariaDB is running"
} else {
    Write-Host "? MariaDB is not running"
}

# Set service to start automatically on boot
Set-Service -Name MariaDB -StartupType Automatic

# Set service to manual start
Set-Service -Name MariaDB -StartupType Manual
```

---

### **Remove Service (If Needed)**

```powershell
# Stop the service
Stop-Service -Name MariaDB -Force

# Remove the service
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --remove MariaDB

# Verify removal
Get-Service MariaDB -ErrorAction SilentlyContinue
# Should return nothing
```

---

## ?? **After Service Installation**

Once the service is running, you can proceed with:

1. **Connect to MariaDB:**
   ```powershell
   & "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u root -p
   ```

2. **Create databases** (see `LOCAL_SETUP.md` Step 3)

3. **Import database schemas** (see `LOCAL_SETUP.md` Step 5)

4. **Start your application:**
   ```powershell
   node main.js 3000
   ```

---

## ?? **Service Configuration**

### **Default Settings**

| Setting | Value |
|---------|-------|
| **Service Name** | MariaDB |
| **Display Name** | MariaDB |
| **Port** | 3306 |
| **Data Directory** | `C:\Program Files\MariaDB 12.1\data\` |
| **Config File** | `C:\Program Files\MariaDB 12.1\data\my.ini` |
| **Binary** | `C:\Program Files\MariaDB 12.1\bin\mysqld.exe` |

### **Startup Type Options**

- **Automatic:** Service starts on Windows boot (recommended for dev)
- **Manual:** Must start service manually each time
- **Disabled:** Service won't start

**Set to automatic:**
```powershell
Set-Service -Name MariaDB -StartupType Automatic
```

---

## ?? **Quick Reference Card**

```powershell
# Install service (as Admin)
& "C:\Program Files\MariaDB 12.1\bin\mysqld.exe" --install MariaDB

# Start service
Start-Service MariaDB

# Check status
Get-Service MariaDB

# Connect to database
& "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u root -p

# View logs
Get-Content "C:\Program Files\MariaDB 12.1\data\*.err" -Tail 20
```

---

## ?? **Related Documentation**

- **LOCAL_SETUP.md** - Complete local development setup
- **TROUBLESHOOTING.md** - General troubleshooting guide
- **DATABASE_GUI.md** - Using HeidiSQL or other GUI tools

---

## ? **Success Checklist**

After following this guide:

- [ ] MariaDB service installed
- [ ] Service status shows "Running"
- [ ] Can connect via `mysql -u root -p`
- [ ] `mariadb-admin ping` responds with "mariadbd is alive"
- [ ] Port 3306 is listening (`netstat -ano | findstr :3306`)
- [ ] Service set to start automatically (optional)

---

## ?? **Backup Service Configuration**

**Export service configuration:**
```powershell
Get-Service MariaDB | Export-Clixml -Path "mariadb-service-config.xml"
```

**View configuration:**
```powershell
Get-WmiObject Win32_Service | Where-Object {$_.Name -eq "MariaDB"} | Format-List *
```

---

## ?? **Important Notes**

1. **Always run service installation as Administrator**
2. **Backup data directory before major changes**
3. **Check error logs if service fails to start**
4. **Default root password may be empty** - set one immediately!
5. **Service restart may be needed after configuration changes**

---

**Created:** December 29, 2025  
**Author:** Setup Documentation  
**Purpose:** Guide for installing MariaDB as Windows service when initial installation skips this step

---

## ?? **Merry Christmas!**

If you're reading this because MariaDB isn't running - you're in the right place! This guide will get you back on track. ???

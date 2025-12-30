---
title: "Database GUI Tools Guide"
version: v2.0.0
created: 2024-12-22
updated: 2025-12-29
status: current
category: setup
tags: [database, mysql, gui, tools]
---

# ??? Database GUI Tools Guide

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Options Comparison](#-options-comparison)
- [Quick Install](#-quick-install)
- [phpMyAdmin](#1-phpmyadmin-web-based)
- [HeidiSQL](#2-heidisql-recommended---easiest)
- [DBeaver](#3-dbeaver-modern--powerful)
- [MySQL Workbench](#4-mysql-workbench-official-tool)
- [Command Line](#5-command-line-already-available)
- [Your Databases](#-your-databases)
- [My Recommendation](#-my-recommendation)
- [Quick Links](#-quick-links)

---

## ?? **TL;DR**

**?? Best choice:** HeidiSQL - lightweight, fast, easy to use, perfect for development.

**Quick install:** Download HeidiSQL, connect to localhost:3306, browse both databases.

**Alternatives:** phpMyAdmin (web), DBeaver (modern), MySQL Workbench (official), or command line.

---

## ?? **Options Comparison**

**?? TL;DR:** Five options ranked by ease of use - HeidiSQL recommended for most users.

| Tool | Pros | Cons | Best For |
|------|------|------|----------|
| **phpMyAdmin** | Industry standard, web-based, full-featured | Requires Apache/PHP setup | Web developers familiar with it |
| **HeidiSQL** | Lightweight, fast, no web server needed | Windows only | Quick local development |
| **DBeaver** | Modern UI, supports many databases, free | Larger download, Java required | Power users, multiple DB types |
| **MySQL Workbench** | Official MySQL tool, powerful | Heavy, complex interface | Database design & admin |
| **Command Line** | Always available, scriptable | No visual interface | Automation & quick queries |

---

## ? **Quick Install**

**?? TL;DR:** HeidiSQL download ? install ? connect to localhost:3306 ? done in 2 minutes.

Run this script and choose your preferred option:

```powershell
.\install-phpmyadmin.ps1
```

---

## 1?? **phpMyAdmin (Web-Based)**

**?? TL;DR:** Web interface, no install needed, access via browser at localhost/phpmyadmin.

### Option A: XAMPP (Easiest)

**Install:**
```powershell
# Download from https://www.apachefriends.org/
# Install to C:\xampp
```

**Configure:**
1. Start Apache from XAMPP Control Panel
2. phpMyAdmin is pre-installed!
3. Visit: http://localhost/phpmyadmin
4. Login: `root` / (no password)

**Note:** XAMPP includes its own MySQL. To use your existing MariaDB:
- Stop XAMPP's MySQL
- Or configure phpMyAdmin to connect to port 3306

### Option B: Standalone phpMyAdmin

**Requirements:**
- PHP installed
- Download phpMyAdmin

**Setup:**
1. Download from: https://www.phpmyadmin.net/downloads/
2. Extract to `C:\phpmyadmin`
3. Copy `config.sample.inc.php` to `config.inc.php`
4. Start PHP server:
   ```powershell
   php -S localhost:8080 -t C:\phpmyadmin
   ```
5. Visit: http://localhost:8080
6. Login: `root` / (no password)

---

## 2?? **HeidiSQL (Recommended - Easiest!)**

**?? TL;DR:** Lightweight Windows app, fast, intuitive, perfect for local development.

### Why HeidiSQL?
- ? No web server needed
- ? Fast and lightweight
- ? Simple to use
- ? Windows native
- ? Free and open source

### Install:
```powershell
winget install HeidiSQL.HeidiSQL
```

Or download from: https://www.heidisql.com/

### Setup:
1. Open HeidiSQL
2. Click **"New"** button
3. Connection settings:
   - **Network type:** MariaDB or MySQL (TCP/IP)
   - **Hostname:** `localhost`
   - **User:** `root`
   - **Password:** (leave blank)
   - **Port:** `3306`
4. Click **"Open"**

### Using HeidiSQL:
- Left panel shows databases
- Click database to see tables
- Right-click tables for options
- SQL tab for running queries
- Data tab for viewing/editing rows

---

## 3?? **DBeaver (Modern & Powerful)**

**?? TL;DR:** Cross-platform, modern UI, supports many databases, good for power users.

### Why DBeaver?
- ? Modern UI
- ? Supports many database types
- ? Advanced features (ER diagrams, data export, etc.)
- ? Cross-platform
- ? Free Community Edition

### Install:
```powershell
winget install dbeaver.dbeaver
```

Or download from: https://dbeaver.io/download/

### Setup:
1. Open DBeaver
2. Click **"New Database Connection"** (plug icon)
3. Select **"MariaDB"**
4. Connection settings:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **Database:** (leave empty)
   - **Username:** `root`
   - **Password:** (leave blank)
5. Click **"Test Connection"**
6. If it asks to download drivers, click **"Download"**
7. Click **"Finish"**

### Using DBeaver:
- Database Navigator shows all databases
- Double-click tables to view data
- SQL Editor for queries
- ER Diagrams for visualizing relationships
- Export data to various formats

---

## 4?? **MySQL Workbench (Official Tool)**

**?? TL;DR:** Official MySQL GUI, full-featured, good for advanced users and modeling.

### Install:
```powershell
winget install Oracle.MySQLWorkbench
```

Or download from: https://dev.mysql.com/downloads/workbench/

### Setup:
1. Open MySQL Workbench
2. Click **"+"** next to "MySQL Connections"
3. Connection settings:
   - **Connection Name:** Local MariaDB
   - **Hostname:** `127.0.0.1`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** (leave blank or store)
4. Click **"Test Connection"**
5. Click **"OK"**

---

## 5?? **Command Line (Already Available!)**

**?? TL;DR:** Always available, fastest for quick queries, steeper learning curve.

### Quick Commands:

```powershell
# Add MySQL to PATH
$env:Path += ";C:\Program Files\MariaDB 12.1\bin"

# Connect to database
mysql -u root

# Show databases
mysql -u root -e "SHOW DATABASES;"

# Show tables in EVE2 database
mysql -u root -e "USE realfey_realfey_eve2_project; SHOW TABLES;"

# Show tables in Illusion database
mysql -u root -e "USE realfey_illusion_spells_db; SHOW TABLES;"

# Query data
mysql -u root -e "USE realfey_illusion_spells_db; SELECT * FROM spells LIMIT 10;"

# Interactive mode
mysql -u root realfey_realfey_eve2_project
```

### Useful SQL Commands:
```sql
-- Show databases
SHOW DATABASES;

-- Use a database
USE realfey_realfey_eve2_project;

-- Show tables
SHOW TABLES;

-- Describe table structure
DESCRIBE EVE2_Players;

-- Show table data
SELECT * FROM EVE2_Players LIMIT 10;

-- Count rows
SELECT COUNT(*) FROM EVE2_Players;

-- Exit
EXIT;
```

---

## ??? **Your Databases**

**?? TL;DR:** Two databases - EVE2 (inventory) and illusion_spells (spell reference), both on localhost.

### Database 1: `realfey_realfey_eve2_project`
- **User:** `realfey_realfey_realfeyuser`
- **Password:** `LocalDevPassword123!`
- **Contains:** EVE Online inventory system
- **Main Tables:** EVE2_Players, EVE2_CargoSpace, EVE2_Objects, EVE2_Locations, etc.

### Database 2: `realfey_illusion_spells_db`
- **User:** `realfey_illusion_spells_DB`
- **Password:** `LocalDevPassword123!`
- **Contains:** Pathfinder 2E illusion spells
- **Main Tables:** spells, categories, spell_categories

---

## ?? **My Recommendation**

**?? TL;DR:** Start with HeidiSQL for development, use phpMyAdmin on production server.

**For you, I recommend HeidiSQL because:**
1. ? No web server setup needed
2. ? Fast installation (via winget)
3. ? Simple interface
4. ? Perfect for local development
5. ? No extra dependencies

**Install now:**
```powershell
.\install-phpmyadmin.ps1
# Then choose option 3
```

**Or directly:**
```powershell
winget install HeidiSQL.HeidiSQL
```

---

## ?? **Quick Links**

- [HeidiSQL Download](https://www.heidisql.com/download.php)
- [DBeaver Download](https://dbeaver.io/download/)
- [MySQL Workbench Download](https://dev.mysql.com/downloads/workbench/)

---

## ?? **Tips**

1. **Start MariaDB first** before connecting with any tool
2. **Connection info:**
   - Host: `localhost` or `127.0.0.1`
   - Port: `3306`
   - User: `root`
   - Password: (blank)
3. **For production:** Use the specific database users:
   - EVE2: `realfey_realfey_realfeyuser` / `LocalDevPassword123!`
   - Illusion: `realfey_illusion_spells_DB` / `LocalDevPassword123!`

---

Need help choosing? **Just run `.\install-phpmyadmin.ps1` and pick option 3 (HeidiSQL)!** ?????

---
title: "DirectAdmin Environment Setup Guide"
version: v2.0.0
created: 2024-12-22
updated: 2025-12-29
status: current
category: setup
tags: [directadmin, environment-variables, production, deployment]
---

# ?? DirectAdmin Environment Setup Guide

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Overview](#-overview)
- [Step 1: Install Required Package](#-step-1-install-required-package)
- [Step 2: Create Environment Files](#-step-2-create-environment-files)
- [Step 3: Update Database Config Files](#-step-3-update-database-config-files)
- [Step 4: DirectAdmin Configuration](#-step-4-directadmin-configuration)
- [Step 5: Update .gitignore](#-step-5-update-gitignore)
- [Step 6: Testing](#-step-6-testing)
- [Files to Commit to GitHub](#-files-to-commit-to-github)
- [Deployment Workflow](#-deployment-workflow)
- [DirectAdmin Environment Variable Locations](#-directadmin-environment-variable-locations)
- [Tips for DirectAdmin](#-tips-for-directadmin)
- [Troubleshooting](#-troubleshooting)

---

## ?? **TL;DR**

**?? Purpose:** Move database passwords from code to environment variables for security.

**Steps:** Install dotenv ? create .env file ? update dbcon files ? set vars in DirectAdmin ? test.

**Result:** No hardcoded passwords, same .env pattern for local and production.

**Time:** 15-20 minutes

---

## ?? **Overview:**

**?? TL;DR:** Environment variables keep secrets out of code - use .env locally, DirectAdmin panel for production.

---

## ?? **Step 1: Install Required Package**

**?? TL;DR:** Install dotenv package to load environment variables from .env file.

```powershell
npm install dotenv --save
```

This adds the `dotenv` package to load environment variables from `.env` files.

---

## ?? **Step 2: Create Environment Files**

**?? TL;DR:** Create .env for local secrets, .env.example as template for others.

### **Create `.env` (Local Development - NOT committed to Git)**

Create a new file called `.env` in your project root:

```env
# Local Development Database Configuration
NODE_ENV=development

# EVE2 Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=LocalDevPassword123!
DB_NAME=realfey_realfey_eve2_project

# Illusion Spells Database
DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=LocalDevPassword123!
DB_ILLUSION_NAME=realfey_illusion_spells_DB

# Session Secret
SESSION_SECRET=5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r

# Server Port
PORT=3000
```

### **Create `.env.production` (Template for Production)**

```env
# Production Database Configuration
NODE_ENV=production

# EVE2 Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=YourProductionPasswordHere
DB_NAME=realfey_realfey_eve2_project

# Illusion Spells Database
DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=YourIllusionPasswordHere
DB_ILLUSION_NAME=realfey_illusion_spells_DB

# Session Secret
SESSION_SECRET=YourProductionSessionSecretHere

# Server Port
PORT=80
```

### **Create `.env.example` (Committed to Git - Template for Others)**

```env
# Database Configuration
NODE_ENV=development

# EVE2 Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Illusion Spells Database
DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=your_illusion_user
DB_ILLUSION_PASSWORD=your_illusion_password
DB_ILLUSION_NAME=your_illusion_database

# Session Secret
SESSION_SECRET=your_session_secret_here

# Server Port
PORT=3000
```

---

## ?? **Step 3: Update Database Config Files**

**?? TL;DR:** Modify dbcon.js files to use process.env instead of hardcoded values.

### **Update `dbcon.js`:**

```javascript
// Load environment variables
require('dotenv').config();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST || 'localhost',
  port            : process.env.DB_PORT || 3306,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_NAME,
  multipleStatements: true
});

module.exports.pool = pool;
```

### **Update `dbcon_illusion.js`:**

```javascript
// Load environment variables
require('dotenv').config();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_ILLUSION_HOST || 'localhost',
  port            : process.env.DB_ILLUSION_PORT || 3306,
  user            : process.env.DB_ILLUSION_USER,
  password        : process.env.DB_ILLUSION_PASSWORD,
  database        : process.env.DB_ILLUSION_NAME,
  multipleStatements: true
});

module.exports.pool = pool;
```

### **Update `main.js` (Session Secret):**

Find this line in `main.js`:
```javascript
app.use(session({
    secret:'5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r',
```

Replace with:
```javascript
// Load environment variables at the top of the file
require('dotenv').config();

// ... existing code ...

app.use(session({
    secret: process.env.SESSION_SECRET || '5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r',
```

---

## ??? **Step 4: DirectAdmin Configuration**

**?? TL;DR:** Set environment variables in DirectAdmin Node.js panel for production.

DirectAdmin supports environment variables through Node.js app setup. Here's how:

### **Option A: Using DirectAdmin's Node.js Manager**

1. **Log into DirectAdmin**
2. **Go to:** Advanced Features ? Node.js Setup (or Node.js Selector)
3. **Select your application**
4. **Add Environment Variables:**

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=YourActualProductionPassword
DB_NAME=realfey_realfey_eve2_project

DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=YourActualIllusionPassword
DB_ILLUSION_NAME=realfey_illusion_spells_DB

SESSION_SECRET=YourProductionSessionSecret
NODE_ENV=production
PORT=80
```

5. **Save and restart** your Node.js application

### **Option B: Using `.env` File on Server**

If DirectAdmin doesn't have a built-in environment variable manager:

1. **Upload `.env` file** to your production server via SFTP
2. **Place it in your app root directory** (same level as `main.js`)
3. **Important:** Make sure `.env` has proper permissions:
   ```bash
   chmod 600 .env
   ```
4. **The file should NOT be readable by others** for security

### **Option C: Using pm2 (Process Manager)**

If you're using pm2 to run your Node.js app:

1. **Create `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [{
    name: 'realfeygon',
    script: './main.js',
    env_production: {
      NODE_ENV: 'production',
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_USER: 'realfey_realfey_realfeyuser',
      DB_PASSWORD: 'YourActualProductionPassword',
      DB_NAME: 'realfey_realfey_eve2_project',
      DB_ILLUSION_HOST: 'localhost',
      DB_ILLUSION_PORT: 3306,
      DB_ILLUSION_USER: 'realfey_illusion_spells_DB',
      DB_ILLUSION_PASSWORD: 'YourActualIllusionPassword',
      DB_ILLUSION_NAME: 'realfey_illusion_spells_DB',
      SESSION_SECRET: 'YourProductionSessionSecret',
      PORT: 80
    }
  }]
}
```

2. **Start with pm2:**
```bash
pm2 start ecosystem.config.js --env production
```

**Note:** Add `ecosystem.config.js` to `.gitignore` if it contains secrets!

---

## ?? **Step 5: Update .gitignore**

**?? TL;DR:** Ensure .env is gitignored so secrets never get committed.

Make sure your `.gitignore` includes:

```gitignore
# Environment variables (NEVER commit these!)
.env
.env.local
.env.production
ecosystem.config.js

# Local config files
*.local.js
dbcon.local.js
dbcon_illusion.local.js
```

---

## ? **Step 6: Testing**

**?? TL;DR:** Test locally with .env, verify production with DirectAdmin env vars.

### **Test Locally:**

```powershell
# Start with local .env file
node main.js 3000

# Or use your start script
.\start-local.ps1 3000
```

### **Test on Production:**

1. **Upload your updated files** to DirectAdmin (via SFTP)
2. **Set environment variables** in DirectAdmin (Option A)
   - OR upload `.env` file (Option B)
   - OR use pm2 config (Option C)
3. **Restart your Node.js application**
4. **Test your site:** https://realfeygon.com

---

## ?? **Files to Commit to GitHub:**

**?? TL;DR:** Commit .env.example and updated dbcon files, never commit .env itself.

```
? .env.example         - Template (no real passwords)
? dbcon.js            - Uses environment variables
? dbcon_illusion.js   - Uses environment variables
? main.js             - Uses environment variables
? package.json        - Includes dotenv dependency
? .gitignore          - Excludes .env files
```

```
? .env                - Local dev (has real passwords)
? .env.production     - Production (has real passwords)
? dbcon.local.js      - Local only
? ecosystem.config.js - If it has passwords
```

---

## ?? **Deployment Workflow:**

**?? TL;DR:** Local uses .env file, production uses DirectAdmin environment variables panel.

### **Local Development:**
1. Use `.env` file with local credentials
2. Run `.\start-local.ps1 3000`
3. Test your changes

### **Committing to Git:**
1. Changes to code go to GitHub
2. `.env` stays local (ignored by git)
3. Only `.env.example` is committed

### **Deploying to Production:**
1. Push code to GitHub (no passwords!)
2. Pull code on production server
3. Set environment variables in DirectAdmin
4. Restart Node.js app

---

## ?? **DirectAdmin Environment Variable Locations:**

**?? TL;DR:** Node.js Selector ? select app ? Environment Variables tab.

Environment variables in DirectAdmin can be set in several places:

1. **Node.js App Manager:**
   - Advanced Features ? Node.js Setup
   - Look for "Environment Variables" section

2. **Application Settings:**
   - Some DirectAdmin setups have an "Application" menu
   - Check under Node.js application settings

3. **SSH Access:**
   - If you have SSH access, you can set them in shell startup files
   - Or use a `.env` file in your app directory

4. **Control Panel ? Application Manager:**
   - Modern DirectAdmin versions may have this
   - Look for environment configuration options

---

## ?? **Tips for DirectAdmin:**

**?? TL;DR:** Use different passwords for prod, document variables, restart after changes, backup settings.

1. **After setting environment variables in DirectAdmin:**
   - Always restart your Node.js application
   - Check application logs for errors

2. **If DirectAdmin doesn't support env vars natively:**
   - Use Option B (`.env` file on server)
   - Make sure the file has proper permissions

3. **Testing Environment Variables:**
   - Add console.log to check if variables are loaded:
   ```javascript
   console.log('DB_HOST:', process.env.DB_HOST);
   console.log('Environment loaded successfully!');
   ```

4. **GeniusMojo DirectAdmin Specifics:**
   - Contact GeniusMojo support to ask:
     - "How do I set environment variables for my Node.js app?"
     - "Do you support .env files for Node.js apps?"
     - "Can I use pm2 or similar process manager?"

---

## ?? **Troubleshooting:**

**?? TL;DR:** Common issues - .env not loaded, variables not set in DirectAdmin, typos in var names, app not restarted.

### **"Cannot connect to database" on production:**
- Check environment variables are set correctly in DirectAdmin
- Verify database credentials match what's in DirectAdmin panel
- Check Node.js app logs for actual error messages

### **Environment variables not loading:**
- Make sure `require('dotenv').config();` is at the TOP of your files
- Verify `.env` file exists in the app root directory
- Check file permissions on `.env` file (should be 600)

### **Works locally but not on production:**
- Compare local `.env` with production environment variables
- Check if production database hostname is correct (might not be 'localhost')
- Verify all required environment variables are set

---

## ?? **Next Steps:**

1. **Install dotenv:** `npm install dotenv`
2. **Create `.env` files** (use templates above)
3. **Update config files** (dbcon.js, dbcon_illusion.js, main.js)
4. **Test locally**
5. **Commit to GitHub** (without .env!)
6. **Set up environment variables in DirectAdmin**
7. **Deploy and test**

---

**Need help with any specific step? Let me know!** ??

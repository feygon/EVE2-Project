# GitHub Sync Guide

Your GitHub repo (https://github.com/feygon/EVE2-Project) is out of date. Let's sync it properly!

## ?? **Current Situation:**
- ? Local copy: Up-to-date (your computer)
- ? Production: Up-to-date (GeniusMojo via SFTP)
- ? GitHub: Out-of-date (needs updating)

---

## ?? **Quick Start (Recommended Approach):**

### **Step 1: Check Current Git Status**
```powershell
# Navigate to your project
cd D:\Repos\RealFeygon

# Check if git is initialized
git status
```

### **Step 2: Link to Your GitHub Repo**
```powershell
# If git is not initialized, initialize it
git init

# Add your GitHub repo as remote
git remote add origin https://github.com/feygon/EVE2-Project.git

# Check remote is added
git remote -v
```

### **Step 3: Review What Will Be Committed**
```powershell
# See what files will be committed
git status

# See what's in .gitignore
cat .gitignore
```

**IMPORTANT:** Make sure these are in `.gitignore`:
- ? `dbcon.local.js` - Local config (already there)
- ? `dbcon_illusion.local.js` - Local config (already there)
- ? `node_modules/` - Dependencies (already there)
- ?? **DO NOT COMMIT:** Production passwords in `dbcon.js` and `dbcon_illusion.js`

### **Step 4: Stage Your Changes**
```powershell
# Add all files (respecting .gitignore)
git add .

# Or add specific files
git add main.js package.json README.md
# ... etc
```

### **Step 5: Create Initial Commit**
```powershell
git commit -m "Update project with local dev environment setup

- Add local development setup scripts
- Add MariaDB configuration
- Add database management tools
- Add comprehensive documentation
- Update .gitignore for local configs"
```

### **Step 6: Push to GitHub**
```powershell
# First time: Set branch and push
git branch -M main
git push -u origin main --force

# Note: Using --force because GitHub repo is out of date
# This will overwrite GitHub with your current version
```

---

## ?? **BEFORE YOU PUSH - Security Check:**

### **Critical: Protect Production Credentials**

Your `dbcon.js` and `dbcon_illusion.js` contain **production passwords**. You have two options:

#### **Option A: Use Environment Variables (Recommended)**
Create a new config system that uses environment variables for sensitive data.

#### **Option B: Keep Config Files But Remove Passwords**
Replace production passwords with placeholders before committing.

**Let me know which approach you prefer, and I'll help you implement it!**

---

## ?? **Recommended .gitignore Updates:**

Let me update your .gitignore to be more comprehensive:

```gitignore
# Dependencies
node_modules/
npm-debug.log
yarn-error.log
package-lock.json

# Local development config files
*.local.js
dbcon.local.js
dbcon_illusion.local.js
config.local.js

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
logs/

# Temporary files
temp_*.sql
*.tmp

# Database backups (keep these local)
*.sql.bak
backup/
database_backups/

# Session files
sessions/

# Cleanup docs (not needed in repo)
NEXT_STEPS.md
SETUP_SUMMARY.md
install-phpmyadmin.ps1
```

---

## ?? **Security Best Practices:**

### **Option 1: Environment Variables (Best Practice)**

1. **Install dotenv:**
```powershell
npm install dotenv
```

2. **Create `.env` file** (NOT committed to git):
```env
# Database Configuration
DB_HOST=your-production-host
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=YourActualProductionPassword
DB_NAME=realfey_realfey_eve2_project

DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=YourIllusionPassword
DB_ILLUSION_NAME=realfey_illusion_spells_DB
```

3. **Create `.env.example`** (committed to git):
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

DB_ILLUSION_USER=your_illusion_user
DB_ILLUSION_PASSWORD=your_illusion_password
DB_ILLUSION_NAME=your_illusion_database
```

4. **Update config files to use environment variables**

### **Option 2: Config File with Placeholders**

Replace actual passwords in `dbcon.js` with:
```javascript
password: process.env.DB_PASSWORD || 'CHANGE_ME_IN_PRODUCTION',
```

Then set environment variables on GeniusMojo.

---

## ?? **What to Commit vs. What to Ignore:**

### **? COMMIT These:**
```
? main.js, *.js (application code)
? package.json (dependencies)
? views/ (templates)
? public/ (static files)
? scripts/ (your callback modules)
? *.sql (database schemas - EVE2 DDQ.sql, illusions DDQ.sql)
? README.md, LOCAL_SETUP.md, etc. (documentation)
? setup-local.ps1, start-local.ps1, db-tools.ps1 (helper scripts)
? .gitignore (important!)
```

### **? DO NOT COMMIT:**
```
? node_modules/ (too large, use package.json)
? *.local.js (local configs)
? .env (contains secrets)
? database_backups/ (local backups)
? Production passwords in any file
```

---

## ?? **Going Forward - Workflow:**

### **Daily Development:**
1. Make changes locally
2. Test with `.\start-local.ps1 3000`
3. Commit to git: `git add . && git commit -m "Your changes"`
4. Push to GitHub: `git push`
5. Deploy to GeniusMojo (via SFTP or other method)

### **Deploying to Production:**
You'll still use SFTP to upload to GeniusMojo, but now you have:
- ? Version history on GitHub
- ? Backup of your code
- ? Ability to roll back changes
- ? Local testing environment

---

## ??? **Step-by-Step Checklist:**

```powershell
# 1. Check current status
git status

# 2. Initialize if needed
git init

# 3. Add GitHub remote
git remote add origin https://github.com/feygon/EVE2-Project.git

# 4. Update .gitignore (see above)
# Edit .gitignore file

# 5. IMPORTANT: Secure your credentials
# Choose Option A or B above

# 6. Stage changes
git add .

# 7. Review what will be committed
git status

# 8. Commit
git commit -m "Sync local development environment"

# 9. Push to GitHub
git branch -M main
git push -u origin main --force

# 10. Verify on GitHub
# Visit: https://github.com/feygon/EVE2-Project
```

---

## ?? **Recommended Next Steps:**

1. **Secure production credentials** (choose Option A or B)
2. **Update .gitignore** with comprehensive rules
3. **Create initial commit** with all current changes
4. **Push to GitHub**
5. **Set up GitHub Actions** (optional - for automated testing/deployment)

---

## ? **Questions to Answer:**

1. **Do you want to use environment variables or config files with placeholders?**
2. **Do you want me to help migrate to environment variables?**
3. **Should we add any files to .gitignore that I missed?**

---

**Ready to proceed? Let me know which security approach you prefer (Option A or B), and I'll guide you through it!** ??

---
title: "Pre-Deployment Checklist"
version: v2.0.0
created: 2024-12-24
updated: 2025-12-29
status: current
category: deployment
tags: [deployment, checklist, validation]
---

# ? Pre-Deployment Checklist

**Version:** v2.0.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [Complete This Before Deploying](#-complete-this-before-deploying)
- [GitHub Commit Steps](#-github-commit-steps)
- [Production Deployment Steps](#-production-deployment-steps)
- [Production Testing](#-production-testing)
- [Rollback Plan](#-rollback-plan-if-needed)
- [Success Criteria](#-success-criteria)
- [Support Resources](#-support-resources)

---

## ?? **TL;DR**

**?? Before deploying, verify:**
1. All routes work locally
2. No secrets in Git
3. Environment variables ready
4. GitHub committed and pushed
5. SFTP credentials ready
6. Know rollback procedure

**Process:** Test local ? secure code ? commit ? deploy ? test production

**Time:** 30-45 minutes

---

## ?? **Complete This Before Deploying**

**?? TL;DR:** Test locally, verify security, check code, validate file structure, prepare GitHub commit.

### **1. Local Testing** ??
```powershell
# Start the server
.\start-local.ps1 3000

# Test ALL routes:
```
- [ ] http://localhost:3000/resume - Works
- [ ] http://localhost:3000/eve2 - Works  
- [ ] http://localhost:3000/illusion - Works with new layout
  - [ ] Categories show `<strong>` tags (not `<h2>`)
  - [ ] Arrow and category name on same line
  - [ ] Spell details show: rank, range, target, duration, defense, heighten
  - [ ] Tooltips work on hover
  - [ ] All 74 spells display correctly

### **2. Security Check** ??

**?? TL;DR:** Verify .env, passwords, SSH keys not in git status.

```powershell
# Verify these are gitignored
git status | Select-String -Pattern ".env|.local.js|.vscode|node_modules"
# Should show: nothing to commit or only .gitignore changes
```

- [ ] `.env` is NOT in git status
- [ ] `.env.production` is NOT in git status
- [ ] `*.local.js` files are NOT in git status
- [ ] `.vscode/` folder is NOT in git status
- [ ] `node_modules/` is NOT in git status

### **3. Code Review** ??

**?? TL;DR:** Confirm all DB configs use process.env, no hardcoded passwords.

```powershell
# Should see process.env, not hardcoded passwords
Get-Content dbcon.js | Select-String "process.env"
Get-Content dbcon_illusion.js | Select-String "process.env"
```

- [ ] `dbcon.js` uses `process.env.DB_PASSWORD`
- [ ] `dbcon_illusion.js` uses `process.env.DB_ILLUSION_PASSWORD`
- [ ] No production passwords in code files

### **4. File Structure** ??

**?? TL;DR:** Check partials have .handlebars extension, no duplicates.

```powershell
Get-ChildItem views\partials | Select-Object Name
```

Should show:
- [ ] `category_block.handlebars` (not .hbs)
- [ ] `spell_entry.handlebars` (not .hbs)
- [ ] No duplicate `.hbs` files

### **5. GitHub Preparation** ??

**?? TL;DR:** Review changes with git status and git diff before committing.

```powershell
# Check what will be committed
git status

# Review changes
git diff
```

- [ ] All new documentation files are staged
- [ ] Updated view files are staged
- [ ] `.env.example` is staged (template)
- [ ] `.gitignore` is updated and staged
- [ ] Setup scripts are staged

### **6. Commit Message Ready** ??

**?? TL;DR:** Use semantic commit format describing major changes, technical details, and security improvements.

Use this commit message:
```
Complete local dev setup and fix illusion page

Major changes:
- Set up local development environment with MariaDB
- Migrate database configs to environment variables
- Fix illusion page: hierarchical partials, proper field display
- Update category headers: h2 ? strong for better layout
- Add comprehensive documentation and setup scripts

Technical:
- dbcon.js, dbcon_illusion.js use environment variables
- category_block.handlebars spacing fixed
- spell_entry.handlebars shows all fields
- Added cache: false for development
- Automated setup scripts for Windows

Security:
- Production passwords removed from code
- Comprehensive .gitignore
- Environment variable templates
```

---

## ?? **GitHub Commit Steps**

**?? TL;DR:** Stage all, verify, commit with message, push to main, verify on GitHub.

```powershell
# 1. Stage all changes
git add .

# 2. Verify
git status

# 3. Commit
git commit -m "Complete local dev setup and fix illusion page"

# 4. Push
git push -u origin main
```

- [ ] Committed to Git
- [ ] Pushed to GitHub
- [ ] Verified on GitHub.com

---

## ?? **Production Deployment Steps**

**?? TL;DR:** Set DirectAdmin env vars, upload via SFTP (exclude node_modules/.env), SSH to server, npm install, restart app.

### **Before Deploying:**

- [ ] Reviewed **DEPLOYMENT_GUIDE.md**
- [ ] Have SFTP credentials ready
- [ ] Know DirectAdmin login
- [ ] Have production database passwords ready

### **Environment Variables Setup:**

In DirectAdmin, set these:
```
DB_HOST=localhost
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=[YOUR_PRODUCTION_DB_PASSWORD]
DB_NAME=realfey_realfey_eve2_project

DB_ILLUSION_HOST=localhost
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=[YOUR_PRODUCTION_DB_PASSWORD]
DB_ILLUSION_NAME=realfey_illusion_spells_DB

SESSION_SECRET=[YOUR_PRODUCTION_SESSION_SECRET]
NODE_ENV=production
PORT=80
```

- [ ] Environment variables documented
- [ ] Ready to set in DirectAdmin

### **SFTP Upload:**

**Connection:**
```
Host: server06.hostwhitelabel.com
Port: 27493
Username: realfey
Path: /home/realfey/eve2
Key: .vscode/rsa-key-20251219OpenSSH.ppk
```

- [ ] VS Code SFTP extension installed
- [ ] Or FileZilla/WinSCP ready
- [ ] SSH key path confirmed

### **Files to Upload:**

- [ ] `main.js`
- [ ] `dbcon.js`, `dbcon_illusion.js`
- [ ] `illusion.js`, `eve2.js`, `resume.js`
- [ ] `package.json`
- [ ] `views/` directory (all templates)
- [ ] `scripts/` directory
- [ ] `public/` directory (static files)

**DO NOT Upload:**
- [ ] ? `node_modules/`
- [ ] ? `.env` or `.env.production`
- [ ] ? `*.local.js` files
- [ ] ? `.vscode/` directory
- [ ] ? Documentation files (optional)

### **Post-Upload:**

SSH into server:
```bash
ssh -i ".vscode\rsa-key-20251219OpenSSH.ppk" -p 27493 realfey@server06.hostwhitelabel.com
```

Then run:
```bash
cd /home/realfey/eve2
npm install
# Set environment variables in DirectAdmin
# Restart Node.js app
```

- [ ] SSH connection tested
- [ ] `npm install` completed
- [ ] Environment variables set
- [ ] App restarted

---

## ?? **Production Testing**

**?? TL;DR:** Test all routes, verify illusion page layout, check database connection, no console errors.

Visit these URLs:
- [ ] https://realfeygon.com/resume
- [ ] https://realfeygon.com/eve2
- [ ] https://realfeygon.com/illusion

**Illusion Page Checks:**
- [ ] Page loads without errors
- [ ] 14 categories display
- [ ] Category headers inline (arrow + name + count)
- [ ] Expanding category shows spells
- [ ] Spell details show all fields
- [ ] Tooltips work on hover
- [ ] No console errors
- [ ] Database connects successfully

---

## ?? **Rollback Plan (If Needed)**

**?? TL;DR:** Revert git, check logs, fix common issues (env vars, DB creds, app restart, cache).

If deployment fails:

1. **Revert to previous version:**
   ```bash
   # SSH into server
   cd /home/realfey/eve2
   git pull origin main~1  # If using git on server
   # Or restore from backup
   ```

2. **Check logs:**
   ```bash
   # Check Node.js logs in DirectAdmin
   # Or
   pm2 logs
   ```

3. **Common issues:**
   - Environment variables not set ? Check DirectAdmin
   - Database connection fails ? Verify DB credentials
   - Templates not updating ? Restart Node.js app
   - Old version showing ? Clear browser cache

---

## ?? **Success Criteria**

**?? TL;DR:** Deployment succeeds when all routes work, new layout shows, DB connects, no errors.

Deployment is successful when:
- ? All routes work without errors
- ? Illusion page shows new layout
- ? Database connections work
- ? No 500 errors
- ? No console errors
- ? Production passwords secure

---

## ?? **Support Resources**

- **DEPLOYMENT_GUIDE.md** - Detailed deployment steps
- **TROUBLESHOOTING.md** - Common issues
- **DIRECTADMIN_ENV_SETUP.md** - Environment setup
- **GITHUB_PREP.md** - Git workflow

---

## ?? **Ready to Deploy?**

Complete this checklist, then:

1. ? **Commit to GitHub** (see GITHUB_PREP.md)
2. ?? **Review deployment guide** (DEPLOYMENT_GUIDE.md)
3. ?? **Deploy to production**
4. ?? **Test production site**
5. ?? **Celebrate!**

**Good luck!** ??

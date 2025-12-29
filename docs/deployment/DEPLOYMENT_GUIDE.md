# ?? Production Deployment Guide

**Version:** v2.0.0 (CI/CD pipeline)  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [SFTP Credentials](#-sftp-credentials-do-not-commit)
- [Before Deployment](#-important-before-deployment)
- [What Will Be Deployed](#-what-will-be-deployed)
- [Deployment Methods](#-deployment-methods)
- [Post-Deployment Steps](#-post-deployment-steps)
- [Verification Checklist](#-verification-checklist)
- [Troubleshooting](#-troubleshooting)
- [Deployment History](#-deployment-history)
- [Security Notes](#-security-notes)
- [Related Documentation](#-related-documentation)
- [Quick Deploy Commands](#-quick-deploy-commands)

---

## ?? **TL;DR**

**?? Quick Deploy Process:**
1. Set environment variables in DirectAdmin
2. Upload files via SFTP (exclude node_modules, .env)
3. SSH to server, run `npm install`
4. Restart Node.js app in DirectAdmin
5. Test all routes (/, /resume, /eve2, /illusion)

**Methods:** VS Code SFTP extension (easiest), WinSCP, or command line

**Time:** 15-30 minutes

---

## ?? **SFTP Credentials (DO NOT COMMIT)**

**?? TL;DR:** Use these credentials for SFTP uploads - private key is in .vscode folder, never commit it.

### **Connection Details:**
```
Host: server06.hostwhitelabel.com
Port: 27493
Protocol: SFTP
Username: realfey
Remote Path: /home/realfey/eve2
Private Key: .vscode/rsa-key-20251219OpenSSH.ppk
```

---

## ?? **IMPORTANT: Before Deployment**

**?? TL;DR:** Set production environment variables in DirectAdmin first - includes DB credentials, session secret, NODE_ENV=production.

### **1. Environment Variables Setup**

Your production server needs these environment variables set in DirectAdmin:

```bash
NODE_ENV=production

# EVE2 Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=[YOUR_PRODUCTION_DB_PASSWORD]
DB_NAME=realfey_realfey_eve2_project

# Illusion Spells Database
DB_ILLUSION_HOST=localhost
DB_ILLUSION_PORT=3306
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=[YOUR_PRODUCTION_DB_PASSWORD]
DB_ILLUSION_NAME=realfey_illusion_spells_DB

# Session Secret
SESSION_SECRET=[YOUR_PRODUCTION_SESSION_SECRET]

# Server Port
PORT=80
```

See **DIRECTADMIN_ENV_SETUP.md** for detailed instructions.

---

## ?? **What Will Be Deployed**

**?? TL;DR:** Upload all source files except node_modules, .env, .vscode - dependencies installed on server.

### **? Files to Upload:**
```
? main.js                      - Main server (now with env vars + cache:false)
? illusion.js                  - Illusion routes
? eve2.js                      - EVE2 routes
? resume.js                    - Resume routes
? package.json                 - Dependencies
? dbcon.js                     - EVE2 DB config (uses env vars)
? dbcon_illusion.js            - Illusion DB config (uses env vars)
? views/                       - All templates
   ??? illusions.handlebars     - Updated with partials
   ??? partials/
   ?   ??? category_block.handlebars ? (fixed <h2> ? <strong>)
   ?   ??? spell_entry.handlebars    ? (shows all fields)
   ??? layouts/
? public/                      - Static assets
? scripts/                     - Callbacks and queries
   ??? illusionCallbacks.js
   ??? queries.js
```

### **? Files NOT to Upload (gitignored):**
```
? node_modules/               - Will run npm install on server
? .env                        - Local only
? .env.production             - Template only
? *.local.js                  - Local configs
? .vscode/                    - IDE settings + SSH keys
? database_backups/           - Local backups
? Documentation files (.md)   - Optional
```

---

## ?? **Deployment Methods**

**?? TL;DR:** Three options - VS Code SFTP (recommended), manual SFTP client, or command line rsync/scp.

### **Option 1: Using VS Code SFTP Extension** (Recommended)

Your `sftp.json` is already configured!

1. **Install Extension:**
   - VS Code ? Extensions ? Search "SFTP"
   - Install "SFTP" by Natizyskunk

2. **Configure Upload:**
   - Press `Ctrl+Shift+P`
   - Type "SFTP: Config"
   - Your config is already at `.vscode/sftp.json`

3. **Upload Files:**
   ```
   Method A: Auto-upload on save (already enabled)
   Method B: Right-click folder ? "Upload Folder"
   Method C: Ctrl+Shift+P ? "SFTP: Upload Folder"
   ```

4. **Verify Upload:**
   - Check server path: `/home/realfey/eve2/`
   - Verify all files uploaded

---

### **Option 2: Manual SFTP (FileZilla/WinSCP)**

**Using WinSCP:**

1. **Import Private Key:**
   - Tools ? Run PuTTYgen
   - Load `.vscode/rsa-key-20251219.ppk`
   - Save as OpenSSH format if needed

2. **Connect:**
   ```
   Protocol: SFTP
   Host: server06.hostwhitelabel.com
   Port: 27493
   Username: realfey
   Private Key: Browse to .vscode/rsa-key-20251219OpenSSH.ppk
   ```

3. **Navigate to:**
   ```
   Remote: /home/realfey/eve2/
   Local: D:\Repos\RealFeygon\
   ```

4. **Upload Files:**
   - Select all files EXCEPT: node_modules/, .env, *.local.js, .vscode/
   - Right-click ? Upload

---

### **Option 3: Command Line (OpenSSH)**

```powershell
# Using scp with private key
scp -i ".vscode\rsa-key-20251219OpenSSH.ppk" -P 27493 -r * realfey@server06.hostwhitelabel.com:/home/realfey/eve2/

# Or using rsync (if available)
rsync -avz -e "ssh -i .vscode/rsa-key-20251219OpenSSH.ppk -p 27493" --exclude 'node_modules' --exclude '.env' --exclude '*.local.js' ./ realfey@server06.hostwhitelabel.com:/home/realfey/eve2/
```

---

## ?? **Post-Deployment Steps**

**?? TL;DR:** SSH to server, npm install, verify env vars, restart app, test all routes.

### **1. SSH into Server**

```powershell
ssh -i ".vscode\rsa-key-20251219OpenSSH.ppk" -p 27493 realfey@server06.hostwhitelabel.com
```

### **2. Navigate to App Directory**

```bash
cd /home/realfey/eve2
```

### **3. Install Dependencies**

```bash
npm install
```

### **4. Set Environment Variables**

**Option A: DirectAdmin Panel**
- Go to DirectAdmin ? Node.js Setup
- Add all environment variables listed above

**Option B: Create .env on Server**
```bash
# Upload .env.production as .env
nano .env
# Paste the environment variables
# Save: Ctrl+X, Y, Enter
chmod 600 .env
```

### **5. Restart Node.js Application**

**In DirectAdmin:**
- Go to Node.js Setup
- Find your app
- Click "Restart"

**Or via command line (if using pm2):**
```bash
pm2 restart realfeygon
# Or
pm2 reload ecosystem.config.js --env production
```

### **6. Test the Deployment**

Visit these URLs:
- https://realfeygon.com/resume
- https://realfeygon.com/eve2
- https://realfeygon.com/illusion ? (Updated!)

**Check the illusion page:**
- Categories should show `<strong>` tags (not `<h2>`)
- Spell entries should show ALL fields (range, target, duration, etc.)
- Tooltips should work on hover

---

## ? **Verification Checklist**

**?? TL;DR:** Check all routes work, no errors in console or logs, partials render correctly, database connects.

After deployment, verify:

```
? Site loads at https://realfeygon.com
? /resume works
? /eve2 works
? /illusion works with new layout
? Spell categories use <strong> (not <h2>)
? Spell details show: rank, range, target, duration, defense, heighten
? Partials are rendering correctly (category_block ? spell_entry)
? Database connections work (no ECONNREFUSED errors)
? No console errors in browser
? No 500 errors in server logs
```

---

## ?? **Troubleshooting**

**?? TL;DR:** Common issues - database connection fails (check env vars), templates not updating (restart app), old version showing (clear cache).

### **Issue: Database Connection Fails**
```bash
# Check environment variables are set
printenv | grep DB_

# Check if .env exists and has correct permissions
ls -la .env
chmod 600 .env
```

### **Issue: Templates Not Updating**
```bash
# With cache: false in main.js, templates reload on every request
# If still cached, restart Node.js app in DirectAdmin
```

### **Issue: Old Version Still Showing**
```bash
# Clear browser cache completely
# Or open in incognito/private window
```

### **Issue: npm install Fails**
```bash
# Check Node.js version on server
node --version

# Should be 14.x or higher
# If too old, update via DirectAdmin or nvm
```

---

## ?? **Deployment History**

**?? TL;DR:** Track major changes and deployment dates for rollback reference.

| Date | Changes | Files Modified |
|------|---------|----------------|
| 2025-01-XX | Initial local dev setup | Setup scripts, docs |
| 2025-01-XX | Migrate to env variables | dbcon.js, main.js |
| 2025-01-XX | Fix illusion partials | category_block, spell_entry, illusions.handlebars |
| 2025-01-XX | **Ready for deployment** | All files updated ? |

---

## ?? **Security Notes**

**?? TL;DR:** Never commit SSH keys, .env files, or passwords - use environment variables, rotate keys periodically.

1. **Never commit `.ppk` files to Git** ? (already in .gitignore)
2. **Never commit production passwords** ? (using env vars)
3. **Keep `.env` files local only** ? (in .gitignore)
4. **Use different passwords for local vs production** ?
5. **Rotate SSH keys periodically** ?

---

## ?? **Related Documentation**

- **DIRECTADMIN_ENV_SETUP.md** - Environment variable setup
- **GITHUB_SYNC_GUIDE.md** - Git workflow
- **TROUBLESHOOTING.md** - Common issues
- **LOCAL_SETUP.md** - Local development

---

## ? **Quick Deploy Commands**

**?? TL;DR:** Test local ? commit to Git ? upload via SFTP ? SSH to server ? npm install ? restart ? test production.

```powershell
# 1. Test locally first
.\start-local.ps1 3000

# 2. Commit to Git (see GITHUB_PREP.md)
git add .
git commit -m "Fix illusion page partials and styling"
git push

# 3. Deploy via VS Code SFTP
# Right-click project folder ? "Upload Folder"

# 4. SSH into server
ssh -i ".vscode-rsa-key-20251219OpenSSH.ppk" -p 27493 realfey@server06.hostwhitelabel.com

# 5. Run deployment commands
cd /home/realfey/eve2
npm install
# Set environment variables in DirectAdmin
# Restart Node.js app

# 6. Test production
# https://realfeygon.com/illusion
```

---

**Ready to deploy when you are!** ??

**REMEMBER:** Test everything locally first, commit to GitHub, THEN deploy to production!

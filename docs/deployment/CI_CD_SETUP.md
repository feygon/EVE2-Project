# ?? CI/CD Setup Guide - GitHub to DirectAdmin

## ?? Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Steps](#setup-steps)
- [GitHub Actions Workflow](#github-actions-workflow)
- [DirectAdmin Configuration](#directadmin-configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ? TL;DR

**Automated deployment from GitHub to DirectAdmin:**

1. Set up SSH key authentication
2. Add SSH key to GitHub Secrets
3. Create GitHub Actions workflow
4. Push to trigger auto-deploy
5. DirectAdmin restarts app automatically

**Time to setup:** 20-30 minutes

---

## ?? Overview

**What we're building:**

```
GitHub Push ? GitHub Actions ? SFTP Upload ? DirectAdmin ? App Restart
```

**Benefits:**
- ? Automatic deployment on push
- ? No manual SFTP uploads
- ? Consistent deployments
- ? Deployment history in GitHub

---

## ?? Prerequisites

**You need:**

- [x] GitHub repository (EVE2-Project)
- [x] DirectAdmin access
- [x] SSH access to server
- [x] Node.js app running in DirectAdmin

---

## ?? Setup Steps

### **Step 1: Generate SSH Key for Deployment**

**On your local machine:**

```powershell
# Generate new SSH key (no passphrase for automation)
ssh-keygen -t ed25519 -C "github-actions@realfeygon.com" -f github-deploy-key

# This creates two files:
# - github-deploy-key (private key - for GitHub Secrets)
# - github-deploy-key.pub (public key - for server)
```

---

### **Step 2: Add Public Key to DirectAdmin Server**

**Option A: Via DirectAdmin (Easier)**

1. Log into DirectAdmin
2. Go to **Account Manager** ? **SSH Keys**
3. Click **Add New Key**
4. Paste contents of `github-deploy-key.pub`
5. Save

**Option B: Via SSH (Manual)**

```bash
# SSH into your server
ssh your-username@realfeygon.com

# Add public key to authorized_keys
cat >> ~/.ssh/authorized_keys
# Paste contents of github-deploy-key.pub
# Press Ctrl+D

# Set permissions
chmod 600 ~/.ssh/authorized_keys
```

---

### **Step 3: Test SSH Connection**

```powershell
# Test the key works
ssh -i github-deploy-key your-username@realfeygon.com "echo 'Connection successful!'"
```

**Should see:** "Connection successful!"

---

### **Step 4: Add Secrets to GitHub**

**Go to GitHub repository:**

1. Settings ? Secrets and variables ? Actions
2. Click **New repository secret**

**Add these secrets:**

| Name | Value | Description |
|------|-------|-------------|
| `SSH_PRIVATE_KEY` | Contents of `github-deploy-key` file | Private SSH key |
| `SSH_HOST` | `realfeygon.com` | Your server hostname |
| `SSH_USERNAME` | `your-username` | DirectAdmin username |
| `SSH_PORT` | `22` | SSH port (usually 22) |
| `DEPLOY_PATH` | `/home/realfey/eve2` | Deployment directory |

---

### **Step 5: Create GitHub Actions Workflow**

**Create file:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to DirectAdmin

on:
  push:
    branches:
      - main  # Deploy on push to main branch
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests (if any)
        run: npm test --if-present
      
      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy via rsync
        run: |
          rsync -avz --delete \
            -e "ssh -i ~/.ssh/deploy_key -p ${{ secrets.SSH_PORT }}" \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='.env' \
            --exclude='.vs' \
            --exclude='*.log' \
            ./ ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }}:${{ secrets.DEPLOY_PATH }}/
      
      - name: Install production dependencies
        run: |
          ssh -i ~/.ssh/deploy_key \
            -p ${{ secrets.SSH_PORT }} \
            ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} \
            "cd ${{ secrets.DEPLOY_PATH }} && npm ci --production"
      
      - name: Restart Node.js app
        run: |
          ssh -i ~/.ssh/deploy_key \
            -p ${{ secrets.SSH_PORT }} \
            ${{ secrets.SSH_USERNAME }}@${{ secrets.SSH_HOST }} \
            "touch ${{ secrets.DEPLOY_PATH }}/tmp/restart.txt"
      
      - name: Cleanup
        if: always()
        run: rm -f ~/.ssh/deploy_key
```

---

### **Step 6: Create Deployment Documentation**

**Update `.gitignore`:**

```gitignore
# SSH keys (never commit these!)
github-deploy-key
github-deploy-key.pub
*.pem
*.key
```

---

## ?? DirectAdmin Configuration

### **Environment Variables in DirectAdmin**

**Set these in DirectAdmin Node.js app:**

1. Go to **Node.js Selector**
2. Select your app
3. Click **Environment Variables**
4. Add all from `.env.example`:

```
DB_HOST=localhost
DB_USER=realfey_realfey_realfeyuser
DB_PASSWORD=YourProductionPassword
DB_NAME=realfey_realfey_eve2_project

DB_ILLUSION_HOST=localhost
DB_ILLUSION_USER=realfey_illusion_spells_DB
DB_ILLUSION_PASSWORD=YourProductionPassword
DB_ILLUSION_NAME=realfey_illusion_spells_DB

SESSION_SECRET=YourProductionSessionSecret
NODE_ENV=production
PORT=3000
```

---

### **Auto-Restart Configuration**

**DirectAdmin should auto-restart on file changes.**

**If not, add restart script:**

Create `restart-app.sh` on server:

```bash
#!/bin/bash
cd /home/realfey/eve2
touch tmp/restart.txt
echo "App restarted at $(date)" >> deploy.log
```

Make executable:
```bash
chmod +x restart-app.sh
```

---

## ?? Testing

### **Test 1: Manual Workflow Trigger**

1. Go to GitHub ? Actions tab
2. Select "Deploy to DirectAdmin" workflow
3. Click "Run workflow" ? "Run workflow"
4. Watch the deployment

---

### **Test 2: Push to Main**

```powershell
# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test CI/CD deployment"
git push

# Check GitHub Actions tab
# Should see workflow running
```

---

### **Test 3: Verify Production**

**After deployment completes:**

```
https://realfeygon.com/
https://realfeygon.com/index.html
https://realfeygon.com/documentation
https://realfeygon.com/illusion
```

**All should work!**

---

## ?? Troubleshooting

### **Issue: SSH Connection Failed**

**Check:**
```powershell
# Test SSH key locally
ssh -i github-deploy-key your-username@realfeygon.com "pwd"
```

**Fix:**
- Verify public key is in `~/.ssh/authorized_keys` on server
- Check file permissions (600 for authorized_keys)
- Ensure private key is in GitHub Secrets correctly

---

### **Issue: Deployment Succeeds but Site Doesn't Update**

**Check:**

1. **Files uploaded?**
   ```bash
   ssh your-username@realfeygon.com "ls -la /home/realfey/eve2"
   ```

2. **App restarted?**
   - Check DirectAdmin ? Node.js Selector
   - Manually restart if needed

3. **Environment variables set?**
   - Check DirectAdmin ? Node.js ? Environment Variables

---

### **Issue: npm ci Fails**

**Error:** `package-lock.json` not found or out of sync

**Fix:**
```powershell
# Regenerate package-lock.json
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

---

### **Issue: Workflow Fails on rsync**

**Check exclude patterns:**

Some files should NOT be deployed:
- `node_modules/` (reinstalled on server)
- `.env` (use DirectAdmin env vars)
- `.git/` (not needed in production)
- `.vs/` (IDE files)

**These are excluded in the workflow.**

---

## ?? Monitoring

### **View Deployment Logs**

**In GitHub:**
1. Go to Actions tab
2. Click on specific workflow run
3. Expand each step to see logs

**On Server:**
```bash
# View Node.js logs
tail -f /home/realfey/eve2/logs/app.log

# View deployment log (if created)
tail -f /home/realfey/eve2/deploy.log
```

---

## ?? Best Practices

### **Branch Strategy**

**Current setup:** Deploys on push to `main`

**Recommended for teams:**

```yaml
on:
  push:
    branches:
      - main        # Auto-deploy production
  pull_request:
    branches:
      - main        # Test on PR
```

---

### **Deployment Notifications**

**Add Slack/Discord notifications:**

```yaml
- name: Notify on Success
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"? Deployment successful!"}' \
      ${{ secrets.WEBHOOK_URL }}

- name: Notify on Failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"? Deployment failed!"}' \
      ${{ secrets.WEBHOOK_URL }}
```

---

### **Rollback Strategy**

**If deployment breaks production:**

```powershell
# Revert last commit
git revert HEAD
git push

# GitHub Actions will auto-deploy the revert
```

**Or manually:**
```bash
# SSH into server
ssh your-username@realfeygon.com

# Restore from backup
cd /home/realfey
cp -r eve2-backup/* eve2/

# Restart app
touch eve2/tmp/restart.txt
```

---

## ? Verification Checklist

**After setup:**

- [ ] SSH key generated
- [ ] Public key added to server
- [ ] SSH connection tested
- [ ] GitHub Secrets configured
- [ ] Workflow file created
- [ ] `.gitignore` updated
- [ ] Manual workflow trigger works
- [ ] Push to main triggers deployment
- [ ] Production site updates
- [ ] App restarts automatically
- [ ] Environment variables set in DirectAdmin

---

## ?? Success!

**You now have:**
- ? Automated deployments
- ? GitHub Actions CI/CD
- ? One command deployment (`git push`)
- ? Deployment history
- ? Automatic app restarts

---

## ?? Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [DirectAdmin Node.js Guide](https://help.directadmin.com/)
- [SSH Key Authentication](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Created:** December 2025  
**Maintained By:** Feygon Nickerson  
**Status:** READY TO IMPLEMENT

---

## ?? Quick Start Commands

**Generate SSH key:**
```powershell
ssh-keygen -t ed25519 -C "github-actions@realfeygon.com" -f github-deploy-key
```

**Test connection:**
```powershell
ssh -i github-deploy-key your-username@realfeygon.com "echo 'Success!'"
```

**Trigger deployment:**
```powershell
git push origin main
```

**Check status:**
```
https://github.com/feygon/EVE2-Project/actions
```

---

**Ready to set up CI/CD!** ??

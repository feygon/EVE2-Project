# ? CI/CD Setup - Ready to Implement!

## ?? What Was Created

**Complete CI/CD pipeline from GitHub to DirectAdmin:**

1. ? GitHub Actions workflow (`.github/workflows/deploy.yml`)
2. ? Comprehensive setup guide (`docs/deployment/CI_CD_SETUP.md`)
3. ? Updated documentation portal

---

## ?? Quick Setup (15 minutes)

### **Step 1: Generate SSH Key**

```powershell
ssh-keygen -t ed25519 -C "github-actions@realfeygon.com" -f github-deploy-key
```

Creates:
- `github-deploy-key` (private - for GitHub)
- `github-deploy-key.pub` (public - for server)

---

### **Step 2: Add Public Key to Server**

**Copy the public key:**
```powershell
Get-Content github-deploy-key.pub
```

**Add to DirectAdmin:**
1. Log into DirectAdmin
2. Account Manager ? SSH Keys
3. Add New Key
4. Paste public key content
5. Save

---

### **Step 3: Test SSH Connection**

```powershell
ssh -i github-deploy-key realfey@realfeygon.com "pwd"
```

Should show: `/home/realfey`

---

### **Step 4: Add GitHub Secrets**

**Go to:** https://github.com/feygon/EVE2-Project/settings/secrets/actions

**Click "New repository secret" for each:**

| Secret Name | Value |
|-------------|-------|
| `SSH_PRIVATE_KEY` | Contents of `github-deploy-key` file |
| `SSH_HOST` | `realfeygon.com` |
| `SSH_USERNAME` | `realfey` |
| `SSH_PORT` | `22` |
| `DEPLOY_PATH` | `/home/realfey/eve2` |

**To get private key contents:**
```powershell
Get-Content github-deploy-key | clip
```
Then paste into GitHub Secret.

---

### **Step 5: Commit Workflow File**

```powershell
git add .github/workflows/deploy.yml
git add docs/deployment/CI_CD_SETUP.md
git add docs/index.html
git commit -m "Add CI/CD pipeline with GitHub Actions"
git push
```

**This will trigger the first deployment!**

---

### **Step 6: Monitor Deployment**

**Watch it deploy:**
https://github.com/feygon/EVE2-Project/actions

**Steps you'll see:**
1. ? Checkout code
2. ? Setup Node.js
3. ? Install dependencies
4. ? Run tests
5. ? Setup SSH
6. ? Deploy files (rsync)
7. ? Install production dependencies
8. ? Restart application
9. ? Verify deployment

---

### **Step 7: Verify Production**

**Test these URLs:**
- https://realfeygon.com/
- https://realfeygon.com/index.html
- https://realfeygon.com/documentation
- https://realfeygon.com/illusion

**All should work!**

---

## ?? From Now On

**Every time you push to main:**
```powershell
git add .
git commit -m "Your changes"
git push
```

**GitHub Actions will:**
1. Run tests
2. Deploy to DirectAdmin
3. Install dependencies
4. Restart your app

**No more manual SFTP uploads!** ??

---

## ?? Workflow Features

**Automatic:**
- ? Deploys on every push to `main`
- ? Excludes unnecessary files (node_modules, .git, etc.)
- ? Installs production dependencies
- ? Restarts Node.js app
- ? Cleans up SSH keys after deployment

**Manual:**
- ? Can trigger manually from GitHub UI
- ? Actions tab ? "Deploy to DirectAdmin" ? "Run workflow"

---

## ?? Important Notes

### **Security:**

**Never commit these files:**
- `github-deploy-key` (private key)
- `github-deploy-key.pub` (public key)
- `.env` files

**They're already in `.gitignore`!**

---

### **Environment Variables:**

**Set in DirectAdmin, NOT in GitHub!**

Your `.env` variables should be configured in:
DirectAdmin ? Node.js Selector ? Environment Variables

---

### **First Deployment:**

The first push after setup will:
- Upload all files
- Install dependencies
- May take 2-3 minutes

**Subsequent deployments are faster (rsync only uploads changes).**

---

## ?? Troubleshooting

### **If deployment fails:**

**1. Check GitHub Actions logs:**
https://github.com/feygon/EVE2-Project/actions

**2. Common issues:**
- SSH key not added correctly
- Wrong GitHub Secrets values
- Server permissions issue

**3. Test SSH locally:**
```powershell
ssh -i github-deploy-key realfey@realfeygon.com "ls -la /home/realfey/eve2"
```

---

### **If site doesn't update:**

**1. Check DirectAdmin:**
- Node.js Selector ? Check app is running
- Restart manually if needed

**2. Check environment variables:**
- DirectAdmin ? Node.js ? Environment Variables
- Should have all DB_* and SESSION_SECRET

**3. Check logs:**
```powershell
ssh realfey@realfeygon.com "tail -f /home/realfey/eve2/logs/error.log"
```

---

## ?? Documentation

**Full guide:**
See `docs/deployment/CI_CD_SETUP.md`

**Quick reference:**
See `docs/deployment/DEPLOYMENT_GUIDE.md`

---

## ? Checklist

**Before first deployment:**

- [ ] SSH key generated
- [ ] Public key added to DirectAdmin
- [ ] SSH connection tested
- [ ] 5 GitHub Secrets added
- [ ] Workflow file committed
- [ ] Environment variables set in DirectAdmin
- [ ] `.gitignore` includes SSH keys

**After setup:**

- [ ] First deployment successful
- [ ] Production site loads
- [ ] All routes work
- [ ] Documentation accessible
- [ ] No errors in GitHub Actions logs

---

## ?? Next Steps

**1. Test it now:**
```powershell
# Make a small change
echo "# CI/CD Active" >> README.md

# Commit and push
git add README.md
git commit -m "Test CI/CD deployment"
git push

# Watch: https://github.com/feygon/EVE2-Project/actions
```

**2. Set up notifications (optional):**
- Add Slack/Discord webhooks
- Email notifications
- See CI_CD_SETUP.md for details

**3. Create staging environment (optional):**
- Deploy `develop` branch to staging
- Test before merging to `main`

---

## ?? Success!

**You now have:**
- ? Automated deployments
- ? One-command deploy (`git push`)
- ? Deployment history
- ? No manual SFTP needed
- ? Professional CI/CD pipeline

---

**Ready to push and test!** ??

**Created:** December 2025  
**Status:** READY TO IMPLEMENT

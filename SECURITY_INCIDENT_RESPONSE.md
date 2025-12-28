# 🚨 URGENT: Security Incident Response Plan

**Status:** CRITICAL - Production credentials exposed in documentation  
**Date Discovered:** December 2025  
**Severity:** HIGH

---

## 📋 Executive Summary

**Real production passwords were found in 4 documentation files.** While these files have been cleaned, if they were committed to Git, the credentials are in the repository history and MUST be rotated immediately.

---

## ⚠️ IMMEDIATE ACTIONS (Do These NOW)

### Step 1: Check Git History (2 minutes)

```powershell
# Check if sensitive files were committed
git log --oneline --all -- "docs/archive/env-migration.md"
git log --oneline --all -- "docs/deployment/DEPLOYMENT_GUIDE.md"
```

**Result:**
- ✅ **No commits found:** Passwords never reached Git → Skip to Step 4
- ❌ **Commits found:** Passwords are in history → Continue to Step 2

---

### Step 2: Rotate ALL Credentials (15 minutes)

**THIS IS MANDATORY if passwords were committed to Git!**

#### A. Generate New Passwords

```powershell
# Generate strong random password
$password = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | % {[char]$_})
Write-Host "New DB Password: $password"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Write these down securely!**

#### B. Update Production Database

```bash
# SSH into production server
ssh -i ".vscode\rsa-key-20251219OpenSSH.ppk" -p 27493 realfey@server06.hostwhitelabel.com

# Connect to MySQL
mysql -u root -p

# Change passwords
ALTER USER 'realfey_realfey_realfeyuser'@'localhost' IDENTIFIED BY 'NEW_PASSWORD_HERE';
ALTER USER 'realfey_illusion_spells_DB'@'localhost' IDENTIFIED BY 'NEW_PASSWORD_HERE';
FLUSH PRIVILEGES;
EXIT;
```

#### C. Update DirectAdmin Environment Variables

1. Log into DirectAdmin: https://realfeygon.com:2222
2. Go to: **Node.js Setup** or **Environment Variables**
3. Update these variables:
   ```
   DB_PASSWORD=<NEW_PASSWORD>
   DB_ILLUSION_PASSWORD=<NEW_PASSWORD>
   SESSION_SECRET=<NEW_SECRET>
   ```
4. **Save** changes

#### D. Update Local .env File

```powershell
# Edit your local .env
notepad .env
```

Update with new passwords, then save.

#### E. Restart Production Application

In DirectAdmin:
- Find your Node.js application
- Click **"Restart"**

Or via SSH:
```bash
pm2 restart realfeygon
```

#### F. Test Production Site

Visit these URLs to confirm everything works:
- https://realfeygon.com/resume
- https://realfeygon.com/eve2
- https://realfeygon.com/illusion

---

### Step 3: Clean Git History (30 minutes)

**ONLY if passwords were committed to Git!**

#### Option A: BFG Repo-Cleaner (Recommended)

```powershell
# 1. Download BFG
# Visit: https://rtyley.github.io/bfg-repo-cleaner/
# Download bfg-1.14.0.jar

# 2. Create password list file
@"
SuperSecretPasswordCabaret1!
5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r
"@ | Out-File -Encoding ASCII passwords.txt

# 3. Make fresh clone
cd ..
git clone --mirror https://github.com/feygon/EVE2-Project.git eve2-cleanup
cd eve2-cleanup

# 4. Run BFG
java -jar ../bfg-1.14.0.jar --replace-text ../passwords.txt

# 5. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Push (WARNING: This rewrites history!)
git push --force
```

#### Option B: Git Filter-Branch (Manual)

```powershell
# Remove specific files from all history
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch docs/archive/env-migration.md docs/deployment/DEPLOYMENT_GUIDE.md" `
  --prune-empty --tag-name-filter cat -- --all

# Push
git push origin --force --all
git push origin --force --tags
```

⚠️ **WARNING:** This rewrites Git history. Coordinate with any team members!

---

### Step 4: Verify All Fixed (5 minutes)

```powershell
# Scan for any remaining passwords
Get-ChildItem -Path . -Recurse -Filter "*.md" | 
  Where-Object { $_.FullName -notlike "*\node_modules\*" } | 
  Select-String -Pattern "SuperSecretPasswordCabaret|5up3r53cr3t" -CaseSensitive

# Should only find references in SECURITY_AUDIT.md and cleanup instructions
```

---

### Step 5: Document Changes (5 minutes)

Create a file: `CREDENTIAL_ROTATION_LOG.md`

```markdown
# Credential Rotation Log

**Date:** [TODAY'S DATE]
**Reason:** Production credentials exposed in documentation files

## Actions Taken:
- [ ] Checked Git history
- [ ] Rotated database passwords
- [ ] Generated new session secret
- [ ] Updated DirectAdmin environment variables
- [ ] Updated local .env file
- [ ] Restarted production application
- [ ] Tested production site
- [ ] Cleaned Git history (if needed)
- [ ] Verified all documentation files

## New Credentials:
- DB Password: Stored in password manager
- Session Secret: Stored in password manager
- Date Changed: [DATE]
- Next Rotation: [DATE + 90 days]

## Verification:
- [ ] Production site works
- [ ] No authentication errors
- [ ] Git history clean
- [ ] Documentation uses placeholders only
```

---

## 📊 Exposure Assessment

### What Was Exposed:
- **Database Password:** `SuperSecretPasswordCabaret1!`
- **Session Secret:** `5up3r53cr3tPa55wordR3allyIt5Lik3Th3B35tPa55word3v3r`
- **User:** `realfey_realfey_realfeyuser`
- **Database:** `realfey_realfey_eve2_project`

### Where It Was Exposed:
1. `docs/archive/env-migration.md` (lines 30, 37)
2. `docs/archive/security-audit.md` (lines 50, 51, 98, 172, 177)
3. `docs/deployment/DEPLOYMENT_GUIDE.md` (lines 30, 37)
4. `docs/deployment/PRE_DEPLOYMENT_CHECKLIST.md` (lines 141, 146)

### Timeline:
- **Created:** Unknown (files in archive suggest recent)
- **Discovered:** December 2024
- **Fixed:** December 2024
- **Duration Exposed:** Unknown (check Git history)

### Impact:
- **If in Git history:** Publicly visible on GitHub
- **If NOT in Git:** Only local exposure
- **Database Access:** Potentially compromised
- **Session Security:** Potentially compromised

---

## 🔒 Post-Incident Improvements

### Immediate (This Week):
- [ ] Rotate all credentials
- [ ] Enable GitHub secret scanning
- [ ] Review all documentation for secrets
- [ ] Set up automated secret scanning in CI/CD

### Short-Term (This Month):
- [ ] Implement credential rotation schedule (quarterly)
- [ ] Use a password manager (1Password, Bitwarden)
- [ ] Set up alerts for exposed secrets
- [ ] Create incident response playbook

### Long-Term (Next 3 Months):
- [ ] Implement secrets management tool (Vault, AWS Secrets Manager)
- [ ] Automate credential rotation
- [ ] Set up monitoring for unauthorized access
- [ ] Regular security audits

---

## 📚 Related Documentation

- `SECURITY_AUDIT.md` - Detailed security scan results
- `.gitignore` - Files excluded from Git
- `docs/setup/EMERGENCY_RECOVERY.md` - Backup procedures
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Deployment process

---

## ✅ Completion Checklist

### Critical Actions:
- [ ] Checked Git history
- [ ] Rotated database passwords
- [ ] Generated new session secret
- [ ] Updated DirectAdmin
- [ ] Updated local .env
- [ ] Restarted production app
- [ ] Tested production site

### Cleanup Actions:
- [ ] Cleaned Git history (if needed)
- [ ] Verified no passwords in docs
- [ ] Updated security audit
- [ ] Created rotation log

### Prevention Actions:
- [ ] Enabled GitHub secret scanning
- [ ] Set up automated scanning
- [ ] Documented procedures
- [ ] Scheduled next rotation

---

## 🆘 Help & Support

### If Something Goes Wrong:

**Can't connect to database:**
```bash
# Check environment variables
printenv | grep DB_

# Verify password in DirectAdmin matches database
```

**Production site down:**
```bash
# Check Node.js logs
pm2 logs realfeygon

# Restart app
pm2 restart realfeygon
```

**Git push fails:**
```powershell
# Force push (after backing up)
git push origin main --force
```

### Emergency Contacts:
- Hosting Support: GeniusMojo/DirectAdmin
- GitHub Support: https://support.github.com

---

## 📈 Success Criteria

This incident is resolved when:
- ✅ All credentials rotated
- ✅ Production site works with new credentials
- ✅ No passwords in documentation
- ✅ Git history clean (if applicable)
- ✅ Automated scanning enabled
- ✅ Incident documented

---

**Priority:** 🔴 CRITICAL  
**Assigned To:** Site Owner  
**Due Date:** Within 24 hours of discovery  
**Status:** In Progress

---

## 🔄 Regular Maintenance Schedule

**Monthly:**
- Review documentation for secrets
- Check .gitignore is working
- Verify no secrets in Git

**Quarterly:**
- Rotate all credentials
- Full security audit
- Test backup/recovery procedures

**Annually:**
- Major security review
- Update incident response plan
- Review and update all documentation

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Next Review:** After credential rotation complete

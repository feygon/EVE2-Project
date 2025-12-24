# ?? Quick Git Commands Reference

## Initial Setup (One Time)
```powershell
# Initialize git (if not already done)
git init

# Add GitHub remote
git remote add origin https://github.com/feygon/EVE2-Project.git

# Check remote
git remote -v
```

## Before First Push - Security Check
```powershell
# Review .gitignore
cat .gitignore

# Check what will be committed
git status

# Make sure these are NOT being committed:
# ? dbcon.local.js
# ? dbcon_illusion.local.js
# ? node_modules/
# ? .env files
```

## Daily Workflow
```powershell
# 1. Check status
git status

# 2. Add changes
git add .
# Or add specific files:
git add main.js package.json README.md

# 3. Commit with message
git commit -m "Your descriptive message here"

# 4. Push to GitHub
git push

# 5. Deploy to production (SFTP to GeniusMojo)
# Use your existing SFTP method
```

## Common Commands
```powershell
# See what changed
git diff

# See commit history
git log --oneline

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename.js

# Pull latest from GitHub
git pull origin main

# Create a branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## First Push to GitHub
```powershell
# Review what will be pushed
git status

# Add all files
git add .

# Commit
git commit -m "Sync local development environment

- Add local dev setup scripts
- Add database management tools
- Add comprehensive documentation
- Update .gitignore"

# Push (force because GitHub is behind)
git branch -M main
git push -u origin main --force
```

## Useful Aliases (Optional)
```powershell
# Add these to your PowerShell profile
function gs { git status }
function ga { git add . }
function gc { param($msg) git commit -m $msg }
function gp { git push }
function gl { git log --oneline -10 }
```

## Troubleshooting
```powershell
# If you get "remote already exists"
git remote remove origin
git remote add origin https://github.com/feygon/EVE2-Project.git

# If you need to change remote URL
git remote set-url origin https://github.com/feygon/EVE2-Project.git

# If push is rejected
git pull --rebase origin main
git push

# If you accidentally committed secrets
# See GITHUB_SYNC_GUIDE.md for how to remove them
```

---

**Quick Reference:**
- `git status` - What's changed?
- `git add .` - Stage all changes
- `git commit -m "msg"` - Commit changes
- `git push` - Push to GitHub
- `git pull` - Get latest from GitHub

---

See **GITHUB_SYNC_GUIDE.md** for detailed security setup!

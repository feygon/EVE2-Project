# ?? Quick Reference Card

## One-Time Setup
```powershell
# Run this ONCE to set up everything
.\setup-local.ps1
```

**Note:** If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Database GUI Setup
```powershell
# Install phpMyAdmin or alternative database manager
.\install-phpmyadmin.ps1
```

**Recommended:** Choose option 3 (HeidiSQL) - simplest, no web server needed!

See [DATABASE_GUI_GUIDE.md](DATABASE_GUI_GUIDE.md) for all options.

## Daily Development
```powershell
# Start the server (use this every time)
.\start-local.ps1 3000
```

Then open: **http://localhost:3000/resume**

## Database Backups
```powershell
# Backup databases
.\db-tools.ps1 backup

# Restore from backup
.\db-tools.ps1 restore
```

## Useful Checks
```powershell
# Is MariaDB running?
Get-Service MariaDB

# Start MariaDB
Start-Service MariaDB

# Connect to database
mysql -u root -p

# Show databases
mysql -u root -p -e "SHOW DATABASES;"
```

## Manual Database Import (if needed)
```powershell
# PowerShell syntax (use this in PowerShell)
Get-Content "EVE2 DDQ.sql" | mysql -u realfey_realfey_realfeyuser -pLocalDevPassword123! realfey_realfey_eve2_project
Get-Content "illusions DDQ.sql" | mysql -u realfey_illusion_spells_DB -pLocalDevPassword123! realfey_illusion_spells_DB
```

```cmd
# Command Prompt syntax (use this in CMD)
mysql -u realfey_realfey_realfeyuser -p realfey_realfey_eve2_project < "EVE2 DDQ.sql"
mysql -u realfey_illusion_spells_DB -p realfey_illusion_spells_DB < "illusions DDQ.sql"
```

## File Structure
```
Production files (KEEP for deployment):
??? dbcon.js                    ? Production DB config
??? dbcon_illusion.js          ? Production DB config
??? main.js                    ? Main server file

Local files (gitignored):
??? dbcon.local.js             ? Local DB config
??? dbcon_illusion.local.js    ? Local DB config
??? node_modules/              ? Dependencies

Helper files:
??? setup-local.ps1            ? One-time setup
??? start-local.ps1            ? Start server
??? db-tools.ps1               ? Backup/restore
??? install-phpmyadmin.ps1     ? Install database GUI
??? README.md                  ? Main docs
??? LOCAL_SETUP.md             ? Detailed guide
??? DATABASE_GUI_GUIDE.md      ? Database tool comparison
??? SETUP_SUMMARY.md           ? Setup overview
```

## URLs
- **Local Dev:** http://localhost:3000/
- **Resume:** http://localhost:3000/resume
- **EVE2:** http://localhost:3000/eve2
- **Illusion:** http://localhost:3000/illusion

## Credentials (Local)
```
EVE2 Database:
  User: realfey_realfey_realfeyuser
  Pass: LocalDevPassword123!
  DB:   realfey_realfey_eve2_project

Illusion Database:
  User: realfey_illusion_spells_DB
  Pass: LocalDevPassword123!
  DB:   realfey_illusion_spells_DB

MariaDB Root:
  User: root
  Pass: (blank - no password)
```

## Common Issues

| Problem | Solution |
|---------|----------|
| MariaDB not found | Run `.\setup-local.ps1` |
| Can't connect to DB | Check MariaDB is running |
| Port 80 in use | Use port 3000 instead |
| Module not found | Run `npm install` |
| Script won't run | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `<` operator error | Use `Get-Content` piping in PowerShell |
| Need database GUI | Run `.\install-phpmyadmin.ps1` |

## Remember
- ? Always test locally before deploying
- ? Local configs are gitignored
- ? Production configs stay in place
- ? Use different passwords for local vs prod
- ? PowerShell and CMD have different syntax for redirects
- ? HeidiSQL is the easiest database GUI option

---
**Happy Coding!** ??

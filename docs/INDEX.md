# ?? Documentation Index

## ?? Quick Start

**New to this project?** Start here:
1. [README.md](../README.md) - Project overview
2. [QUICK_START.md](../QUICK_START.md) - Daily reference card

---

## ?? Documentation Structure

### ?? Setup & Installation
**Path:** `docs/setup/`

| Document | Description | When to Use |
|----------|-------------|-------------|
| [LOCAL_SETUP.md](setup/LOCAL_SETUP.md) | Detailed local development setup | First-time setup |
| [DIRECTADMIN_ENV_SETUP.md](setup/DIRECTADMIN_ENV_SETUP.md) | Environment variables for production | Before deploying |
| [DATABASE_GUI.md](setup/DATABASE_GUI.md) | Database tool comparison & setup | Need database access |
| [EMERGENCY_RECOVERY.md](setup/EMERGENCY_RECOVERY.md) | Rebuild from scratch guide | Disaster recovery |

### ?? Deployment
**Path:** `docs/deployment/`

| Document | Description | When to Use |
|----------|-------------|-------------|
| [DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) | Production deployment via SFTP | Deploying to server |
| [PRE_DEPLOYMENT_CHECKLIST.md](deployment/PRE_DEPLOYMENT_CHECKLIST.md) | Verification before deploy | Before every deploy |

### ?? Git Workflow
**Path:** `docs/git/`

| Document | Description | When to Use |
|----------|-------------|-------------|
| [GITHUB_SYNC_GUIDE.md](git/GITHUB_SYNC_GUIDE.md) | Complete Git workflow | Learning Git process |
| [GITHUB_PREP.md](git/GITHUB_PREP.md) | Preparing for GitHub commit | Before committing |
| [GIT_COMMANDS.md](git/GIT_COMMANDS.md) | Quick Git command reference | Daily Git use |

### ?? Development
**Path:** `docs/development/`

| Document | Description | When to Use |
|----------|-------------|-------------|
| [TROUBLESHOOTING.md](development/TROUBLESHOOTING.md) | Common issues & solutions | When things break |

### ?? Archive (Historical)
**Path:** `docs/archive/`

*One-time documentation preserved for reference*

| Document | Description | Date |
|----------|-------------|------|
| [handlebars-debugging.md](archive/handlebars-debugging.md) | Handlebars context analysis | Dec 2025 |
| [partials-structure.md](archive/partials-structure.md) | Partials architecture notes | Dec 2025 |
| [env-migration.md](archive/env-migration.md) | Environment variable migration | Dec 2025 |
| [security-audit.md](archive/security-audit.md) | Security verification log | Dec 2025 |

---

## ?? Common Tasks

### Daily Development
```
1. Start server: see QUICK_START.md
2. Make changes
3. Commit: see docs/git/GIT_COMMANDS.md
4. Push to GitHub
```

### Deploying to Production
```
1. Review: docs/deployment/PRE_DEPLOYMENT_CHECKLIST.md
2. Follow: docs/deployment/DEPLOYMENT_GUIDE.md
3. Test production site
```

### Setting Up New Environment
```
1. Follow: docs/setup/LOCAL_SETUP.md
2. Configure: docs/setup/DIRECTADMIN_ENV_SETUP.md
3. Install tools: docs/setup/DATABASE_GUI.md
```

### Troubleshooting
```
1. Check: docs/development/TROUBLESHOOTING.md
2. Review logs in DirectAdmin
3. Check environment variables
```

---

## ?? Documentation Stats

- **Total Files:** 12 active + 4 archived
- **Total Size:** ~110 KB
- **Last Updated:** December 2025
- **Structure:** Organized by purpose

---

## ?? Finding Documentation

**Can't find something?**

1. Check [QUICK_START.md](../QUICK_START.md) first
2. Search by task in this index
3. Browse folders by category
4. Check archive for historical docs

---

## ?? Contributing to Documentation

When adding new documentation:

1. **Determine category:** setup / deployment / git / development
2. **Check for duplicates:** Avoid redundancy
3. **Use consistent format:** Follow existing patterns
4. **Update this index:** Add entry to relevant section
5. **Keep it current:** Remove outdated information

---

## ?? Documentation Standards

- **Markdown format** (.md files)
- **Clear headings** (H1 for title, H2 for sections)
- **Code blocks** with language specified
- **Emoji markers** for quick scanning (? ? ??)
- **Commands ready to copy/paste**
- **Screenshots** when helpful (in docs/images/)

---

**Last Updated:** December 2025  
**Maintained By:** Feygon Nickerson

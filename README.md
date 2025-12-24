# RealFeygon.com - Full-Stack Web Application

A Node.js Express application with MariaDB backend, featuring multiple SPAs and automated CI/CD deployment.

**Live Site:** https://realfeygon.com

---

## ?? Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Databases](#databases)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation](#documentation)

---

## ? Quick Start

### **Local Development (First Time):**

```powershell
# Automated setup
.\setup-local.ps1

# Start development server
.\start-local.ps1 3000
```

**Visit:** http://localhost:3000

---

### **Manual Setup:**

See [docs/setup/LOCAL_SETUP.md](docs/setup/LOCAL_SETUP.md) for detailed instructions.

---

## ?? Project Structure

```
RealFeygon/
??? main.js                      # Express server entry point
??? package.json                 # Dependencies and scripts
?
??? .github/
?   ??? workflows/
?   ?   ??? deploy.yml          # CI/CD automation
?   ??? instructions/
?       ??? neuro-accessibility.md  # Accessibility guidelines
?
??? config/
?   ??? dbcon.js                # Production DB config (EVE2)
?   ??? dbcon_illusion.js       # Production DB config (Illusion)
?   ??? dbcon.local.js          # Local DB config (gitignored)
?   ??? dbcon_illusion.local.js # Local DB config (gitignored)
?
??? routes/
?   ??? resume.js               # Resume/portfolio module
?   ??? eve2.js                 # EVE Online inventory system
?   ??? illusion.js             # Pathfinder 2E spells
?
??? scripts/
?   ??? callbacks.js            # Database callback functions
?   ??? illusionCallbacks.js    # Illusion-specific callbacks
?   ??? queries.js              # SQL query definitions
?   ??? illusionQueries.js      # Illusion SQL queries
?   ??? monoCBs.js              # Monolithic callback handlers
?   ??? monoQueries.js          # Complex queries
?   ??? sql/
?       ??? EVE2 DDQ.sql        # EVE2 database schema
?       ??? illusions DDQ.sql   # Illusion database schema
?
??? views/
?   ??? layouts/                # Handlebars layouts
?   ??? partials/               # Reusable view components
?   ??? helpers/                # Template helper functions
?
??? public/
?   ??? static/                 # CSS, JS, images
?   ??? site-index.html         # Site navigation page
?
??? docs/                       # Complete documentation
    ??? index.html              # Documentation portal
    ??? setup/                  # Installation guides
    ??? deployment/             # Deployment guides
    ??? git/                    # Git workflow
    ??? development/            # Troubleshooting
```

---

## ?? Application Routes

| Route | Description | Module |
|-------|-------------|--------|
| `/` | Redirects to `/resume` | main.js |
| `/resume` | Professional resume/portfolio | resume.js |
| `/eve2` | EVE Online-inspired inventory system | eve2.js |
| `/illusion` | Pathfinder 2E illusion spells database | illusion.js |
| `/documentation` | Technical documentation portal | main.js |
| `/index.html` | Site navigation/index | main.js |

---

## ??? Databases

### **EVE2 Database (`realfey_realfey_eve2_project`)**

Complex game mechanics system featuring:
- Players, Ships, Cargo Spaces
- Items, Objects, Locations
- Nested container system
- Stored procedures for game logic

**Schema:** `scripts/sql/EVE2 DDQ.sql`

---

### **Illusion Spells Database (`realfey_illusion_spells_DB`)**

Pathfinder 2E Remaster spell catalog:
- 200+ illusion spells
- Categories and relationships
- Rich metadata (traits, actions, effects)
- Optimized views for querying

**Schema:** `scripts/sql/illusions DDQ.sql`

---

## ?? Configuration

### **Environment Variables:**

Create `.env` file for local development:

```env
# Database - EVE2
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=realfey_realfey_eve2_project

# Database - Illusion
DB_ILLUSION_HOST=localhost
DB_ILLUSION_USER=your_username
DB_ILLUSION_PASSWORD=your_password
DB_ILLUSION_NAME=realfey_illusion_spells_DB

# Session
SESSION_SECRET=your_secret_here
NODE_ENV=development
PORT=3000
```

**Production:** Set environment variables in DirectAdmin Node.js Selector.

---

### **Local vs Production:**

| Environment | Config Files | Port | Database |
|-------------|-------------|------|----------|
| **Local** | `*.local.js` (gitignored) | 3000 | localhost |
| **Production** | `dbcon.js`, `dbcon_illusion.js` | 80/443 | Remote MariaDB |

---

## ?? Development Workflow

### **1. Make Changes Locally:**

```powershell
# Start server
.\start-local.ps1 3000

# Make changes
# Test at http://localhost:3000
```

---

### **2. Commit to Git:**

```powershell
git add .
git commit -m "Your message"
git push origin main
```

---

### **3. Automatic Deployment:**

GitHub Actions automatically:
- ? Runs tests
- ? Deploys to DirectAdmin
- ? Installs dependencies
- ? Restarts Node.js app

**No manual SFTP needed!**

---

## ?? CI/CD Pipeline

### **Automated Deployment:**

Every push to `main` branch triggers:

1. **Build & Test** - npm install and test
2. **Deploy via rsync** - Upload changed files only
3. **Install Dependencies** - Production npm ci
4. **Restart App** - Touch restart file

**Monitoring:** https://github.com/feygon/EVE2-Project/actions

---

### **Manual Deployment:**

Trigger from GitHub UI:
1. Go to Actions tab
2. Select "Deploy to DirectAdmin"
3. Click "Run workflow"

---

### **Setup CI/CD:**

See [docs/deployment/CI_CD_SETUP.md](docs/deployment/CI_CD_SETUP.md) for complete setup guide.

**Quick setup:** 15 minutes

---

## ?? Documentation

### **Complete Docs Portal:**

**Local:** `docs/index.html`  
**Production:** https://realfeygon.com/documentation

**Features:**
- ?? Live search (Ctrl+K)
- ? Dyslexia-friendly design
- ?? Mobile responsive
- ?? Keyboard accessible

---

### **Key Documents:**

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | Daily reference |
| [docs/setup/LOCAL_SETUP.md](docs/setup/LOCAL_SETUP.md) | Complete setup guide |
| [docs/deployment/DEPLOYMENT_GUIDE.md](docs/deployment/DEPLOYMENT_GUIDE.md) | Production deployment |
| [docs/deployment/CI_CD_SETUP.md](docs/deployment/CI_CD_SETUP.md) | Automated deployment |
| [docs/development/TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md) | Common issues |

---

## ??? Available Scripts

### **PowerShell:**
```powershell
.\setup-local.ps1           # Complete environment setup
.\start-local.ps1 [port]    # Start development server
```

### **NPM:**
```powershell
npm install                 # Install dependencies
npm start                   # Start server (port 80)
npm test                    # Run tests
```

### **Database:**
```powershell
# Import schemas
mysql -u username -p dbname < "scripts\sql\EVE2 DDQ.sql"
mysql -u username -p dbname < "scripts\sql\illusions DDQ.sql"
```

---

## ?? Security

### **Protected Files (.gitignore):**
- `.env` - Environment variables
- `*.local.js` - Local database configs
- `github-deploy-key*` - SSH keys
- `.vs/` - IDE files

### **Best Practices:**
- ? Environment variables for secrets
- ? SSH key authentication
- ? No hardcoded credentials
- ? Session secrets from environment

---

## ?? Tech Stack

**Backend:**
- Node.js + Express.js
- MariaDB/MySQL
- express-session

**Frontend:**
- Handlebars templating
- Vanilla JavaScript
- Responsive CSS

**DevOps:**
- GitHub Actions CI/CD
- DirectAdmin hosting
- SFTP deployment

---

## ?? Testing

```powershell
# Run tests
npm test

# Local testing
.\start-local.ps1 3000
# Visit: http://localhost:3000
```

---

## ?? Troubleshooting

### **Common Issues:**

**"Cannot connect to database"**
```powershell
# Check MariaDB service
Get-Service MariaDB

# Verify credentials in .env
```

**"Port already in use"**
```powershell
# Use different port
.\start-local.ps1 3000
```

**"Module not found"**
```powershell
# Install dependencies
npm install
```

**More help:** [docs/development/TROUBLESHOOTING.md](docs/development/TROUBLESHOOTING.md)

---

## ?? Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MariaDB Documentation](https://mariadb.com/kb/)
- [Handlebars Documentation](https://handlebarsjs.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## ? Accessibility

This project follows neuro-accessibility guidelines for dyslexia and ADHD:

- Short paragraphs (2-3 lines max)
- Visual markers (emojis)
- Clear structure (TOC, TL;DR)
- Dyslexia-friendly fonts
- High contrast design

**Guidelines:** [.github/instructions/neuro-accessibility.md](.github/instructions/neuro-accessibility.md)

---

## ?? Author

**Feygon Nickerson**

- GitHub: [@feygon](https://github.com/feygon)
- Website: https://realfeygon.com

---

## ?? License

MIT License - See LICENSE file for details

---

## ?? Quick Links

- **Live Site:** https://realfeygon.com
- **Documentation:** https://realfeygon.com/documentation
- **Site Index:** https://realfeygon.com/index.html
- **GitHub Repo:** https://github.com/feygon/EVE2-Project
- **CI/CD Status:** https://github.com/feygon/EVE2-Project/actions

---

**Last Updated:** December 2025  
**Status:** Active Development

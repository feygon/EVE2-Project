# RealFeygon.com - Local Development Setup

This repository contains a Node.js Express application with a MariaDB backend, currently hosted on GeniusMojo via DirectAdmin.

## ?? Quick Start (Local Development)

### First Time Setup

1. **Run the automated setup script:**
   ```powershell
   .\setup-local.ps1
   ```
   This will:
   - Check for Node.js and npm
   - Help install MariaDB if needed
   - Install npm dependencies
   - Set up local databases
   - Create local configuration files
   - Create .gitignore for safety

2. **Start the development server:**
   ```powershell
   .\start-local.ps1 3000
   ```

3. **Open your browser to:**
   - http://localhost:3000/resume
   - http://localhost:3000/eve2
   - http://localhost:3000/illusion

### Manual Setup

If you prefer to set things up manually, see [LOCAL_SETUP.md](LOCAL_SETUP.md) for detailed instructions.

## ?? Project Structure

```
RealFeygon/
??? main.js                    # Main Express server
??? dbcon.js                   # Production database config (EVE2)
??? dbcon_illusion.js          # Production database config (Illusion Spells)
??? dbcon.local.js             # Local database config (EVE2) - gitignored
??? dbcon_illusion.local.js    # Local database config (Illusion) - gitignored
??? package.json               # Node dependencies
??? views/                     # Handlebars templates
?   ??? layouts/
?   ??? partials/
?   ??? helpers/
??? public/                    # Static assets
??? scripts/                   # Callback and query modules
??? resume.js                  # Resume module routes
??? eve2.js                    # EVE2 module routes
??? illusion.js                # Illusion spells module routes
??? EVE2 DDQ.sql              # EVE2 database schema
??? illusions DDQ.sql         # Illusion spells database schema
```

## ??? Databases

### EVE2 Database (`realfey_realfey_eve2_project`)
An EVE Online-inspired inventory/cargo system with:
- Players, Ships, Cargo Spaces
- Items, Objects, Locations
- Complex stored procedures for game mechanics

### Illusion Spells Database (`realfey_illusion_spells_DB`)
Pathfinder 2E illusion spell catalog with:
- Spells, Categories, Spell-Category relationships
- Rich metadata (traits, actions, effects, etc.)
- Views for easy querying

## ?? Configuration

### Production (GeniusMojo/DirectAdmin)
- Uses `dbcon.js` and `dbcon_illusion.js`
- Remote MariaDB connection
- Port 80/443

### Local Development
- Uses `dbcon.local.js` and `dbcon_illusion.local.js` (gitignored)
- localhost MariaDB connection
- Port 3000 (or configurable)

**?? IMPORTANT:** Never commit production database credentials to Git!

## ?? Dependencies

Main dependencies:
- `express` - Web framework
- `express-handlebars` - View engine
- `express-session` - Session management
- `body-parser` - Request body parsing
- `mysql` - MySQL/MariaDB client
- `forever` - Process manager

See `package.json` for full list.

## ??? Available Scripts

### PowerShell Scripts
- `setup-local.ps1` - Complete local environment setup
- `start-local.ps1 [port]` - Start the development server

### Manual Commands
```powershell
# Install dependencies
npm install

# Start server on port 80 (requires admin)
node main.js

# Start server on custom port
node main.js 3000

# Connect to local database
mysql -u root -p

# Import database schemas
mysql -u realfey_realfey_realfeyuser -p realfey_realfey_eve2_project < "EVE2 DDQ.sql"
mysql -u realfey_illusion_spells_DB -p realfey_illusion_spells_DB < "illusions DDQ.sql"
```

## ?? Application Routes

- `/` - Redirects to `/resume`
- `/resume/` - Resume/portfolio module
- `/eve2/` - EVE Online inventory system
- `/illusion/` - Pathfinder 2E illusion spells

## ?? Security Notes

- Production credentials are in `dbcon.js` and `dbcon_illusion.js`
- Local development credentials should be in `*.local.js` files (gitignored)
- Session secret is hardcoded - consider using environment variables
- Update passwords before deploying!

## ?? Development Workflow

1. Make changes locally
2. Test on `http://localhost:3000`
3. Commit changes (config files are gitignored)
4. Deploy to GeniusMojo production
5. Update production database if schema changed

## ?? Troubleshooting

### "Cannot connect to database"
- Check if MariaDB service is running: `Get-Service MariaDB`
- Verify credentials in config files
- Ensure databases exist: `SHOW DATABASES;`

### "Port 80 already in use"
- Use a different port: `node main.js 3000`
- Or find what's using port 80: `netstat -ano | findstr :80`

### "Module not found"
- Run `npm install` to install dependencies

### "Access denied for user"
- Check username/password in `dbcon.local.js`
- Verify user was created: `SELECT User FROM mysql.user;`

## ?? Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MariaDB Documentation](https://mariadb.com/kb/)
- [Handlebars Documentation](https://handlebarsjs.com/)

## ?? Author

Feygon Nickerson

## ?? License

MIT

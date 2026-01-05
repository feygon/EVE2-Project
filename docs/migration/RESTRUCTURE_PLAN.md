---
title: "Directory Restructure Plan for MERN Migration"
version: v2.2.0
created: 2025-01-07
status: planning
tags: [mern, migration, architecture, restructure]
---

# ?? Directory Restructure Plan

**Purpose:** Prepare codebase for side-by-side Handlebars and MERN comparison  
**Goal:** Keep both versions operational during migration

---

## ?? **TL;DR**

**What:** Split codebase into `legacy/` (Handlebars) and `mern/` (new React)  
**Why:** Compare implementations, gradual migration, rollback safety  
**When:** v2.2.0 (before starting React work)

---

## ?? **Phase 1: Create Directory Structure**

### **Step 1: Create New Directories**

```bash
# From D:\Repos\RealFeygon\
mkdir legacy
mkdir mern
mkdir mern\backend
mkdir mern\frontend
mkdir shared
mkdir shared\database
mkdir shared\sql
mkdir docs\migration
```

### **Step 2: Move Existing Files to legacy/**

**Root files to move:**
- `main.js` ? `legacy/main.js`
- `animals.js` ? `legacy/animals.js`
- `eve2.js` ? `legacy/eve2.js`
- `illusion.js` ? `legacy/illusion.js`
- `resume.js` ? `legacy/resume.js`
- `documentation.js` ? `legacy/documentation.js`

**Directories to move:**
- `views/` ? `legacy/views/`
- `scripts/` ? `legacy/scripts/` (callbacks, queries)
- `public/` ? `legacy/public/`

**Database configs to `shared/`:**
- `dbcon.js` ? `shared/database/dbcon.js`
- `dbcon_illusion.js` ? `shared/database/dbcon_illusion.js`
- `dbcon_animals.js` ? `shared/database/dbcon_animals.js`

**SQL files to `shared/`:**
- `scripts/sql/*` ? `shared/sql/`

---

## ?? **Phase 2: Update Import Paths**

### **In legacy/main.js:**

```javascript
// BEFORE:
var helpers = require('./views/helpers/helpers');
var mysql = require('./dbcon.js');
var callbacks = require('./scripts/callbacks.js');

// AFTER:
var helpers = require('./views/helpers/helpers');
var mysql = require('../shared/database/dbcon.js');
var callbacks = require('./scripts/callbacks.js');
```

### **In legacy/animals.js:**

```javascript
// BEFORE:
var callbacks = require('./scripts/animalsCallbacks.js');

// AFTER:
var callbacks = require('./scripts/animalsCallbacks.js');
// (No change - still relative to legacy/)
```

---

## ?? **Phase 3: Configure Ports**

### **Run Both Apps Simultaneously:**

**legacy/main.js:**
```javascript
app.set('port', process.argv[2] || 3000); // Port 3000 for legacy
```

**mern/backend/server.js:**
```javascript
app.listen(process.env.PORT || 3001); // Port 3001 for MERN API
```

**mern/frontend (React dev server):**
```json
// package.json
"scripts": {
  "start": "PORT=3002 react-scripts start"
}
```

**Access:**
- Legacy Handlebars: `http://localhost:3000/animals`
- MERN React: `http://localhost:3002/animals`
- MERN API: `http://localhost:3001/api/animals`

---

## ?? **Phase 4: Update package.json**

### **Root package.json (Monorepo scripts):**

```json
{
  "name": "realfeygon-monorepo",
  "version": "2.2.0",
  "private": true,
  "scripts": {
    "legacy": "cd legacy && node main.js 3000",
    "mern:backend": "cd mern/backend && npm start",
    "mern:frontend": "cd mern/frontend && npm start",
    "dev": "concurrently \"npm run legacy\" \"npm run mern:backend\" \"npm run mern:frontend\"",
    "test": "cd legacy && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### **legacy/package.json:**

```json
{
  "name": "realfeygon-legacy",
  "version": "2.2.0",
  "description": "Original Handlebars version",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js",
    "test": "mocha test/**/*.test.js"
  }
}
```

### **mern/backend/package.json:**

```json
{
  "name": "realfeygon-api",
  "version": "3.0.0",
  "description": "MERN backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql": "^2.18.1"
  }
}
```

### **mern/frontend/package.json:**

```json
{
  "name": "realfeygon-frontend",
  "version": "3.0.0",
  "description": "MERN React frontend",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

---

## ?? **Phase 5: Update .gitignore**

```gitignore
# Existing ignores...

# Legacy app
legacy/node_modules/
legacy/.env
legacy/sessions/

# MERN backend
mern/backend/node_modules/
mern/backend/.env
mern/backend/logs/

# MERN frontend
mern/frontend/node_modules/
mern/frontend/build/
mern/frontend/.env.local
```

---

## ?? **Phase 6: Database Strategy**

### **Option A: Shared Database (Recommended for now)**

Both versions use the same MySQL database:
- Legacy reads/writes via `shared/database/dbcon.js`
- MERN backend reads/writes via same connection

**Pros:**
- No data migration needed
- Real-time comparison
- Single source of truth

**Cons:**
- Must coordinate schema changes
- No testing MongoDB yet

### **Option B: Separate Databases**

Clone databases for isolation:
- `realfey_animals_legacy` (for Handlebars)
- `realfey_animals_mern` (for React)

**Pros:**
- Complete isolation
- Safe testing

**Cons:**
- Data sync required
- More complexity

**Recommendation:** Start with Option A, move to Option B if needed.

---

## ?? **Phase 7: Deployment Strategy**

### **Development:**
```
http://localhost:3000/animals  ? Legacy (Handlebars)
http://localhost:3002/animals  ? MERN (React)
```

### **Production (when ready):**
```
https://realfeygon.com/animals        ? Legacy (stable)
https://realfeygon.com/animals-mern   ? MERN (beta)
```

**Later (when MERN is stable):**
```
https://realfeygon.com/animals        ? MERN (new default)
https://realfeygon.com/animals-legacy ? Handlebars (archived)
```

---

## ? **Verification Checklist**

After restructure, verify:

- [ ] Legacy app starts: `npm run legacy`
- [ ] Can access: `http://localhost:3000/animals`
- [ ] All routes work (EVE2, illusions, resume)
- [ ] Database connections work
- [ ] Tests still pass: `npm test`
- [ ] No broken import paths
- [ ] Git history preserved

---

## ?? **Next Steps**

1. **v2.2.0:** Complete this restructure
2. **v2.3.0:** Create MERN backend API
3. **v3.0.0:** Create React frontend
4. **v3.1.0:** Feature parity with legacy
5. **v4.0.0:** Replace legacy as default

---

## ?? **References**

- `docs/learning/01_ARCHITECTURE.md` - Current architecture
- `docs/learning/02_ANIMALS_ROUTER.md` - Router analysis
- `CHANGELOG.md` - Version history

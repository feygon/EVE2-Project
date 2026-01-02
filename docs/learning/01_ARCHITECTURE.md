---
title: "MERN Migration Annotations - Architecture Analysis"
version: v2.1.0
created: 2025-12-28
updated: 2025-12-29
status: active
phase: migration
read_order: 1
tags: [mern, nodejs, express, handlebars, architecture]
---

# ?? MERN Migration Annotations - What's What?

**Purpose:** Identify which parts of the codebase are Node.js, Express, Handlebars, or Business Logic  
**Goal:** Help you understand what stays in MERN and what gets replaced by React

---

## ?? **Table of Contents**

- [TL;DR - Quick Overview](#tldr---quick-overview)
- [main.js - Annotated](#mainjs---annotated)
- [Summary Table](#summary-table)
- [Migration Path for Animals Tool](#migration-path-for-animals-tool)
- [What Changes in Each File](#what-changes-in-each-file)
- [Key Insights for MERN](#next-steps)

---

## ?? **TL;DR - Quick Overview**

**Purpose:** Show you which parts of main.js are Node.js, Express, Handlebars, or Business Logic.

**Key Insight:** 70% of your code is MERN-ready. Only Handlebars configuration needs replacing with React.

**Main Discoveries:**
- Node.js core modules ? KEEP (require, fs, path)
- Express.js setup ? KEEP (routes, middleware)
- Handlebars engine ? REMOVE (templates, helpers, res.render)
- Business logic ? KEEP (callbacks, queries)

**Bottom Line:** Your Express backend just needs API routes instead of template routes.

---

## ?? **main.js - Annotated**

**?? TL;DR:** Each section labeled - Node.js (KEEP), Express (KEEP), Handlebars (REMOVE), or Logic (KEEP).

```javascript
/**
 * ARCHITECTURE OVERVIEW:
 * - Node.js Core: require(), process, __dirname
 * - Express.js: app, routing, middleware
 * - Handlebars: view engine (REPLACE WITH REACT)
 * - Business Logic: callbacks, queries (KEEP FOR API)
 */

 // ============================================
// NODE.JS CORE - Native Node modules
// ? KEEP IN MERN (Backend needs these)
// ============================================
require('dotenv').config();          // NODE.JS: Environment variables
var path = require('path');          // NODE.JS: File path utilities

// ============================================
// EXPRESS.JS - Web framework
// ? KEEP IN MERN (Backend API server)
// ============================================
var express = require('express');              // EXPRESS: Framework
var session = require('express-session');      // EXPRESS: Session middleware
var bodyParser = require('body-parser');       // EXPRESS: Parse request bodies
var app = express();                           // EXPRESS: Create app instance

// ============================================
// HANDLEBARS - Template engine
// ? REMOVE IN MERN (React replaces this)
// ============================================
var helpers = require('./views/helpers/helpers');     // HANDLEBARS: Template helpers

var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',                            // HANDLEBARS: Layout wrapper
    helpers: helpers,                                 // HANDLEBARS: Custom functions
    partialsDir: './views/partials',                  // HANDLEBARS: Reusable components
    cache: false                                      // HANDLEBARS: Development setting
});

// ============================================
// DATABASE - MySQL connections
// ?? OPTIONAL IN MERN (Can keep or switch to MongoDB)
// ============================================
var mysql = require('./dbcon.js');                    // DATABASE: EVE2 connection
var mysqlIllusion = require('./dbcon_illusion.js');   // DATABASE: Illusion DB

// ============================================
// BUSINESS LOGIC - Your application code
// ? KEEP IN MERN (Becomes REST API endpoints)
// ============================================
var callbacks = require('./scripts/callbacks.js');           // BUSINESS LOGIC: EVE2
var illusionCallbacks = require('./scripts/illusionCallbacks.js'); // BUSINESS LOGIC: Illusion
var queries = require('./scripts/queries.js');               // BUSINESS LOGIC: SQL queries

// ============================================
// EXPRESS MIDDLEWARE SETUP
// ? KEEP IN MERN (Backend needs these)
// ============================================
app.use(session({                              // EXPRESS: Session management
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(bodyParser.urlencoded({extended:true})); // EXPRESS: Parse form data
app.use('/static', express.static('public'));    // EXPRESS: Serve static files

// ============================================
// HANDLEBARS CONFIGURATION
// ? REMOVE IN MERN (React handles views)
// ============================================
app.engine('handlebars', handlebars.engine);   // HANDLEBARS: Register engine
app.set('view engine', 'handlebars');          // HANDLEBARS: Set default

// ============================================
// EXPRESS APP CONFIGURATION
// ? KEEP IN MERN (Standard Express setup)
// ============================================
app.set('port', process.argv[2] || 80);        // EXPRESS: Port config
app.set('mysql', mysql);                       // EXPRESS: Store DB in app
app.set('mysqlIllusion', mysqlIllusion);
app.set('callbacks', callbacks);               // EXPRESS: Store business logic
app.set('illusionCallbacks', illusionCallbacks);
app.set('animalsCallbacks', require('./scripts/animalsCallbacks'));
app.set('queries', queries);

// ============================================
// EXPRESS ROUTING
// ? KEEP IN MERN (But change to REST API routes)
// Current: Returns HTML via Handlebars
// Future: Returns JSON for React to consume
// ============================================
app.use('/resume/', require('./resume.js'));         // ROUTING: Resume routes
app.use('/eve2/', require('./eve2.js'));             // ROUTING: EVE2 routes
app.use('/illusion/', require('./illusion.js'));     // ROUTING: Illusion routes
app.use('/animals/', require('./animals.js'));       // ROUTING: Animals routes
app.use('/', require('./documentation.js'));         // ROUTING: Docs routes

// EXPRESS: Serve static HTML file
app.get('/index.html', (req, res) => {               // EXPRESS: Static route
    res.sendFile(path.join(__dirname, 'public', 'site-index.html')); // NODE.JS: path.join
});

// EXPRESS: Redirect
app.get('/', (req, res) => {                         // EXPRESS: Root route
    res.redirect(301, "https://www.realfeygon.com/resume"); // EXPRESS: Redirect
});

// ============================================
// EXPRESS ERROR HANDLING
// ? KEEP IN MERN (Still need error handlers)
// ============================================
app.use(function(req, res) {                         // EXPRESS: 404 handler
    res.status(404);
    res.render('404');  // ? Change to: res.json({ error: 'Not found' })
});

app.use(function(err, req, res, next) {              // EXPRESS: 500 handler
    console.error(err.stack);                        // NODE.JS: console
    res.status(500);
    res.render('500');  // ? Change to: res.json({ error: 'Server error' })
});

// ============================================
// EXPRESS SERVER START
// ? KEEP IN MERN (Backend server listens here)
// ============================================
app.listen(app.get('port'), function() {             // EXPRESS: Start server
    console.log('Express started on http://localhost:' + app.get('port'));
});
```

---

## ?? **Summary Table**

**?? TL;DR:** Quick reference - what tech is what, and whether it stays in MERN.

| Component | Technology | Keep? | Future Role |
|-----------|-----------|-------|-------------|
| `require()`, `module.exports` | **Node.js Core** | ? YES | Backend modules |
| `express()`, `app.use()` | **Express.js** | ? YES | REST API server |
| `res.render()` | **Express + Handlebars** | ? NO | ? `res.json()` |
| `handlebars.create()` | **Handlebars** | ? NO | ? React |
| `helpers.js` functions | **Handlebars Helpers** | ? NO | ? React hooks |
| `callbacks.js` logic | **Business Logic** | ? YES | API handlers |
| `queries.js` SQL | **Database** | ?? MAYBE | Keep or MongoDB |
| `bodyParser` | **Express Middleware** | ? YES | Parse JSON |
| `express-session` | **Express Middleware** | ? YES | Or JWT |

---

## ?? **Migration Path for Animals Tool**

**?? TL;DR:** Current = server renders HTML. Future = server sends JSON, React renders UI.

### **Current Flow (Handlebars):**
```
User Request ? Express Route ? Callback Logic ? MySQL Query 
? Build Context Object ? Render Handlebars Template ? Send HTML
```

### **Future Flow (MERN):**
```
User Action ? React Component ? Fetch API Call ? Express Route 
? Callback Logic ? MySQL/MongoDB Query ? Return JSON ? React Updates UI
```

---

## ?? **What Changes in Each File**

**?? TL;DR:** Remove Handlebars config, add JSON middleware, change res.render() to res.json().

### **main.js Changes:**
```javascript
// BEFORE (Handlebars):
app.engine('handlebars', handlebars.engine);  // ? Remove
app.set('view engine', 'handlebars');         // ? Remove
res.render('animals', context);               // ? Remove

// AFTER (MERN):
app.use(express.json());                      // ? Add for React
app.use(cors());                              // ? Add for React dev server
res.json({ animals: data });                  // ? Add for API responses
```

### **animals.js Changes:**
```javascript
// BEFORE (Handlebars):
router.get('/animals', (req, res) => {
    callbacks.getAnimalsPage(res, context, () => {
        res.render('animals', context);  // ? Renders HTML
    });
});

// AFTER (MERN):
router.get('/api/animals', async (req, res) => {
    try {
        const data = await callbacks.loadAnimalsData();
        res.json(data);  // ? Returns JSON for React
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## ?? **Key Insights for MERN**

**?? TL;DR:** You already have Express + Logic. Just need to swap Handlebars for React.

### **? What You Already Have (MERN-Ready):**
1. **Express.js server** - Just needs API routes instead of template routes
2. **Business logic in callbacks** - Becomes your API controllers
3. **MySQL queries** - Can keep or migrate to MongoDB
4. **Session management** - Can switch to JWT tokens
5. **Error handling** - Just return JSON instead of HTML

### **? What Gets Replaced by React:**
1. **Handlebars templates** ? React components
2. **Handlebars helpers** ? React custom hooks
3. **Partials** ? React reusable components
4. **Server-side rendering** ? Client-side React rendering
5. **res.render()** ? res.json()

### **?? What Needs Rethinking:**
1. **Session management** - Consider JWT tokens
2. **File uploads** - May need different approach
3. **SEO** - May need Next.js for server-side rendering
4. **Form submissions** - Becomes API calls with fetch/axios

---

## ?? **Next Steps**

**?? TL;DR:** Read docs in order, trace code flow, identify patterns, form migration hypothesis.

1. **Read this file thoroughly** - Form mental model
2. **Examine animals.js** - See routing patterns
3. **Look at animalsCallbacks.js** - Business logic stays!
4. **Check helpers.js** - These become React utilities
5. **Review animals.handlebars** - This becomes React components

**Tomorrow:** Annotate `animals.js` to show exact migration path

---

**Questions to ask yourself:**
- Which parts are "glue code" (connecting things)?
- Which parts are "business rules" (your app logic)?
- Which parts are "presentation" (how things look)?

**MERN Keeps:** Business rules + glue code  
**React Replaces:** Presentation layer

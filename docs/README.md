# ?? RealFeygon.com Documentation

**Current Version:** v2.1.0 (Animals Tool + Modern Practices)  
**Next Version:** v3.0.0 (React Migration)  
**Last Updated:** December 29, 2025

---

## ?? **Table of Contents**

- [START HERE](#-start-here)
- [Project Overview](#-project-overview)
- [Version History](#-version-history)
- [Current Phase: MERN Migration](#-current-phase-mern-migration)
- [Documentation Structure](#-documentation-structure)
- [Document Status Legend](#-document-status-legend)
- [Quick Links](#-quick-links)

---

## ?? **START HERE**

### **New to the project?**
1. [Project Overview](#-project-overview) - What this project is
2. [Version History](#-version-history) - How it evolved
3. [Current Phase](#-current-phase-mern-migration) - What we're doing now

### **Looking for specific docs?**
- ?? [Learning: MERN Migration](learning/) - 4-part series (start here for React migration)
- ?? [Testing Plan](testing/TESTING_PLAN.md) - Testing strategy and setup
- ?? [Deployment Guide](deployment/CI_CD_SETUP.md) - CI/CD pipeline
- ?? [Historical Docs](archive/) - Old docs for reference

---

## ?? **Project Overview**

RealFeygon.com is a multi-SPA portfolio project demonstrating full-stack development:

- **EVE2 Tool** - Inventory management system (v1.0, 2018)
- **Illusion Tool** - Pathfinder 2e spell reference (v2.0, early December 2025)
- **Animals Tool** - Bestiary filter/search (v2.1, late December 2025)

**Tech Stack:**
- Backend: Node.js, Express.js, MySQL
- Frontend: Handlebars (v1-v2) ? React (v3, in progress)
- Deployment: GitHub Actions ? DirectAdmin
- Testing: Mocha + Chai + Supertest (v2.1+)

**Purpose:**
- Learning full-stack development
- Demonstrating modern practices
- Portfolio for job hunting
- Documenting the learning journey

---

## ??? **Version History**

| Version | Name | Key Features | Date |
|---------|------|--------------|------|
| **v1.0** | Handlebars OSU | EVE2 SPA created (undergrad project) | 2018 |
| **v1.1** | Handlebars RealFeygon | Added /resume route, moved to RealFeygon.com | 2019 |
| **v2.0** | Multi-SPA + CI/CD | Illusion spell tool, automated deployment pipeline | Early Dec 2025 |
| **v2.1** | Modern Practices | Animals tool, neuro-accessibility, Agentic SDLC, documentation | Late Dec 2025 |
| **v3.0** | React Migration | Migrate Animals to React (PLANNED) | 2026 |

### **Version Milestones:**

**v1.0 - The Beginning (2018)**
- EVE2 inventory management SPA
- Server-side rendering with Handlebars
- MySQL database
- Basic Express routing
- Deployed on OSU server

**v1.1 - Going Live (2019)**
- Added /resume HTML page
- Moved to RealFeygon.com (GeniusMojo hosting)
- Multiple routes on single server

**v2.0 - Professional Practices (Early December 2025)**
- Added Illusion spell tool (second SPA)
- Implemented CI/CD with GitHub Actions
- Automated deployment to DirectAdmin
- Multi-SPA architecture

**v2.1 - Modern Development (Late December 2025)**
- Added Animals bestiary tool (third SPA)
- Neuro-accessibility guidelines implemented
- Agentic SDLC with Claude
- Comprehensive documentation practices
- Testing framework setup (Mocha + Chai)

**v3.0 - React Era (Planned 2026)**
- Migrate Animals tool to React
- REST API backend
- Modern frontend architecture
- Potential for additional tool migrations

---

## ?? **Current Phase: MERN Migration**

**Status:** Planning / Testing Setup  
**Goal:** Migrate Animals Tool from Handlebars to React  
**Phase:** v2.1 ? v3.0

### **Learning Documents (Read in Order):**

?? **MERN Migration Series:**
1. [00 - MERN Learning Summary](learning/00_MERN_OVERVIEW.md) - Overview and hypothesis
2. [01 - Architecture Annotations](learning/01_ARCHITECTURE.md) - What's Node/Express/Handlebars
3. [02 - Animals Router Analysis](learning/02_ANIMALS_ROUTER.md) - animals.js migration
4. [03 - Callbacks Analysis](learning/03_ANIMALS_CALLBACKS.md) - Business logic analysis

?? **Supporting Docs:**
- [99 - Neuro-Accessibility Audit](learning/99_AUDIT.md) - Documentation compliance

### **Testing:**
- ?? [Testing Plan](testing/TESTING_PLAN.md) - Phase 0 setup (Dec 28, 2025)

### **Deployment:**
- ?? [CI/CD Setup](deployment/CI_CD_SETUP.md) - Automated deployment (v2.0)

---

## ?? **Documentation Structure**

### **?? Active (Current Work)**
Current development docs, updated frequently.

```
learning/          - MERN migration guides (4-part series)
testing/           - Testing strategy and plans
```

**Status:** ?? **ACTIVE** - Update as work progresses

---

### **?? Reference (Stable)**
API docs and guides that stay current across versions.

```
deployment/        - CI/CD pipeline setup (v2.0+)
setup/             - Installation & configuration
git/               - Git workflow guides
development/       - Dev tools & troubleshooting
```

**Status:** ?? **CURRENT** - Maintained, stable

---

### **?? Archive (Historical)**
Old docs kept for historical context, not actively maintained.

```
archive/           - Bug fixes, old implementations
??? 2025-12_ANIMALS_BUGS_FIXED.md    - Animals tool debugging (v2.1)
??? 2025-12_ANIMALS_PARTIALS.md      - Partials documentation (v2.1)
```

**Status:** ?? **ARCHIVED** - Reference only, not updated

---

### **?? Summaries**
Session summaries and completion reports.

```
summaries/         - Session documentation
??? CI_CD_DEPLOYMENT_SETUP.md        - Deployment session (v2.0)
```

**Status:** ?? **CURRENT** - Session notes

---

## ??? **Document Status Legend**

| Icon | Status | Meaning |
|------|--------|---------|
| ?? | **ACTIVE** | Current work, update frequently |
| ?? | **CURRENT** | Up-to-date reference, maintained |
| ?? | **REVIEW** | Needs updating or verification |
| ?? | **ARCHIVED** | Historical, kept for reference only |
| ?? | **OBSOLETE** | No longer relevant, delete candidate |

---

## ?? **Quick Links**

### **For Job Seekers:**
- ?? [Resume](https://www.realfeygon.com/resume) - Live resume page
- ?? [Live Site](https://www.realfeygon.com) - Production site
- ?? [GitHub Repo](https://github.com/feygon/EVE2-Project) - Source code

### **For Developers:**
- ?? [Testing](testing/TESTING_PLAN.md) - Run tests
- ?? [Deployment](deployment/CI_CD_SETUP.md) - Deploy process
- ?? [Learning Docs](learning/) - MERN migration
- ??? [Setup Guides](setup/) - Installation

### **Project Tools:**
- ?? [Animals Tool](https://www.realfeygon.com/animals) - Bestiary search
- ?? [Illusion Spells](https://www.realfeygon.com/illusion) - Spell reference
- ?? [EVE2 Tool](https://www.realfeygon.com/eve2) - Inventory system

---

## ?? **About This Documentation**

This is a personal learning project, but I document everything for:

1. **My own learning** - Writing helps me think clearly
2. **Portfolio demonstration** - Shows my technical writing skills
3. **Future reference** - "How did I solve this again?"
4. **Helping others learn** - If these docs help someone, great!

**Documentation Philosophy:**
- ? Neuro-accessible (ADHD/dyslexia friendly)
- ? Table of contents for navigation
- ? TL;DR sections for quick scanning
- ? Clear reading order
- ? Version awareness

---

## ?? **Next Steps**

### **Immediate (This Week):**
- ? Documentation restructure (this file)
- ?? Write cursory tests for critical functions
- ?? Complete testing framework setup

### **Short Term (January 2026):**
- ?? Begin React migration of Animals tool
- ?? Document migration process
- ?? Update v3.0 architecture docs

### **Long Term (2026):**
- ?? Complete Animals ? React migration
- ?? Consider migrating other tools
- ?? Expand documentation site (Docusaurus?)

---

**Last Updated:** December 29, 2025  
**Maintainer:** Feygon Nickerson  
**Version:** v2.1.0  
**Phase:** Testing Setup ? MERN Migration

# ?? Documentation Directory

## ?? Quick Access

**[? Open Documentation Portal](index.html)** ? Start here!

---

## ?? What's in This Folder?

This directory contains all project documentation organized by purpose.

---

## ?? Main Entry Points

### **1. HTML Portal (Recommended)**
**File:** `index.html`

**Open with:**
```powershell
start docs/index.html
```

**Features:**
- ?? Beautiful, modern interface
- ?? Live search
- ? Dyslexia-friendly design
- ?? Mobile responsive
- ?? Keyboard accessible

---

### **2. Markdown Index**
**File:** `INDEX.md`

Traditional markdown navigation if you prefer reading in your IDE or GitHub.

---

## ?? Folder Structure

```
docs/
??? index.html               ? ?? HTML Portal (start here!)
??? INDEX.md                 ? Markdown navigation
??? DOCUMENTATION_AUDIT.md   ? Accessibility audit
??? DOCUMENTATION_OPTIONS.md ? Portal vs Wiki comparison
?
??? setup/                   ? Installation & configuration
?   ??? LOCAL_SETUP.md
?   ??? DIRECTADMIN_ENV_SETUP.md
?   ??? DATABASE_GUI.md
?   ??? EMERGENCY_RECOVERY.md
?
??? deployment/              ? Production deployment
?   ??? DEPLOYMENT_GUIDE.md
?   ??? PRE_DEPLOYMENT_CHECKLIST.md
?
??? git/                     ? Git workflow
?   ??? GITHUB_SYNC_GUIDE.md
?   ??? GITHUB_PREP.md
?   ??? GIT_COMMANDS.md
?
??? development/             ? Dev tools & troubleshooting
?   ??? TROUBLESHOOTING.md
?
??? archive/                 ? Historical one-time docs
    ??? handlebars-debugging.md
    ??? partials-structure.md
    ??? env-migration.md
    ??? security-audit.md
```

---

## ?? Common Tasks

### **Finding Documentation:**

1. **Open HTML portal:** `start docs/index.html`
2. **Use search:** Ctrl+K in HTML portal
3. **Browse by category:** Navigate folders
4. **Check INDEX.md:** For quick links

---

### **Reading Documentation:**

**Option 1: HTML Portal (Best)**
- Beautiful design
- Live search
- Dyslexia-friendly

**Option 2: VS Code**
- Right-click `.md` file
- "Open Preview"

**Option 3: GitHub**
- Push to GitHub
- Browse online

---

### **Adding New Documentation:**

1. **Choose folder** based on category
2. **Create `.md` file**
3. **Update `index.html`** (add card)
4. **Update `INDEX.md`** (add link)
5. **Follow accessibility guidelines** (see ACCESSIBILITY_AUDIT.md)

---

## ? Accessibility Features

All documentation follows dyslexia-friendly guidelines:

- ? Table of Contents (docs > 60 lines)
- ? TL;DR sections (complex processes)
- ? Short paragraphs (2-3 lines max)
- ? Visual markers (emojis)
- ? Clear headings
- ? Code with context
- ? White space

See: `ACCESSIBILITY_AUDIT.md` for full guidelines

---

## ?? Documentation Stats

- **Total Files:** 12 active + 4 archived
- **Categories:** 5 (setup, deployment, git, development, archive)
- **Format:** Markdown + HTML portal
- **Last Updated:** December 2025
- **Accessibility:** Dyslexia-friendly

---

## ?? Deployment

### **Deploy HTML Portal:**

**Upload to production:**
```powershell
# Via SFTP (VS Code extension)
docs/index.html ? /home/realfey/eve2/docs/
```

**Access at:**
```
https://realfeygon.com/docs/index.html
```

---

### **GitHub Pages (Optional):**

**Enable in repo settings:**
1. Settings ? Pages
2. Source: main branch
3. Folder: /docs
4. Save

**Access at:**
```
https://feygon.github.io/EVE2-Project/
```

---

## ?? Related Files

**In root directory:**
- `README.md` - Project overview
- `QUICK_START.md` - Daily reference card

**Documentation about docs:**
- `DOCUMENTATION_AUDIT.md` - Accessibility audit
- `DOCUMENTATION_OPTIONS.md` - Portal vs Wiki guide
- `TROUBLESHOOTING_IMPROVEMENTS.md` - Improvement examples

---

## ?? Pro Tips

### **Quick Navigation:**

```powershell
# Open HTML portal
start docs/index.html

# Open specific doc in VS Code
code docs/development/TROUBLESHOOTING.md

# Search all docs
cd docs
Get-ChildItem -Recurse *.md | Select-String "search term"
```

---

### **Keyboard Shortcuts (HTML Portal):**

- `Ctrl+K` or `Cmd+K` - Focus search
- `Tab` - Navigate cards
- `Enter` - Open document
- `Esc` - Clear search

---

## ?? Need Help?

1. **Can't find something?** Use search in HTML portal
2. **Documentation unclear?** Check TROUBLESHOOTING.md
3. **Want to contribute?** See accessibility guidelines
4. **Report issues:** GitHub issues or improve docs directly

---

## ? Quick Start

**New to the project?**

1. **Open:** `start docs/index.html`
2. **Read:** Quick Start section
3. **Follow:** Setup guides in order
4. **Reference:** Bookmark for daily use

---

**Welcome to the documentation!** ???

**Start browsing:** [index.html](index.html) ??

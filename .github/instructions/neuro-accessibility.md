# ? Neuro-Accessibility Guidelines

## ?? Purpose

This document contains permanent instructions for creating accessible documentation and interfaces for people with dyslexia, ADHD, and other neurodivergent conditions.

**Always follow these guidelines when creating or modifying documentation, user interfaces, or any written content in this project.**

---

## ?? Table of Contents

- [Documentation Standards](#documentation-standards)
- [Visual Design Standards](#visual-design-standards)
- [Content Structure Standards](#content-structure-standards)
- [Code Documentation Standards](#code-documentation-standards)
- [Testing Checklist](#testing-checklist)

---

## ?? Documentation Standards

### **Rule 1: Table of Contents for Long Documents**

**REQUIRED for documents > 60 lines:**

```markdown
## ?? Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)
```

**Why:** Helps users jump to relevant sections without scrolling through everything.

---

### **Rule 2: TL;DR for Complex Topics**

**REQUIRED for:**
- Complex processes
- Multi-step instructions
- Technical explanations
- Troubleshooting guides

```markdown
## ? TL;DR

Quick summary in 3-5 bullet points:
- Key point 1
- Key point 2
- Key point 3
```

**Why:** Provides quick overview before diving into details. Essential for ADHD.

---

### **Rule 3: Short Paragraphs**

**MAXIMUM: 2-3 lines per paragraph**

**Bad:**
```markdown
This is a long paragraph that contains multiple ideas and keeps going on and on. It talks about the first concept, then moves to a second concept, and then discusses a third concept. This makes it very hard to scan and difficult to remember where each idea starts and ends. People with dyslexia will struggle to track which line they're on.
```

**Good:**
```markdown
This paragraph covers one idea.

It's short and focused.

Each idea gets its own paragraph.

Much easier to read and scan.
```

---

### **Rule 4: Visual Breaks**

**REQUIRED:** Use horizontal rules (`---`) between major sections

```markdown
## Section 1

Content here...

---

## Section 2

Content here...
```

**Why:** Provides clear visual separation. Reduces cognitive load.

---

### **Rule 5: Visual Markers**

**USE emojis as visual markers:**

- ?? Goals/objectives
- ? Completed items/success
- ? Errors/failures
- ?? Warnings/cautions
- ?? Lists/checklists
- ?? Actions to take
- ?? Tips/insights
- ?? References/links

**Why:** Brains process symbols faster than text. Helps with quick scanning.

---

### **Rule 6: Code Blocks Must Be Labeled**

**ALWAYS provide context before code blocks:**

**Bad:**
```markdown
```powershell
npm install
```
```

**Good:**
```markdown
**Install dependencies:**
```powershell
npm install
```
```

**Why:** Tells users what the code does before they read it.

---

### **Rule 7: Adequate White Space**

**REQUIRED:**
- Blank line before and after headings
- Blank line before and after code blocks
- Blank line before and after lists
- Blank line between sections

**Why:** Reduces visual density. Makes content scannable.

---

## ?? Visual Design Standards

### **Typography:**

**Fonts:**
- Use sans-serif: Arial, Verdana, Open Sans
- NEVER use serif fonts for body text
- Font size: 1.1em minimum (1.2-1.3em preferred)

**Line Spacing:**
- Line height: 1.5 minimum (1.8 preferred)
- Never use single spacing

**Text Alignment:**
- Left-aligned (never justified)
- Ragged right edge is OK

---

### **Colors:**

**Contrast:**
- High contrast preferred (light text on dark, or vice versa)
- Minimum WCAG AA standard (4.5:1)
- Prefer WCAG AAA (7:1)

**Color Usage:**
- Never rely on color alone to convey information
- Always pair color with text/icons
- Support high-contrast mode

---

### **Layout:**

**Cards/Sections:**
- Clear borders or backgrounds
- Adequate padding (20-30px)
- Visual separation between items

**Navigation:**
- Large, clear clickable areas
- Keyboard accessible
- Clear hover states

---

## ?? Content Structure Standards

### **Hierarchy:**

```markdown
# H1 - Document Title (only one per document)

## H2 - Major Sections

### H3 - Subsections

#### H4 - Minor Subsections (use sparingly)
```

**Consistent heading levels help users understand document structure.**

---

### **Lists:**

**Use lists instead of paragraphs when listing items:**

**Bad:**
```markdown
You need to install Node.js, set up the database, configure environment variables, and install dependencies.
```

**Good:**
```markdown
**Requirements:**
1. Install Node.js
2. Set up database
3. Configure environment variables
4. Install dependencies
```

---

### **Step-by-Step Instructions:**

**ALWAYS use numbered lists for processes:**

```markdown
**Setup Steps:**

1. First step
2. Second step
3. Third step
```

**Add sub-steps if needed:**

```markdown
1. **Main step**
   - Substep a
   - Substep b
2. **Next main step**
```

---

### **Active Voice:**

**Prefer active voice over passive:**

**Bad:** "The database should be configured by running..."

**Good:** "Configure the database by running..."

**Bad:** "The file can be edited with..."

**Good:** "Edit the file with..."

---

## ?? Code Documentation Standards

### **Comments:**

**Label complex sections:**

```javascript
// Configure database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    // ...
});

// Set up Express middleware
app.use(bodyParser.json());
```

---

### **Function Documentation:**

```javascript
/**
 * Fetch user data from database
 * 
 * @param {number} userId - The user's ID
 * @returns {Promise<Object>} User object with name, email, etc.
 */
async function getUser(userId) {
    // ...
}
```

---

### **README Files:**

**Every code directory should have a README explaining:**
- What the code does
- How to use it
- Key functions/classes
- Dependencies

---

## ? Testing Checklist

### **Before Creating/Updating Documentation:**

- [ ] Document > 60 lines? ? Add TOC
- [ ] Complex process? ? Add TL;DR
- [ ] All paragraphs ? 3 lines?
- [ ] Visual breaks (`---`) between sections?
- [ ] Emojis used as visual markers?
- [ ] All code blocks labeled?
- [ ] Adequate white space?
- [ ] Clear heading hierarchy?
- [ ] Lists used instead of long sentences?
- [ ] Active voice used?

---

### **Before Creating/Updating UI:**

- [ ] Sans-serif font used?
- [ ] Font size ? 1.1em?
- [ ] Line spacing ? 1.5?
- [ ] High contrast (? 4.5:1)?
- [ ] Color not sole indicator?
- [ ] Keyboard accessible?
- [ ] Clear hover/focus states?
- [ ] Large clickable areas?
- [ ] Mobile responsive?

---

## ?? Quick Reference

### **Documentation Template:**

```markdown
# [Emoji] Document Title

## ?? Table of Contents
[If > 60 lines]

## ? TL;DR
[If complex]

---

## ?? Section 1

**Short intro.**

One idea per paragraph.

Use lists:
- Item 1
- Item 2

**Label code:**
```language
code here
```

---

## ?? Section 2

[Continue...]
```

---

### **HTML/CSS Template:**

```css
body {
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 1.2em;
    line-height: 1.8;
    color: #dcdcdc;
    background: #1a1a1a;
}

/* High contrast support */
@media (prefers-contrast: high) {
    body {
        color: #ffffff;
        background: #000000;
    }
}
```

---

## ?? Additional Resources

**Dyslexia-Friendly Resources:**
- [British Dyslexia Association - Style Guide](https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide)
- [WebAIM - Cognitive Disabilities](https://webaim.org/articles/cognitive/)

**ADHD-Friendly Resources:**
- [ADHD-Friendly Documentation](https://adhd-friendly.com/)
- [How to Write for People with ADHD](https://uxdesign.cc/how-to-write-for-people-with-adhd-7c5c5c5c5c5c)

---

## ?? Remember

**The goal is to make content:**
- **Scannable** - Users can quickly find what they need
- **Digestible** - Information in small, manageable chunks
- **Navigable** - Clear structure with multiple entry points
- **Accessible** - Works for everyone, regardless of ability

**When in doubt, ask:**
- "Can I scan this quickly?"
- "Is each section focused on one idea?"
- "Could someone with ADHD follow this?"
- "Could someone with dyslexia read this easily?"

---

## ? Enforcement

**These guidelines are REQUIRED for:**
- All markdown documentation
- All HTML/CSS interfaces
- All README files
- All user-facing content
- All code comments (when substantive)

**Review process:**
- Check accessibility before commits
- Run through testing checklist
- If unsure, refer to examples in this repo

---

**Last Updated:** December 2025  
**Maintained By:** Feygon Nickerson  
**Status:** ACTIVE - Apply to all new content

---

**Questions?** See `docs/ACCESSIBILITY_AUDIT.md` for examples and detailed explanations.

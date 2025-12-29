---
title: "Animals Tool Quick Start Guide"
version: v2.1.0
created: 2025-12-26
updated: 2025-12-29
status: current
category: reference
tags: [animals, quickstart, guide]
---

# ?? Summon Animal Comparison Tool - Quick Start

**Version:** v2.1.0  
**Last Updated:** December 29, 2025  
**Status:** ?? Current

## ?? **Table of Contents**

- [TL;DR](#tldr)
- [What This Does](#-what-this-does)
- [Quick Start](#-quick-start-3-steps)
- [Files Explained](#-files-explained)
- [Using the Comparison Tool](#-using-the-comparison-tool)
- [Data Structure](#-data-structure)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Integration Ideas](#-integration-ideas)
- [Resources](#-resources)
- [Legal & Ethics](#-legal--ethics)
- [Contributing](#-contributing)
- [Next Steps](#-next-steps)

---

## ?? **TL;DR**

**?? What it is:** Web scraper + comparison tool for Pathfinder 2e Summon Animal spell.

**Quick start:** `npm install` ? `npm run scrape` ? open `animal-comparison.html`

**Features:** Filter by level/size/speed, sort by stats, color-coded cards, all offline after scraping.

**Time:** 5-10 minutes to scrape, instant filtering after.

---

## ?? **What This Does**

**?? TL;DR:** Scrapes all animals from Archives of Nethys, creates Normal/Weak/Elite versions, provides filterable comparison interface.

The **Summon Animal** spell lets you summon any animal of a given level, including:
- **Normal** animals at that level
- **Weak** versions of level+1 animals (adjusted down)
- **Elite** versions of level-1 animals (adjusted up)

This tool scrapes all animals and their variations, then provides an interactive comparison interface.

## ?? **Quick Start (3 Steps)**

**?? TL;DR:** Install deps, run scraper, open HTML file - ready to filter and compare.

### Step 1: Install Dependencies

```bash
cd Extras
npm install
```

### Step 2: Scrape the Data

**Option A: Test Run (First 5 Animals)**
```bash
npm run test
```

**Option B: Full Scrape (All Animals)**
```bash
npm run scrape
```

?? **Estimated Time:** 
- Test: ~30 seconds
- Full: 5-10 minutes for ~100 animals

### Step 3: View the Comparison Tool

```bash
# Open in your default browser
start animal-comparison.html

# Or manually open Extras/animal-comparison.html
```

## ?? **Files Explained**

**?? TL;DR:** Scraper script, comparison HTML, verification tool, data JSON, documentation.

| File | Purpose |
|------|---------|
| `scrape-animals.js` | Web scraper that fetches animal data from 2e.aonprd.com |
| `animals-data.json` | Output file with all animal data (created by scraper) |
| `animal-comparison.html` | Interactive comparison viewer (open in browser) |
| `package.json` | Node.js dependencies |
| `README-SCRAPER.md` | Detailed documentation |

## ?? **Using the Comparison Tool**

**?? TL;DR:** Open HTML, use filters for level/size/speed, sort by various stats, click to expand details.

Once you open `animal-comparison.html`:

### Filters Available:

1. **Spell Level** - Show only animals summonable at that spell level
2. **Size** - Filter by creature size (Tiny, Small, Medium, Large, etc.)
3. **Min Speed** - Show only animals with at least X feet movement
4. **Search Name** - Find specific animals by name
5. **Sort By** - Order by Level, Name, HP, AC, or Speed

### Example Use Cases:

**"What animals can I summon at level 3?"**
- Set "Spell Level" to 3
- See all Level 3 Normal animals
- See all Level 4 Weak animals (-1 level adjustment)
- See all Level 2 Elite animals (+1 level adjustment)

**"What's the fastest level 3 animal?"**
- Set "Spell Level" to 3
- Set "Sort By" to Speed
- Top result is your answer!

**"Which level 2 animal has the most HP?"**
- Set "Spell Level" to 2
- Set "Sort By" to HP
- Compare the tankiest options

**"Show me all Large flying animals"**
- Set "Size" to Large
- Check each creature's speed stats for "fly"

## ?? **Data Structure**

**?? TL;DR:** JSON format with metadata, animals array, trait index - comprehensive stat tracking.

The scraper outputs JSON in this format:

```json
{
  "id": "3175",
  "name": "Giant Scorpion",
  "baseLevel": 3,
  "versions": {
    "normal": { /* Level 3 stats */ },
    "weak": { /* Level 2 stats */ },
    "elite": { /* Level 4 stats */ }
  }
}
```

Each version includes:
- Level, Size, Traits
- Perception, Senses, Skills
- Attributes (Str, Dex, Con, Int, Wis, Cha)
- Defenses (AC, Saves, HP)
- Speed (land, fly, swim, climb, burrow)
- Attacks (bonus, damage, traits)
- Special Abilities
- Source book

## ?? **Customization**

**?? TL;DR:** Easy CSS changes, add filters, modify layout - or go advanced with database/backend.

### Modify the Scraper

Edit `scrape-animals.js` to:
- Change rate limiting (currently 1 second between requests)
- Add more data fields
- Filter which animals to scrape
- Adjust parsing logic

### Customize the Viewer

Edit `animal-comparison.html` to:
- Change the styling/colors
- Add more filters (e.g., by special abilities)
- Modify the sorting options
- Add export functionality
- Create printable character sheets

## ?? **Troubleshooting**

**?? TL;DR:** Common issues - no data file (run scraper), parsing errors (site changed), slow scraping (be patient).

### "Error loading data"
- Make sure you ran the scraper first: `npm run scrape`
- Check that `animals-data.json` exists in the Extras folder
- Verify the JSON file isn't empty or corrupted

### "No animals found in trait table"
- The Archives of Nethys website might be down
- Your internet connection might be interrupted
- The site structure may have changed (parser needs updating)

### Scraper is slow
- This is intentional! We use 1-second delays to be respectful to the server
- Don't remove rate limiting - it helps prevent overloading the site
- Use `npm run test` for quick testing with just 5 animals

### Missing data in cards
- Some creatures may have incomplete data on the source site
- Parser might need adjustment for edge cases
- Check the `animals-data.json` file to see what data was captured

## ?? **Integration Ideas**

**?? TL;DR:** Add to existing site, create character sheets, build encounter tools.

### Add to Your Main Site

1. **Copy `animal-comparison.html` to your public folder**
   ```bash
   copy animal-comparison.html ..\public\summon-animal.html
   ```

2. **Add route in Express** (in `main.js`):
   ```javascript
   app.get('/summon-animal', (req, res) => {
       res.sendFile(path.join(__dirname, 'public', 'summon-animal.html'));
   });
   ```

3. **Add to navigation** (in `views/layouts/main.handlebars`):
   ```html
   <a href="/summon-animal">Summon Animal Tool</a>
   ```

### Advanced Features to Add

- **Save Favorite Animals** - Store selections in localStorage
- **Compare Side-by-Side** - Select 2-3 animals for direct comparison
- **Print Character Sheets** - Format for printing at the table
- **Export to PDF** - Generate summoner reference sheets
- **Add Images** - Display creature art from the site
- **Encounter Builder** - Build encounters with multiple summons

## ?? **Resources**

**?? TL;DR:** Data from Archives of Nethys, Pathfinder 2e by Paizo, tool built for community.

- **Archives of Nethys**: https://2e.aonprd.com/
- **Summon Animal Spell**: https://2e.aonprd.com/Spells.aspx?ID=1694
- **Pathfinder 2e Rules**: https://2e.aonprd.com/Rules.aspx

## ?? **Legal & Ethics**

**?? TL;DR:** Respectful scraping (1-sec delays), attribute data source, personal/educational use only.

- **Respectful Scraping**: 1-second delays between requests
- **Personal Use**: For your own gaming reference
- **Attribution**: Data from Archives of Nethys / Paizo Publishing
- **No Abuse**: Don't run the scraper excessively

## ?? **Contributing**

**?? TL;DR:** Report bugs, suggest features, improve parsing, share use cases.

Want to improve the tool?

1. **Better Parsing**: Update regex patterns in `scrape-animals.js`
2. **More Filters**: Add new filter options in `animal-comparison.html`
3. **Better Styling**: Improve the CSS for the comparison cards
4. **Bug Fixes**: Report issues or submit improvements

## ?? **Next Steps**

**?? TL;DR:** Run scraper, explore comparison tool, customize for your campaign, integrate with your site.

After using the basic tool:

1. **Customize for your campaign** - Add house rules, custom animals
2. **Create summoner character sheets** - Pre-select favorites by level
3. **Build encounter references** - Organize by terrain, theme, etc.
4. **Share with your group** - Deploy to your campaign website

---

**Happy Summoning!** ????

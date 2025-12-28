# ?? Summon Animal Tool - Complete System

A complete web scraping and comparison system for Pathfinder 2e's Summon Animal spell, built to help players and GMs quickly compare and select animal summons.

## ?? What's Included

### Core Files

1. **`scrape-animals.js`** - Main web scraper
   - Fetches animal list from the Animal trait page
   - Downloads Normal, Weak, and Elite versions of each creature
   - Parses HTML to extract structured data
   - Outputs clean JSON

2. **`animal-comparison.html`** - Interactive SPA
   - Filter by level, size, speed, name
   - Sort by various stats
   - Color-coded cards (Normal/Weak/Elite)
   - Responsive grid layout
   - Works entirely in the browser (no server needed)

3. **`verify-data.js`** - Data validation tool
   - Checks data completeness
   - Verifies level adjustments
   - Displays statistics
   - Identifies any issues

### Documentation

4. **`QUICKSTART.md`** - Fast setup guide
5. **`README-SCRAPER.md`** - Detailed documentation
6. **`package.json`** - Node.js configuration

### Generated Files

7. **`animals-data.json`** - Scraped creature data (created by scraper)

## ?? The Problem This Solves

**Summon Animal** is a primal spell that lets you summon ANY animal of a given level. But this includes:
- Normal animals at that level
- Weak versions from the level above
- Elite versions from the level below

**The problem:** There's no easy way to compare all available options at a glance!

**This tool:** Scrapes all animals, creates all three versions, and provides an interactive comparison interface.

## ?? Usage Workflow

```
1. Install dependencies
   ??> npm install

2. Scrape the data
   ??> npm run scrape (or npm run test for testing)

3. Verify the data (optional)
   ??> npm run verify

4. Open the comparison tool
   ??> Open animal-comparison.html in browser

5. Filter and compare!
   ??> Use filters to find perfect summon for situation
```

## ?? Key Features

### Scraper Features
- ? Fetches all animals from trait page
- ? Gets all 3 versions (Normal, Weak, Elite)
- ? Respects server with 1-second delays
- ? Extracts comprehensive stats
- ? Handles parsing errors gracefully
- ? Test mode for quick validation
- ? Progress reporting

### Comparison Tool Features
- ? Filter by spell level
- ? Filter by size
- ? Filter by minimum speed
- ? Search by name
- ? Sort by level, name, HP, AC, speed
- ? Color-coded cards by version
- ? Responsive grid layout
- ? Shows all relevant combat stats
- ? Displays attacks and abilities
- ? Works offline after initial load

### Data Extracted
- Level, Size, Traits
- Perception, Senses
- Skills (Athletics, Stealth, etc.)
- Attributes (Str, Dex, Con, Int, Wis, Cha)
- AC, Saves (Fort, Ref, Will), HP
- Speed (land, fly, swim, climb, burrow)
- Attacks (bonus, traits, damage)
- Special Abilities
- Source book reference

## ?? Example Use Cases

### At Character Creation
**"I'm building a level 5 primal caster. What are my best summon options?"**
1. Set spell level to 5
2. Sort by HP to see tanky options
3. Sort by Speed to see scouts
4. Compare attacks to find damage dealers

### During Game Session
**"I need to summon something that can fly and has good AC"**
1. Enter appropriate spell level
2. Check Speed column for "fly"
3. Sort by AC
4. Quick reference for attacks and HP

### Campaign Planning
**"What animals are available in this level range?"**
1. Browse by level to see distribution
2. Note which animals appear at multiple levels (weak/elite)
3. Plan encounters or NPC summons

## ?? Customization Options

### Easy Customizations (No Coding)
- Change color scheme in CSS
- Add custom filters in HTML
- Modify which stats display prominently
- Adjust card layout and size

### Medium Customizations (Some Coding)
- Add new filter criteria (e.g., by special ability)
- Create comparison mode (side-by-side)
- Add favorite/bookmark system
- Export to PDF or print-friendly format

### Advanced Customizations (Significant Coding)
- Integrate with your main website
- Add database backend
- Create character sheet generator
- Build encounter calculator
- Add custom creatures or house rules

## ?? Integration Ideas

### Add to Existing Website
```javascript
// In your main.js
app.get('/tools/summon-animal', (req, res) => {
    res.sendFile(path.join(__dirname, 'Extras', 'animal-comparison.html'));
});

// Serve the data file
app.get('/data/animals-data.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'Extras', 'animals-data.json'));
});
```

### Create Character Sheets
- Pre-select favorite summons by character level
- Print reference cards for table use
- Generate quick-reference PDFs

### Build Encounter Tools
- Calculate CR of multiple summons
- Plan themed encounters (all aquatic, all flying, etc.)
- Create challenge ratings

## ?? Performance

### Scraping
- **Time:** ~5-10 minutes for full scrape (~100 animals)
- **Requests:** ~300 HTTP requests (3 per animal)
- **Rate Limiting:** 1 second between requests (respectful)
- **Output Size:** ~500KB JSON file

### Viewer
- **Load Time:** < 1 second
- **Memory:** Minimal (all client-side)
- **Browser Support:** All modern browsers
- **Mobile:** Responsive design works on phones

## ??? Ethics & Legal

### Respectful Scraping
- ? 1-second delays between requests
- ? Single-threaded (no parallel requests)
- ? Identifies itself with user agent
- ? Only scrapes public data
- ? For personal/educational use

### Attribution
- Data from Archives of Nethys (2e.aonprd.com)
- Pathfinder 2e by Paizo Publishing
- Tool built independently for community use

### Don't:
- ? Run scraper too frequently
- ? Remove rate limiting
- ? Hammer server with requests
- ? Use for commercial purposes without permission

## ?? Known Limitations

1. **Parser Edge Cases**
   - Some special abilities might not parse perfectly
   - Complex damage expressions may be truncated
   - Unusual formatting might be missed

2. **Site Changes**
   - If Archives of Nethys changes their HTML structure, parser needs updates
   - Monitor for 404 errors or empty data

3. **Manual Verification**
   - Always double-check important stats in official sources
   - Parser is best-effort, not guaranteed perfect

4. **No Images**
   - Currently text-only (could add image scraping)

## ?? Future Enhancements

### Planned
- [ ] Add creature images
- [ ] Create print-friendly sheets
- [ ] Add comparison mode
- [ ] Export to PDF
- [ ] Bookmark favorites

### Ideas
- [ ] Add spell slots calculator
- [ ] Create encounter builder
- [ ] Add DM notes field
- [ ] Integrate with character builder
- [ ] Add custom creatures support
- [ ] Create mobile app version

## ?? Technical Details

### Stack
- **Node.js** - Runtime for scraper
- **jsdom** - HTML parsing
- **Vanilla JavaScript** - No framework needed for viewer
- **CSS Grid** - Responsive layout
- **localStorage** - Could add for favorites

### Data Flow
```
Archives of Nethys
        ?
   (HTTP GET)
        ?
  scrape-animals.js
        ?
   (Parse HTML)
        ?
animals-data.json
        ?
   (Load JSON)
        ?
animal-comparison.html
        ?
    (Filter/Sort)
        ?
   Display Cards
```

### File Sizes
- **scrape-animals.js**: ~10KB
- **animal-comparison.html**: ~12KB
- **animals-data.json**: ~500KB (varies by number of animals)
- **Total package**: ~25KB (excluding data and node_modules)

## ?? Contributing

Want to improve this tool? Here's how:

### Easy Contributions
- Report bugs or parsing issues
- Suggest new filter options
- Improve documentation
- Share use cases

### Code Contributions
- Better regex patterns for parsing
- Additional data fields
- UI/UX improvements
- Performance optimizations

### Test Data
If you find animals that parse incorrectly:
1. Note the animal name and ID
2. Save the HTML source
3. Report the issue with examples

## ?? Support

### Troubleshooting Steps
1. Run `npm run verify` to check data
2. Check console for JavaScript errors
3. Verify `animals-data.json` exists and is valid JSON
4. Try test mode: `npm run test`
5. Check internet connection and site availability

### Common Issues
- **"No animals found"** - Site might be down or structure changed
- **"Error loading data"** - Run scraper first or check file path
- **"Incomplete data"** - Some animals might have non-standard formatting

## ?? License

MIT License - Free for personal and educational use

## ?? Credits

- **Data Source:** Archives of Nethys (2e.aonprd.com)
- **Game System:** Pathfinder 2e by Paizo Publishing
- **Tool Developer:** Built for the PF2e community

---

**Built with ?? for the Pathfinder 2e community**

*May your summons always be optimal!* ????????

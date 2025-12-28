# Archives of Nethys - Animal Data Scraper

Web scraper for extracting Pathfinder 2e animal creature data from Archives of Nethys (2e.aonprd.com) for use with the Summon Animal spell comparison tool.

## Purpose

The **Summon Animal** spell allows summoning any animal of a specific level, including:
- Normal animals at that level
- **Weak** versions of animals from level+1 (creatures adjusted down by 1 level)
- **Elite** versions of animals from level-1 (creatures adjusted up by 1 level)

This scraper fetches all three versions of every animal to enable comprehensive filtering and comparison.

## Features

- ? Scrapes the Animal trait page to find all animal creatures
- ? Fetches **Normal**, **Weak**, and **Elite** versions of each animal
- ? Extracts structured data:
  - Level, Size, Traits
  - Perception, Senses
  - Attributes (Str, Dex, Con, Int, Wis, Cha)
  - Defenses (AC, Fort, Ref, Will, HP)
  - Speed (land, fly, swim, etc.)
  - Attacks (melee/ranged with bonuses and damage)
  - Special Abilities
  - Source book
- ? Outputs clean JSON for SPA consumption
- ? Respectful rate limiting (1 second between requests)

## Installation

```bash
cd Extras
npm install
```

## Usage

### Full Scrape (All Animals)

```bash
npm run scrape
```

This will:
1. Fetch the animal trait table
2. Download all animal pages (Normal, Weak, Elite versions)
3. Parse and extract structured data
4. Save to `animals-data.json`

**Note:** This will take some time as it needs to fetch 3 pages per animal with rate limiting. Expect ~5-10 minutes for ~100 animals.

### Test Run (First 5 Animals)

```bash
npm run test
```

## Output Format

The scraper produces `animals-data.json` with the following structure:

```json
[
  {
    "id": "3175",
    "name": "Giant Scorpion",
    "baseLevel": 3,
    "versions": {
      "normal": {
        "version": "normal",
        "name": "Giant Scorpion",
        "level": 3,
        "traits": ["Large", "Animal"],
        "size": "Large",
        "perception": 9,
        "senses": ["darkvision", "tremorsense (imprecise) 60 feet"],
        "skills": {
          "Athletics": 11,
          "Stealth": 7
        },
        "attributes": {
          "str": 4,
          "dex": 2,
          "con": 3,
          "int": -5,
          "wis": 2,
          "cha": -4
        },
        "ac": 18,
        "saves": {
          "fortitude": 12,
          "reflex": 9,
          "will": 7
        },
        "hp": 45,
        "speed": {
          "land": 40
        },
        "attacks": [
          {
            "type": "melee",
            "name": "pincer",
            "bonus": 11,
            "traits": ["agile", "reach 10 feet"],
            "damage": "1d8+6 slashing plus Grab"
          },
          {
            "type": "melee",
            "name": "stinger",
            "bonus": 11,
            "traits": ["reach 10 feet"],
            "damage": "1d6+6 piercing plus giant scorpion venom"
          }
        ],
        "specialAbilities": [
          "Reactive Strike",
          "Constrict",
          "Giant Scorpion Venom"
        ],
        "source": "Monster Core pg. 298"
      },
      "weak": {
        "version": "weak",
        "level": 2,
        // ... adjusted stats
      },
      "elite": {
        "version": "elite",
        "level": 4,
        // ... adjusted stats
      }
    }
  }
]
```

## Building the Comparison SPA

Once you have `animals-data.json`, you can:

1. **Filter by level**: Show all animals summonable at a specific spell level
2. **Compare stats**: Side-by-side comparison of AC, HP, saves, attacks
3. **Sort by attributes**: Find the fastest, strongest, or most perceptive animals
4. **Filter by abilities**: Find animals with specific special abilities (Grab, poison, etc.)
5. **Filter by traits**: Find animals with flying, swimming, or other movement types

### Example SPA Features

```javascript
// Get all animals summonable at level 3
function getSummonableAnimals(level) {
  const available = [];
  
  animalsData.forEach(animal => {
    // Normal version at exact level
    if (animal.versions.normal.level === level) {
      available.push(animal.versions.normal);
    }
    // Weak version (base level + 1)
    if (animal.versions.weak.level === level) {
      available.push(animal.versions.weak);
    }
    // Elite version (base level - 1)
    if (animal.versions.elite.level === level) {
      available.push(animal.versions.elite);
    }
  });
  
  return available;
}

// Sort by HP
const byHP = animals.sort((a, b) => b.hp - a.hp);

// Filter by speed
const fastAnimals = animals.filter(a => a.speed.land >= 40);

// Filter by flying
const flyingAnimals = animals.filter(a => a.speed.fly);
```

## Ethical Scraping

This scraper follows ethical web scraping practices:
- ? Rate limiting (1 second between requests)
- ? Respects server load
- ? Only scrapes publicly available data
- ? Identifies itself with a clear user agent
- ? For personal/educational use

**Please be respectful:** Archives of Nethys is a community resource. Don't abuse the scraper by:
- Running it too frequently
- Removing rate limiting
- Hammering the server with parallel requests

## Next Steps

After scraping, you can:

1. **Build a comparison UI** similar to your spell comparison tool
2. **Add filtering** by level, size, speed, abilities
3. **Create summoning lists** organized by spell level
4. **Add search** for specific animal names or traits
5. **Export functionality** for printing character reference sheets

## License

MIT - For personal and educational use

## Credits

- Data source: [Archives of Nethys](https://2e.aonprd.com/)
- Pathfinder 2e by Paizo Publishing

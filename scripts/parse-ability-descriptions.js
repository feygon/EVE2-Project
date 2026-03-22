/**
 * Parse ability descriptions from the AoN HTML dump and merge into elementals-data.json
 * Run: node scripts/parse-ability-descriptions.js
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '..', 'Extras', 'Monsters - Archives of Nethys_ Pathfinder 2nd Edition Database.html');
const DATA_PATH = path.join(__dirname, '..', 'Extras', 'elementals-data.json');

const html = fs.readFileSync(HTML_PATH, 'utf-8');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

/**
 * Strip HTML tags and clean up text
 */
function stripHtml(str) {
    return str
        .replace(/<span class="icon-font">\[one-action\]<\/span>/g, '[one-action]')
        .replace(/<span class="icon-font">\[two-actions\]<\/span>/g, '[two-actions]')
        .replace(/<span class="icon-font">\[three-actions\]<\/span>/g, '[three-actions]')
        .replace(/<span class="icon-font">\[reaction\]<\/span>/g, '[reaction]')
        .replace(/<span class="icon-font">\[free-action\]<\/span>/g, '[free-action]')
        .replace(/<br\s*\/?>/g, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Generic monster abilities (from MonsterAbilities.aspx)
 * These have standard descriptions regardless of creature
 */
const GENERIC_ABILITIES = {
    "All-Around Vision": "This monster can see in all directions simultaneously and therefore can't be flanked.",
    "Aquatic Ambush": "[one-action] The monster moves up to its swim Speed + 10 feet toward a creature it is undetected by and Strikes. The target is off-guard against this Strike.",
    "At-Will Spells": "The monster can cast its at-will spells any number of times without using up spell slots.",
    "Buck": "[reaction] DC varies. The monster attempts to throw off a rider or other creature mounted on or clinging to it. The triggering creature must attempt a Reflex save or fall prone, taking 1d6 bludgeoning damage on a critical failure.",
    "Catch Rock": "[reaction] The monster gains a +4 circumstance bonus to its AC against the triggering attack. If the attack misses, the monster catches the rock.",
    "Change Shape": "[one-action] (concentrate, polymorph) The monster changes its shape indefinitely, gaining a +4 status bonus to its Deception DC to avoid detection.",
    "Constant Spells": "A constant spell affects the monster without the monster needing to cast it, and its duration is unlimited.",
    "Constrict": "[one-action] The monster deals the listed damage to any number of creatures it has grabbed or restrained, with a basic Fortitude save.",
    "Coven": "(mental, occult) Three or more creatures with coven can form a bond, granting elite adjustments, shared senses, and access to specific spells.",
    "Darkvision": "The monster can see perfectly well in areas of darkness and dim light, though such vision is in black and white only.",
    "Disease": "When a creature is exposed to a monster's disease, it attempts a Fortitude save or succumbs to the disease.",
    "Engulf": "[two-actions] The monster Strides up to double its Speed through creatures' spaces. Creatures that fail a Reflex save are engulfed, grabbed, and take listed damage.",
    "Fast Healing": "The monster regains the listed number of Hit Points each round at the beginning of its turn.",
    "Ferocity": "[reaction] Triggered when reduced to 0 HP. The monster avoids being knocked out and remains at 1 HP, increasing its wounded value by 1.",
    "Form Up": "[one-action] The troop redistributes its squares within 15 feet while maintaining contiguity.",
    "Frightful Presence": "(aura, emotion, fear, mental) Creatures within the listed area must attempt a Will save. On failure, they become frightened.",
    "Grab": "[one-action] The monster automatically Grapples a creature it just hit with a Strike, with no multiple attack penalty.",
    "Greater Constrict": "[one-action] The monster deals listed damage to grabbed or restrained creatures with a basic Fortitude save. Creatures that critically fail are also knocked unconscious.",
    "Improved Grab": "[free-action] Triggered by a successful Strike. The monster Grapples the target with no multiple attack penalty.",
    "Improved Knockdown": "[free-action] Triggered by a successful Strike. The monster Trips the target with no multiple attack penalty.",
    "Improved Push": "[free-action] Triggered by a successful Strike. The monster Shoves the target with no multiple attack penalty.",
    "Knockdown": "[one-action] The monster attempts to Trip a creature it just hit with a Strike, with no multiple attack penalty.",
    "Lifesense": "The monster senses the vital essence of living and undead creatures within the listed range.",
    "Light Blindness": "When first exposed to bright light, the monster is blinded until the end of its next turn. It remains dazzled while in bright light.",
    "Low-Light Vision": "The monster can see in dim light as though it were bright light, ignoring concealment from dim light.",
    "Poison": "When a creature is exposed to a monster's poison, it attempts a Fortitude save to avoid becoming poisoned.",
    "Pull": "[one-action] The monster attempts to Reposition a creature it just hit toward itself, with no multiple attack penalty.",
    "Push": "[one-action] The monster attempts to Shove a creature it just hit, with no multiple attack penalty.",
    "Reactive Strike": "[reaction] Triggered when a creature within reach uses a manipulate action, makes a ranged attack, or leaves a square during a move action. The monster makes a melee Strike against the triggering creature.",
    "Regeneration": "The monster regains the listed Hit Points each round. Specific damage types deactivate regeneration until the end of the monster's next turn.",
    "Rend": "[one-action] The monster automatically deals listed Strike damage to a creature it hit with two consecutive Strikes of the same type.",
    "Retributive Strike": "[reaction] Triggered when an ally within 15 feet takes damage. The ally gains resistance to the triggering damage. If the foe is within reach, the monster Strikes.",
    "Scent": "The monster can detect creatures or objects by smell within the listed range.",
    "Shield Block": "[reaction] The monster's shield prevents damage up to its Hardness, with any remaining damage shared between the monster and shield.",
    "Sneak Attack": "The monster deals extra precision damage to off-guard creatures.",
    "Stench": "(aura, olfactory) Creatures within the area must attempt a Fortitude save. On failure, they become sickened 1 (sickened 2 and slowed 1 on critical failure).",
    "Swallow Whole": "[one-action] The monster swallows a grabbed or restrained creature, restraining it and dealing listed damage each round until the creature escapes.",
    "Swarm Mind": "The swarm is immune to mental effects targeting specific numbers of creatures. It is still subject to area mental effects.",
    "Telepathy": "(aura, magical, mental) The monster can communicate mentally with creatures within the listed range that share a language with it.",
    "Throw Rock": "[one-action] The monster picks up and throws a rock as a ranged Strike.",
    "Trample": "[three-actions] The monster Strides up to double its Speed through creatures' spaces, dealing listed Strike damage with a basic Reflex save.",
    "Tremorsense": "The monster senses vibrations through solid surfaces within the listed range.",
    "Troop Defenses": "The troop is composed of segments that lose Hit Points at certain thresholds. Immune to single-target effects but affected by area abilities.",
    "Troop Movement": "The troop moves one segment, with others following. If stationary, it can reshape remaining segment positions.",
    "Void Healing": "The creature is damaged by vitality effects, healed by void effects, and unaffected by void damage.",
    "Wavesense": "The monster senses vibrations through liquid within the listed range."
};

/**
 * Extract the HTML chunk for a specific creature by its AoN URL
 */
function getCreatureChunk(url) {
    // Find the creature's section by its URL (appears in the header link)
    const urlEscaped = url.replace(/[?]/g, '\\?');
    const pattern = new RegExp('href="https://2e\\.aonprd\\.com' + urlEscaped + '"[^>]*>[^<]+</a></div><div class="align-right">Creature \\d+</div>');
    const match = pattern.exec(html);
    if (!match) return null;

    const startIdx = match.index;

    // Find the next creature header (next "Creature N" pattern) or end of major section
    const nextCreature = html.indexOf('</div></div></h2><div class="row traits', startIdx + match[0].length);
    const endIdx = nextCreature > -1 ? nextCreature : startIdx + 10000;

    return html.substring(startIdx, endIdx);
}

/**
 * Extract ability descriptions from a creature's HTML chunk
 */
function extractAbilities(chunk, abilityNames) {
    const descriptions = {};

    for (const abilityName of abilityNames) {
        // Check if it's a generic ability first
        if (GENERIC_ABILITIES[abilityName]) {
            descriptions[abilityName] = GENERIC_ABILITIES[abilityName];
            continue;
        }

        // Clean the ability name (remove "Trigger" suffix from CSV artifacts)
        const cleanName = abilityName.replace(/\s+Trigger$/, '').trim();
        const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Try multiple patterns to find the ability
        const patterns = [
            // Pattern 1: <strong>Name</strong> — stop at <hr or </div> (allow nested <strong> for Trigger/Effect)
            new RegExp('<strong>(?:<a[^>]*>)?' + escapedName + '(?:</a>)?</strong>\\s*(.+?)(?=<hr|</div>)', 's'),
            // Pattern 2: **Name followed by content (markdown-style in HTML)
            new RegExp('\\*\\*' + escapedName + '\\s+(.+?)(?=<hr|</div>)', 's'),
            // Pattern 3: Plain text (no tags) — ability name followed by description (for abilities without <strong>)
            new RegExp('[>\\s]' + escapedName + '\\s+(.+?)(?=<hr|</div>|</p>)', 's'),
            // Pattern 4: line break then ability name (Fed by Water style)
            new RegExp('<br>\\s*' + escapedName + '\\s+(.+?)(?=<hr|</div>|</p>)', 's')
        ];

        let matched = false;
        for (const pattern of patterns) {
            const match = pattern.exec(chunk);
            if (match) {
                let desc = stripHtml(match[1]).trim();
                if (desc) {
                    descriptions[abilityName] = desc;
                    matched = true;
                    break;
                }
            }
        }
    }

    return descriptions;
}

/**
 * Extract full description from a creature's top-level entry in the HTML
 * The description appears in the first <p> after the creature's top header
 */
function extractDescription(creatureName) {
    const escapedName = creatureName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Find the top header (has empty align-right div, unlike the stat block header which has "Creature N")
    const pattern = new RegExp(escapedName + '</a></div><div class="align-right"></div></div></h1>.*?400px;[^>]*><p>(.*?)</p>', 's');
    const match = pattern.exec(html);
    if (!match) return '';
    return stripHtml(match[1]).trim();
}

/**
 * Extract skills string from a creature's HTML chunk
 */
function extractSkills(chunk) {
    const match = chunk.match(/<strong>Skills<\/strong>\s*(.*?)(?:<\/p>)/s);
    if (!match) return '';
    return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// Process each elemental
let totalAbilities = 0;
let matchedAbilities = 0;
let missingAbilities = [];
let skillsFound = 0;

for (const elemental of data.elementals) {
    const chunk = getCreatureChunk(elemental.url);
    if (!chunk) {
        console.warn(`Could not find HTML chunk for: ${elemental.name}`);
        const abilities = elemental.versions.normal.abilities;
        if (abilities && abilities.length > 0) {
            missingAbilities.push(...abilities.map(a => `${elemental.name}: ${a}`));
            totalAbilities += abilities.length;
        }
        continue;
    }

    // Extract full description
    const fullDesc = extractDescription(elemental.name);
    if (fullDesc) {
        elemental.versions.normal.summary = fullDesc;
        if (elemental.versions.weak) elemental.versions.weak.summary = fullDesc;
        if (elemental.versions.elite) elemental.versions.elite.summary = fullDesc;
    }

    // Extract skills
    const skills = extractSkills(chunk);
    if (skills) {
        elemental.versions.normal.skills = skills;
        if (elemental.versions.weak) elemental.versions.weak.skills = skills;
        if (elemental.versions.elite) elemental.versions.elite.skills = skills;
        skillsFound++;
    }

    // Extract ability descriptions
    const abilities = elemental.versions.normal.abilities;
    if (!abilities || abilities.length === 0) continue;

    totalAbilities += abilities.length;

    const descriptions = extractAbilities(chunk, abilities);

    // Store descriptions in the data
    elemental.versions.normal.ability_descriptions = descriptions;
    if (elemental.versions.weak) elemental.versions.weak.ability_descriptions = descriptions;
    if (elemental.versions.elite) elemental.versions.elite.ability_descriptions = descriptions;

    matchedAbilities += Object.keys(descriptions).length;

    const unmatched = abilities.filter(a => !descriptions[a]);
    if (unmatched.length > 0) {
        missingAbilities.push(...unmatched.map(a => `${elemental.name}: ${a}`));
    }
}

// Save updated data
fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\nResults:`);
console.log(`  Skills found: ${skillsFound} / ${data.elementals.length}`);
console.log(`  Total abilities: ${totalAbilities}`);
console.log(`  Matched: ${matchedAbilities}`);
console.log(`  Missing: ${totalAbilities - matchedAbilities}`);
if (missingAbilities.length > 0) {
    console.log(`\nUnmatched abilities:`);
    missingAbilities.forEach(m => console.log(`  - ${m}`));
}

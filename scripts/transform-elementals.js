/**
 * Transform flat elementals.json into the structured format matching animals-data.json
 * Run once: node scripts/transform-elementals.js
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'Extras', 'elemental_with_creature_ability.json');
const OUTPUT = path.join(__dirname, '..', 'Extras', 'elementals-data.json');

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));

/**
 * Generate a URL-safe slug from a creature name
 */
function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
}

/**
 * Parse a speed string like "30 feet, fly 60 feet, swim 50 feet; earth glide"
 * into { land: 30, fly: 60, swim: 50 }
 */
function parseSpeed(speedStr) {
    if (!speedStr) return {};
    const speed = {};
    // Take only the part before semicolons (discard ability text)
    const movementPart = speedStr.split(';')[0].trim();
    const segments = movementPart.split(',').map(s => s.trim());

    for (const seg of segments) {
        const numMatch = seg.match(/(\d+)\s*feet/);
        if (!numMatch) continue;
        const value = parseInt(numMatch[1], 10);

        if (/\bfly\b/i.test(seg)) {
            speed.fly = value;
        } else if (/\bswim\b/i.test(seg)) {
            speed.swim = value;
        } else if (/\bclimb\b/i.test(seg)) {
            speed.climb = value;
        } else if (/\bburrow\b/i.test(seg)) {
            speed.burrow = value;
        } else {
            // Bare number like "30 feet" = land speed
            speed.land = value;
        }
    }
    return speed;
}

/**
 * Split a comma-separated string into an array, filtering empties
 */
function splitField(str) {
    if (!str || !str.trim()) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Clean source field - strip markdown links and \r\n
 */
function cleanSource(src) {
    if (!src) return '';
    return src
        .replace(/\r\n/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * PF2e Weak/Elite HP adjustment table by creature level
 * Source: Pathfinder 2e Game Mastery Guide
 */
const HP_ADJUST = {
    '-1': { weak: -2, elite: 20 },
    '0':  { weak: -2, elite: 20 },
    '1':  { weak: -3, elite: 24 },
    '2':  { weak: -4, elite: 27 },
    '3':  { weak: -4, elite: 28 },
    '4':  { weak: -6, elite: 32 },
    '5':  { weak: -8, elite: 34 },
    '6':  { weak: -12, elite: 44 },
    '7':  { weak: -12, elite: 43 },
    '8':  { weak: -17, elite: 54 },
    '9':  { weak: -17, elite: 54 },
    '10': { weak: -21, elite: 62 },
    '11': { weak: -21, elite: 62 },
    '12': { weak: -25, elite: 70 },
    '13': { weak: -25, elite: 69 },
    '14': { weak: -28, elite: 75 },
    '15': { weak: -32, elite: 84 },
    '16': { weak: -37, elite: 94 },
    '17': { weak: -34, elite: 88 },
    '18': { weak: -34, elite: 88 },
    '19': { weak: -40, elite: 100 },
    '20': { weak: -45, elite: 110 },
    '21': { weak: -50, elite: 120 },
    '22': { weak: -55, elite: 130 },
    '23': { weak: -60, elite: 140 },
    '24': { weak: -65, elite: 150 },
    '25': { weak: -70, elite: 160 }
};

/**
 * Create a weak or elite version of a creature
 * PF2e adjustments: level +/-1, AC +/-2, saves +/-2, perception +/-2,
 * attack bonuses +/-2, HP adjusted by level-based table
 */
function createAdjustedVersion(normal, type) {
    const mod = type === 'weak' ? -1 : 1;
    const statMod = mod * 2;
    const levelStr = String(normal.level);
    const hpAdj = HP_ADJUST[levelStr] || { weak: -10, elite: 40 };
    const hpMod = type === 'weak' ? hpAdj.weak : hpAdj.elite;

    return {
        ...normal,
        version: type,
        level: normal.level + mod,
        hp: Math.max(1, normal.hp + hpMod),
        ac: normal.ac + statMod,
        saves: {
            fortitude: normal.saves.fortitude + statMod,
            reflex: normal.saves.reflex + statMod,
            will: normal.saves.will + statMod
        },
        perception: normal.perception + statMod,
        attack_bonuses: normal.attack_bonuses.map(b => b + statMod),
        spell_attack_bonus: normal.spell_attack_bonus ? normal.spell_attack_bonus + statMod : null
    };
}

// Build trait index
const traitIndex = {};
const elementals = [];

for (const creature of raw) {
    const id = slugify(creature.name);
    const baseLevel = parseInt(creature.level, 10) || 0;
    const traits = splitField(creature.trait);

    // Add to trait index
    for (const trait of traits) {
        if (!traitIndex[trait]) traitIndex[trait] = [];
        traitIndex[trait].push(id);
    }

    const normal = {
        id: id,
        name: creature.name,
        creature_family: creature.creature_family || '',
        source: cleanSource(creature.source),
        rarity: creature.rarity || 'Common',
        size: creature.size || 'Medium',
        traits: traits,
        level: baseLevel,
        hp: parseInt(creature.hp, 10) || 0,
        ac: parseInt(creature.ac, 10) || 0,
        saves: {
            fortitude: parseInt(creature.fortitude, 10) || 0,
            reflex: parseInt(creature.reflex, 10) || 0,
            will: parseInt(creature.will, 10) || 0
        },
        perception: parseInt(creature.perception, 10) || 0,
        senses: splitField(creature.sense),
        speed: parseSpeed(creature.speed),
        url: creature.url || '',
        attack_bonuses: creature.attack_bonus
            ? creature.attack_bonus.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
            : [],
        spell: splitField(creature.spell),
        spell_attack_bonus: creature.spell_attack_bonus ? parseInt(creature.spell_attack_bonus, 10) || null : null,
        summary: (creature.summary || '').trim(),
        weaknesses: splitField(creature.weakness),
        resistances: splitField(creature.resistance),
        immunities: splitField(creature.immunity),
        abilities: splitField(creature.creature_ability || creature.actions),
        version: 'normal'
    };

    const weak = createAdjustedVersion(normal, 'weak');
    const elite = createAdjustedVersion(normal, 'elite');

    elementals.push({
        id: id,
        name: creature.name,
        baseLevel: baseLevel,
        creature_family: creature.creature_family || '',
        source: cleanSource(creature.source),
        url: creature.url || '',
        versions: {
            normal: normal,
            weak: weak,
            elite: elite
        }
    });
}

const output = {
    metadata: {
        generated: new Date().toISOString(),
        source: 'elementals.json',
        elemental_count: elementals.length,
        total_creatures_scanned: raw.length
    },
    trait_index: traitIndex,
    elementals: elementals
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Transformed ${elementals.length} elementals -> ${OUTPUT}`);

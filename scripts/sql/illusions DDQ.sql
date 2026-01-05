-- Create the 3 tables in your existing DB
DROP TABLE IF EXISTS `spell_categories`;
DROP TABLE IF EXISTS `spells`;
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(255) NOT NULL,
  `display_order` INT(11) DEFAULT NULL,
  `category_description` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `spells`;
CREATE TABLE `spells` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `spell_name` VARCHAR(255) NOT NULL,
  `archive_URL` VARCHAR(500) DEFAULT NULL,
  `rank` INT(11) NOT NULL,
  `traits` TEXT DEFAULT NULL,
  `actions`	VARCHAR(512),
  `rarity` VARCHAR(100) DEFAULT NULL,
  `spell_target`	VARCHAR(512),
  `spell_range` VARCHAR(100) DEFAULT NULL,
  `area` VARCHAR(100) DEFAULT NULL,
  `duration` VARCHAR(255) DEFAULT NULL,
  `defense`	VARCHAR(512),
  `heighten` VARCHAR(255) DEFAULT NULL,
  `summary` TEXT DEFAULT NULL,
  `spoilers`	VARCHAR(512),
  `source` VARCHAR(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `spell_categories`;
CREATE TABLE `spell_categories` (
  `spell_id` INT(11) NOT NULL,
  `category_id` INT(11) NOT NULL,
  PRIMARY KEY (`spell_id`, `category_id`),
  FOREIGN KEY (`spell_id`) REFERENCES `spells`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `categories` (`id`, `category_name`, `display_order`) VALUES 
(1, 'Subtle Spells', 1), 
(2, 'Damage Spells', 2), 
(3, 'Long Range Spells', 3),
(4, 'AoE Spells', 4), 
(5, 'Short Duration Spells', 5), 
(6, 'Long Duration Spells', 6),
(7, 'Disappearance', 7), 
(8, 'Disguise', 8), 
(9, 'Tactics', 9),
(10, 'Terrorism & Sensory Assault', 10), 
(11, 'No Defense (Offensive)', 11),
(12, 'Projection & Objects', 12), 
(13, 'Fucking Mayhem', 13), 
(14, 'Weird Shit', 14)
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);


INSERT INTO `spells` (`spell_name`, `id`, `archive_URL`, `rank`, `heighten`, `traits`, `actions`, `spell_target`, `spell_range`, `area`, `duration`, `defense`, `rarity`, `summary`, `spoilers`, `source`) VALUES 
('Aura of the Unremarkable', 1, 'https://2e.aonprd.com/Spells.aspx?ID=847', 6, '', 'Illusion, Mental, Uncommon', 'Two Actions', '', '', '30-foot emanation', 'sustained up to 1 minute', '', 'Uncommon', 'You and allies in the area appear to be completely innocuous to other creatures within the spell''s area, regardless of the actions you''re committing.', 'Fists of the Ruby Phoenix', 'Pathfinder #166: Despair on Danger Island pg. 77'),
('Befitting Attire', 2, 'https://2e.aonprd.com/Spells.aspx?ID=867', 2, '4th, 5th', 'Illusion, Visual', 'Two Actions', '5 willing creatures', '30 feet', '', '1 hour', '', 'Common', 'Make clothes fit the occasion.', '', 'Secrets of Magic pg. 90 2.0'),
('Blanket of Stars', 3, 'https://2e.aonprd.com/Spells.aspx?ID=1967', 6, '', 'Concentrate, Illusion, Manipulate', 'Two Actions', '', '', '', '10 minutes', 'Will', 'Common', 'A cloak of darkness hides you in the dark.', '', 'Player Core 2 pg. 241 1.1'),
('Blind Eye', 4, 'https://2e.aonprd.com/Spells.aspx?ID=1213', 5, '', 'Illusion, Uncommon', '1 minute', '1 object', 'touch', '', 'until the next time you make your daily preparations', '', 'Uncommon', 'You enchant a single object, preventing it from being used for magical observation.', 'Blood Lords', 'Pathfinder #182: Graveclaw pg. 78'),
('Blur', 5, 'https://2e.aonprd.com/Spells.aspx?ID=28', 2, '', 'Concentrate, Illusion, Manipulate, Visual', 'Two Actions', '1 creature', 'touch', '', '1 minute', '', 'Common', 'Target''s form becomes blurry and hard to hit.', '', 'Player Core pg. 318 2.0'),
('Boots on the Ground', 6, 'https://2e.aonprd.com/Spells.aspx?ID=2495', 6, '8th', 'Auditory, Concentrate, Illusion, Manipulate, Visual', 'Three Actions', '', '100 feet', '', 'until you next make your next daily preparations', 'Will', 'Common', 'You craft the illusion of your army being much bigger than it actually is, hoping to overwhelm the opposing forces and shatter their hopes.', '', 'Battlecry! pg. 84'),
('Bullhorn', 7, 'https://2e.aonprd.com/Spells.aspx?ID=1971', 0, '5th, 7th', 'Auditory, Cantrip, Concentrate, Illusion, Manipulate', 'Two Actions', '', '', '', '10 minutes', '', 'Common', 'Magnify your voice to be heard at a distance.', '', 'Player Core 2 pg. 241 1.1'),
('Burglar''s Blind', 8, 'https://2e.aonprd.com/Spells.aspx?ID=2336', 3, '5th', 'Illusion, Manipulate, Rare, Subtle', 'Two Actions', '1 willing creature', '60 feet', '', 'sustained up to 10 minutes', '', 'Rare', 'The only thing thieves love more than being silent and stealthy is the piles of gold they win with that silence and stealth.', '', 'NPC Core pg. 26'),
('Chromatic Image', 9, 'https://2e.aonprd.com/Spells.aspx?ID=882', 6, '', 'Illusion, Visual', 'Two Actions', '', '', '', '1 minute', '', 'Common', 'Colorful mirror images damage foes who destroy them.', '', 'Secrets of Magic pg. 95 2.0'),
('Disguise Magic', 10, 'https://2e.aonprd.com/Spells.aspx?ID=1491', 1, '2nd', 'Concentrate, Illusion, Manipulate', '1 minute', '1 item or spell effect', '30 feet', '', 'until your next daily preparations', '', 'Common', 'Mask the aura of a spell or item.', '', 'Player Core pg. 324 2.0'),
('Distracting Chatter', 11, 'https://2e.aonprd.com/Spells.aspx?ID=895', 3, '7th', 'Auditory, Illusion', 'Two Actions', '1 creature', '30 feet', '', 'varies', 'Will', 'Common', 'Distract a creature with auditory illusions.', '', 'Secrets of Magic pg. 100 2.0'),
('Dizzying Colors', 12, 'https://2e.aonprd.com/Spells.aspx?ID=1500', 1, '', 'Concentrate, Illusion, Incapacitation, Manipulate, Visual', 'Two Actions', '', '', '15-foot cone', '1 or more rounds (see below)', 'Will', 'Common', 'Swirling colors blind, dazzle, or stun creatures.', '', 'Player Core pg. 326 2.0'),
('Embed Message', 13, 'https://2e.aonprd.com/Spells.aspx?ID=937', 2, '4th, 6th', 'Concentrate, Illusion, Manipulate', 'Two Actions', '1 object or willing creature', 'touch', '', 'unlimited', '', 'Common', 'Leave an illusory message to be triggered at a later date.', '', 'Player Core pg. 328 2.0'),
('Empty Pack', 14, 'https://2e.aonprd.com/Spells.aspx?ID=1151', 2, '4th', 'Illusion', 'Two Actions', '1 container of 2 Bulk or less', 'touch', '', '1 hour', '', 'Common', 'Make objects inside a container invisible', '', 'Dark Archive pg. 105'),
('Exchange Image', 15, 'https://2e.aonprd.com/Spells.aspx?ID=549', 1, '', 'Illusion, Uncommon, Visual', 'Two Actions', 'you and 1 other humanoid', 'touch', '', 'varies', 'Will', 'Uncommon', 'Trade appearances with the target.', 'Age of Ashes', 'Pathfinder #147: Tomorrow Must Burn pg. 73'),
('Fallen Soldier''s Lament', 16, 'https://2e.aonprd.com/Spells.aspx?ID=2503', 4, '6th', 'Concentrate, Illusion, Manipulate, Mental, Rare, Visual', 'Two Actions', '1 corpse of a Medium or smaller creature that has died within the past 8 hours', '100 feet', '', 'sustained up to 1 minute', 'Will', 'Rare', 'You raise an illusion in the space of a fallen foe, crafting it to resemble a ghost of your target before parading it across the battlefield.', '', 'Battlecry! pg. 86'),
('False Nature', 17, 'https://2e.aonprd.com/Spells.aspx?ID=1148', 4, '', 'Illusion, Uncommon', 'Three Actions', 'one unattended item or one item you''re holding', 'touch', '', 'until your next daily preparations', '', 'Uncommon', 'Rewrite perception and memory to make one object appear to be another', '', 'Dark Archive pg. 93'),
('False Vision', 18, 'https://2e.aonprd.com/Spells.aspx?ID=90', 5, '', 'Concentrate, Illusion, Manipulate, Uncommon', '10 minutes', '', 'touch', '100-foot burst', 'until your next daily preparations', '', 'Uncommon', 'Trick a scrying spell.', '', 'Player Core pg. 330 2.0'),
('Falsify Heat', 19, 'https://2e.aonprd.com/Spells.aspx?ID=1353', 2, '4th', 'Concentrate, Fire, Illusion, Manipulate', 'Two Actions', '1 willing creature or object', '60 feet', '', '8 hours', '', 'Common', 'Make a creature''s body heat seem different.', '', 'Rage of Elements pg. 119 2.0'),
('Figment', 20, 'https://2e.aonprd.com/Spells.aspx?ID=1528', 0, '', 'Cantrip, Concentrate, Illusion, Manipulate, Subtle', 'Two Actions', '', '30 feet', '', 'sustained', '', 'Common', 'Create a simple auditory or visual illusion.', '', 'Player Core pg. 331 2.0'),
('Flashy Disappearance', 21, 'https://2e.aonprd.com/Spells.aspx?ID=1285', 1, '', 'Illusion, Uncommon', 'Two Actions', '', '', '', '', '', 'Uncommon', 'You create a puff of colorful smoke that quickly disperses while you become temporarily invisible.', '', 'Firebrands pg. 89 2.0'),
('Hallucination', 22, 'https://2e.aonprd.com/Spells.aspx?ID=1551', 5, '6th, 8th', 'Illusion, Incapacitation, Manipulate, Mental, Subtle', 'Two Actions', '1 creature', '30 feet', '', '1 hour', '', 'Common', 'Cause a creature to believe one thing is another, to notice something that isn''t there, or to be unable to detect something.', '', 'Player Core pg. 334 2.0'),
('Hypnotize', 23, 'https://2e.aonprd.com/Spells.aspx?ID=1564', 3, '', 'Illusion, Manipulate, Subtle, Visual', 'Two Actions', '', '120 feet', '10-foot burst', 'sustained up to 1 minute', 'Will', 'Common', 'Shifting colors dazzle and fascinate creatures.', '', 'Player Core pg. 336 2.0'),
('Illusory Creature', 24, 'https://2e.aonprd.com/Spells.aspx?ID=1567', 2, '1', 'Auditory, Concentrate, Illusion, Manipulate, Olfactory, Visual', 'Two Actions', '', '500 feet', '', 'sustained', '', 'Common', 'Form a convincing illusion of a creature.', '', 'Player Core pg. 336 2.0'),
('Illusory Disguise', 25, 'https://2e.aonprd.com/Spells.aspx?ID=1568', 1, '3rd, 4th, 7th', 'Concentrate, Illusion, Manipulate, Visual', 'Two Actions', '1 willing creature', '30 feet', '', '1 hour', '', 'Common', 'Make yourself look like a different creature.', '', 'Player Core pg. 337 2.0'),
('Illusory Object', 26, 'https://2e.aonprd.com/Spells.aspx?ID=1569', 1, '2nd, 5th', 'Concentrate, Illusion, Manipulate, Visual', 'Two Actions', '', '500 feet', '20-foot burst', '10 minutes', '', 'Common', 'Form a convincing illusion of an object.', '', 'Player Core pg. 337 2.0'),
('Illusory Scene', 27, 'https://2e.aonprd.com/Spells.aspx?ID=1570', 5, '6th, 8th', 'Auditory, Concentrate, Illusion, Manipulate, Olfactory, Visual', '10 minutes', '', '500 feet', '30-foot burst', '1 hour', '', 'Common', 'Create an imaginary scene containing multiple creatures and objects.', '', 'Player Core pg. 337 2.0'),
('Illusory Shroud', 28, 'https://2e.aonprd.com/Spells.aspx?ID=1287', 2, '', 'Illusion, Uncommon, Visual', 'Two Actions', '1 willing creature', 'touch', '', '1 minute', '', 'Uncommon', 'You shroud the target in subtle illusions that make it difficult to detect.', '', 'Firebrands pg. 89 2.0'),
('Instant Minefield', 29, 'https://2e.aonprd.com/Spells.aspx?ID=2509', 5, '1', 'Fire, Illusion, Manipulate, Subtle', 'Three Actions', '', '100 feet', '', '10 minutes', '', 'Common', 'You create several hidden mines throughout the area that explode when stepped on.', '', 'Battlecry! pg. 88'),
('Instant Parade', 30, 'https://2e.aonprd.com/Spells.aspx?ID=1288', 3, '', 'Auditory, Aura, Illusion, Uncommon, Visual', 'Two Actions', '', '', '10-foot emanation', '10 minutes', '', 'Uncommon', 'An illusory parade with dozens of participants and performers appears around you, following you as you move.', '', 'Firebrands pg. 89 2.0'),
('Invisibility', 31, 'https://2e.aonprd.com/Spells.aspx?ID=164', 2, '4th', 'Illusion, Manipulate, Subtle', 'Two Actions', '1 creature', 'touch', '', '10 minutes', '', 'Common', 'A creature can''t be seen until it attacks.', '', 'Player Core pg. 339 2.0'),
('Invisibility Curtain', 32, 'https://2e.aonprd.com/Spells.aspx?ID=936', 4, '7th', 'Illusion', 'Three Actions', '', '120 feet', '', 'sustained', '', 'Common', 'Wall makes creatures on one side invisible to the other side.', '', 'Secrets of Magic pg. 112 2.0'),
('Invisible Item', 33, 'https://2e.aonprd.com/Spells.aspx?ID=700', 1, '3rd, 7th', 'Concentrate, Illusion, Manipulate', 'Two Actions', '1 object', 'touch', '', '1 hour', '', 'Common', 'Make an item disappear.', '', 'Player Core 2 pg. 247 1.1'),
('Item Facade', 34, 'https://2e.aonprd.com/Spells.aspx?ID=166', 1, '2nd, 3rd', 'Concentrate, Illusion, Manipulate, Visual', 'Two Actions', '1 object no more than 10 feet by 10 feet by 10 feet', 'touch', '', '1 hour', '', 'Common', 'Disguise an item to look perfect or shoddy.', '', 'Player Core pg. 340 2.0'),
('Mask of Terror', 35, 'https://2e.aonprd.com/Spells.aspx?ID=1595', 7, '8th', 'Concentrate, Emotion, Fear, Illusion, Manipulate, Mental, Visual', 'Two Actions', '1 creature', '30 feet', '', '1 minute', '', 'Common', 'A creature''s fearsome illusory appearance frightens observers.', '', 'Player Core pg. 342 2.0'),
('Message', 36, 'https://2e.aonprd.com/Spells.aspx?ID=1598', 0, '3rd', 'Auditory, Cantrip, Concentrate, Illusion, Linguistic, Mental, Subtle', 'Single Action', '1 creature', '120 feet', '', 'see below', '', 'Common', 'Speak a message to a distant creature, who can reply.', '', 'Player Core pg. 343 2.0'),
('Mirage', 37, 'https://2e.aonprd.com/Spells.aspx?ID=1604', 4, '5th', 'Concentrate, Illusion, Manipulate, Uncommon', '10 minutes', '', '500 feet', '50-foot burst', 'until your next daily preparations', '', 'Uncommon', 'Disguise one natural environment as another.', '', 'Player Core pg. 344 2.0'),
('Mirror Image', 38, 'https://2e.aonprd.com/Spells.aspx?ID=197', 2, '', 'Illusion, Visual', 'Two Actions', '', '', '', '1 minute', '', 'Common', 'Illusory duplicates of you cause attacks to miss.', '', 'Core Rulebook pg. 352 4.0'),
('Mirror Malefactors', 39, 'https://2e.aonprd.com/Spells.aspx?ID=950', 5, '1', 'Illusion, Mental, Visual', 'Two Actions', '1 creature', '30 feet', '', 'sustained up to 1 minute', 'basic Will', 'Common', 'Mirrors surround a target, and the reflections attack them repeatedly.', '', 'Secrets of Magic pg. 116 2.0'),
('Mirror''s Misfortune', 40, 'https://2e.aonprd.com/Spells.aspx?ID=951', 4, '', 'Illusion', 'Two Actions', '', '', '', '1 minute', '', 'Common', 'Split into two copies. Destroying the fake curses the attacker.', '', 'Secrets of Magic pg. 117 2.0'),
('Misdirection', 41, 'https://2e.aonprd.com/Spells.aspx?ID=198', 2, '', 'Illusion', '1 minute', '2 creatures or objects', '30 feet', '', 'until the next time you make your daily preparations', '', 'Common', 'Cause one creature''s auras to appear to be another''s.', '', 'Core Rulebook pg. 352 4.0'),
('Mislead', 42, 'https://2e.aonprd.com/Spells.aspx?ID=1605', 6, '', 'Concentrate, Illusion, Manipulate', 'Two Actions', '', '', '', 'sustained up to 1 minute', '', 'Common', 'Turn invisible and create a duplicate of yourself who acts like you.', '', 'Player Core pg. 344 2.0'),
('Musical Accompaniment', 43, 'https://2e.aonprd.com/Spells.aspx?ID=1289', 0, '2nd', 'Auditory, Cantrip, Illusion', 'Two Actions', '', '', '', '1 minute', '', 'Common', 'You''re surrounded by orchestral music that shifts and changes to match your behavior.', '', 'Firebrands pg. 90 2.0'),
('Nightmare', 44, 'https://2e.aonprd.com/Monsters.aspx?ID=3105', 4, '', 'Concentrate, Illusion, Manipulate, Mental', '10 minutes', '1 creature you know by name', 'planetary', '', '1 day', 'Will', 'Common', 'Plague a creature''s dreams with disturbing nightmares.', '', 'Player Core pg. 346 2.0'),
('Ocular Overload', 45, 'https://2e.aonprd.com/Spells.aspx?ID=959', 4, '', 'Contingency, Illusion, Incapacitation, Visual', '10 minutes', '', '', '', '24 hours', '', 'Common', 'Set a contingency to interfere with the vision of a creature attacking you.', '', 'Secrets of Magic pg. 118 2.0'),
('Oneiric Mire', 46, 'https://2e.aonprd.com/Spells.aspx?ID=961', 3, '', 'Illusion, Mental, Visual', 'Three Actions', '', '120 feet', '20-foot burst', '1 minute', '', 'Common', 'Create illusory quicksand that tricks creatures into thinking they''re stuck.', '', 'Secrets of Magic pg. 119 2.0'),
('Paranoia', 47, 'https://2e.aonprd.com/Spells.aspx?ID=1623', 2, '6th', 'Concentrate, Illusion, Manipulate, Mental', 'Two Actions', '1 creature', '30 feet', '', '1 minute', 'Will', 'Common', 'Make a creature believe everyone is a threat.', '', 'Player Core pg. 348 2.0'),
('Phantasmal Calamity', 48, 'https://2e.aonprd.com/Spells.aspx?ID=1630', 6, '1', 'Concentrate, Illusion, Manipulate, Mental', 'Two Actions', '', '500 feet', '30-foot burst', '', 'Will', 'Common', 'Create visions of an apocalypse to damage creatures mentally.', '', 'Player Core pg. 349 2.0'),
('Phantasmal Protagonist', 49, 'https://2e.aonprd.com/Spells.aspx?ID=1230', 4, '1', 'Illusion, Mental, Rare', 'Three Actions', '', '30 feet', '', 'sustained up to 1 minute', '', 'Rare', 'You create a phantasmal incarnation of a significant character from a novel, historical work, or religious parable.', 'Kingmaker', 'Kingmaker Companion Guide pg. 46'),
('Phantasmal Treasure', 50, 'https://2e.aonprd.com/Spells.aspx?ID=707', 2, '', 'Concentrate, Emotion, Illusion, Manipulate, Mental', 'Two Actions', '1 living creature', '60 feet', '', 'varies', 'Will', 'Common', 'Tempt a creature with an illusory reward.', '', 'Player Core 2 pg. 249 1.1'),
('Phantom Crowd', 51, 'https://2e.aonprd.com/Spells.aspx?ID=968', 2, '1', 'Illusion, Visual', 'Two Actions', '', '60 feet', 'a 10-foot square', 'sustained up to 10 minutes', '', 'Common', 'Create an illusory crowd that loudly agrees with you.', '', 'Secrets of Magic pg. 121 2.0'),
('Phantom Pain', 52, 'https://2e.aonprd.com/Spells.aspx?ID=1632', 1, '1', 'Concentrate, Illusion, Manipulate, Mental, Nonlethal', 'Two Actions', '1 creature', '30 feet', '', '1 minute', 'Will', 'Common', 'Cause a creature ongoing pain that sickens it.', '', 'Player Core pg. 349 2.0'),
('Phantom Prison', 53, 'https://2e.aonprd.com/Spells.aspx?ID=969', 3, '8th', 'Illusion, Incapacitation, Mental, Visual', 'Three Actions', '1 creature', '50 feet', '', '1 minute', 'Will', 'Common', 'Trap a creature in illusory walls until it disbelieves.', '', 'Secrets of Magic pg. 121 2.0'),
('Portrait of the Artist', 54, 'https://2e.aonprd.com/Spells.aspx?ID=971', 5, '', 'Illusion, Visual', '1 minute', '', '', '', '1 hour', '', 'Common', 'Appear to have the features and skills of a famous artist.', '', 'Secrets of Magic pg. 122 2.0'),
('Project Image', 55, 'https://2e.aonprd.com/Spells.aspx?ID=1640', 7, '2', 'Concentrate, Illusion, Manipulate, Mental', 'Two Actions', '', '30 feet', '', 'sustained up to 1 minute', '', 'Common', 'Make an illusion of yourself you can cast spells through.', '', 'Player Core pg. 351 2.0'),
('Rallying Banner', 56, 'https://2e.aonprd.com/Spells.aspx?ID=1293', 5, '', 'Auditory, Illusion, Uncommon, Visual', 'Two Actions', '1 willing creature', '30 feet', '', '1 minute', '', 'Uncommon', 'You create an illusory banner representing a revolution, social movement, or organization such as the Firebrands.', '', 'Firebrands pg. 90 2.0'),
('Reflected Beauty', 57, 'https://2e.aonprd.com/Spells.aspx?ID=2448', 4, '', 'Concentrate, Illusion, Manipulate, Uncommon, Visual', 'Two Actions', '', '', '', '1 hour', '', 'Uncommon', 'When you cast reflected beauty, choose a willing creature that is the same size as you and that you can see within 30 feet.', 'Curtain Call', 'Pathfinder #205: Singer, Stalker, Skinsaw Man pg. 81'),
('Replicate', 58, 'https://2e.aonprd.com/Feats.aspx?ID=3799', 4, '1', 'Illusion, Shadow', 'Three Actions', '1 willing or unconscious creature of 8th level or lower', '60 feet', '', 'sustained', '', 'Common', 'Create an illusory duplicate of a creature.', '', 'Secrets of Magic pg. 125 2.0'),
('Sculpt Sound', 59, 'https://2e.aonprd.com/Spells.aspx?ID=714', 3, '5th', 'Illusion', 'Two Actions', '1 creature or object', 'touch', '', '10 minutes', '', 'Common', 'Quiet or alter the sound from a creature or object.', '', 'Advanced Player''s Guide pg. 224 2.0'),
('Secret Page', 60, 'https://2e.aonprd.com/Spells.aspx?ID=270', 3, '', 'Illusion, Visual', '1 minute', '1 page up to 3 square feet in size', 'touch', '', 'unlimited', '', 'Common', 'Alter the appearance of a page.', '', 'Core Rulebook pg. 367 4.0'),
('Shadow Raid', 61, 'https://2e.aonprd.com/Spells.aspx?ID=996', 7, '9th', 'Illusion, Shadow', 'Three Actions', '', '120 feet', '30-foot burst', '1 minute', 'basic Reflex or Will (target''s choice)', 'Common', 'A swarm of illusory shadows damages foes in the area and provides concealment.', '', 'Secrets of Magic pg. 129 2.0'),
('Shared Invisibility', 62, 'https://2e.aonprd.com/Spells.aspx?ID=2025', 3, '5th', 'Aura, Illusion, Manipulate, Subtle', 'Two Actions', 'you and up to 5 willing creatures', '', '30-foot emanation', '10 minutes', '', 'Common', 'You and nearby creatures become invisible.', '', 'Player Core 2 pg. 251 1.1'),
('Shock and Awe', 63, 'https://2e.aonprd.com/Spells.aspx?ID=2513', 5, '', 'Auditory, Concentrate, Emotion, Fear, Illusion, Manipulate, Mental, Visual', 'Three Actions', '', '100 feet', '50-foot burst', '1 round', 'Will', 'Common', 'You create the illusion of cannons exploding, bullets and arrows flying, and magical ballistics firing, as an overwhelming torrent of information, both visual and auditory.', '', 'Battlecry! pg. 89'),
('Silence', 64, 'https://2e.aonprd.com/Spells.aspx?ID=1674', 2, '4th', 'Illusion, Manipulate, Subtle', 'Two Actions', '1 willing creature', 'touch', '', '1 minute', '', 'Common', 'Mute all sound from a willing creature.', '', 'Player Core pg. 357 2.0'),
('Strange Geometry', 65, 'https://2e.aonprd.com/Spells.aspx?ID=2032', 5, '', 'Concentrate, Illusion, Manipulate', 'Three Actions', '', '60 feet', '4 cubes, each 10 feet on a side', '1 minute', 'Will', 'Common', 'Confoundingly warp spatial geometry, making passage difficult and destinations unpredictable.', '', 'Player Core 2 pg. 252 1.1'),
('Teeth to Terror', 66, 'https://2e.aonprd.com/Spells.aspx?ID=1210', 2, '2', 'Fear, Illusion, Mental, Uncommon', 'Two Actions', '1 creature with teeth', '30 feet', '', '1 minute', 'Will', 'Uncommon', 'The target believes its teeth are falling out, crawling along its face, stabbing into its body, and cramming themselves down its throat.', 'Blood Lords', 'Pathfinder #181: Zombie Feast pg. 79'),
('Thicket of Knives', 67, 'https://2e.aonprd.com/Spells.aspx?ID=1017', 1, '', 'Illusion, Visual', 'Two Actions', '', '', '', '1 minute', '', 'Common', 'Illusory copies of your weapon arm improve your ability to feint.', '', 'Secrets of Magic pg. 136 2.0'),
('Umbral Extraction', 68, 'https://2e.aonprd.com/Spells.aspx?ID=1022', 2, '', 'Illusion, Mental, Shadow', 'Two Actions', '', '', '', '3 rounds', '', 'Common', 'Attempt to steal a spell slot.', '', 'Secrets of Magic pg. 137 2.0'),
('Umbral Graft', 69, 'https://2e.aonprd.com/Spells.aspx?ID=1023', 4, '', 'Illusion, Shadow', 'Two Actions', '', '', '', '3 rounds', '', 'Common', 'Attempt to steal an active spell.', '', 'Secrets of Magic pg. 137 2.0'),
('Umbral Mindtheft', 70, 'https://2e.aonprd.com/Spells.aspx?ID=1211', 2, '', 'Illusion, Mental, Shadow, Uncommon', 'Two Actions', '', '', '', '3 rounds', '', 'Uncommon', 'You prepare to steal a broad field of knowledge from another creature, siphoning it from their mind and storing it in a pocket of the Shadow Plane connected to your own mind.', 'Blood Lords', 'Pathfinder #181: Zombie Feast pg. 80'),
('Ventriloquism', 71, 'https://2e.aonprd.com/Spells.aspx?ID=356', 1, '2nd', 'Auditory, Concentrate, Illusion, Manipulate', 'Two Actions', '', '', '', '10 minutes', '', 'Common', 'Throw your voice.', '', 'Player Core pg. 366 2.0'),
('Vibrant Pattern', 72, 'https://2e.aonprd.com/Spells.aspx?ID=1741', 6, '', 'Illusion, Incapacitation, Manipulate, Subtle, Visual', 'Two Actions', '', '120 feet', '10-foot burst', 'sustained up to 1 minute', 'Will', 'Common', 'Make a pattern of lights that dazzle and blinds creatures who enter the area.', '', 'Player Core pg. 366 2.0'),
('Vision of Beauty', 73, 'https://2e.aonprd.com/Spells.aspx?ID=1238', 4, '2', 'Emotion, Illusion, Incapacitation, Mental, Rare', 'Two Actions', '1 creature', '60 feet', '', 'varies', 'Will', 'Rare', 'You create a phantasmal image of the most beautiful creature imaginable to the target at a location somewhere within the spell''s range.', 'Kingmaker', 'Kingmaker Companion Guide pg. 103'),
('Visions of Danger', 74, 'https://2e.aonprd.com/Spells.aspx?ID=2040', 7, '1', 'Auditory, Concentrate, Illusion, Manipulate, Visual', 'Three Actions', '', '500 feet', '30-foot burst', '1 minute', 'basic Will', 'Common', 'A vision of a swarm deals mental damage.', '', 'Player Core 2 pg. 254 1.1');

-- Clear old mappings to prevent duplicates (optional)
DELETE FROM `spell_categories`;

-- Category 1: Subtle Spells
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (8,1),(20,1),(22,1),(23,1),(29,1),(31,1),(36,1),(62,1),(64,1),(72,1);
-- Category 2: Damage Spells
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (9,2),(24,2),(29,2),(39,2),(48,2),(49,2),(52,2),(61,2),(66,2),(74,2);
-- Category 3: Long Range Spells
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (23,3),(24,3),(26,3),(27,3),(32,3),(36,3),(37,3),(44,3),(46,3),(48,3),(61,3),(72,3),(74,3);
-- Category 4: AoE Spells
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (1,4),(5,4),(9,4),(16,4),(23,4),(28,4),(35,4),(38,4),(39,4),(40,4),(42,4),(43,4),(46,4),(47,4),(49,4),(52,4),(53,4),(55,4),(56,4),(61,4),(64,4),(65,4),(66,4),(67,4),(68,4),(69,4),(70,4),(72,4),(74,4);
-- Category 5: Short Duration
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (1,5),(5,5),(9,5),(16,5),(23,5),(28,5),(35,5),(38,5),(39,5),(40,5),(42,5),(43,5),(46,5),(47,5),(49,5),(50,5),(52,5),(53,5),(55,5),(56,5),(61,5),(64,5),(65,5),(66,5),(67,5),(68,5),(69,5),(70,5),(72,5),(74,5);
-- Category 6: Long Duration
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (2,6),(7,6),(10,6),(13,6),(14,6),(17,6),(18,6),(19,6),(20,6),(25,6),(26,6),(29,6),(33,6),(34,6),(37,6),(41,6),(44,6),(60,6);
-- Category 7: Disappearance
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (8,7),(21,7),(28,7),(31,7),(32,7),(33,7),(42,7),(62,7),(64,7);
-- Category 8: Disguise
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (2,8),(10,8),(15,8),(17,8),(25,8),(34,8),(57,8),(73,8);
-- Category 9: Tactics
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (5,9),(6,9),(8,9),(9,9),(11,9),(23,9),(28,9),(29,9),(30,9),(32,9),(38,9),(39,9),(42,9),(46,9),(47,9),(49,9),(52,9),(53,9),(56,9),(58,9),(61,9),(62,9),(63,9),(65,9),(68,9),(69,9),(74,9);
-- Category 10: Terrorism & Sensory Assault
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (11,10),(12,10),(22,10),(23,10),(35,10),(40,10),(44,10),(45,10),(47,10),(50,10),(52,10),(61,10),(63,10),(66,10),(72,10),(73,10),(74,10);
-- Category 11: No Defense (Offensive)
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (9,11),(24,11),(29,11),(64,11);
-- Category 12: Projection & Objects
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (9,12),(20,12),(24,12),(26,12),(27,12),(29,12),(30,12),(37,12),(38,12),(39,12),(49,12),(50,12),(53,12),(54,12),(55,12),(58,12),(66,12);
-- Category 13: Fucking Mayhem
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (12,13),(22,13),(29,13),(30,13),(37,13),(39,13),(45,13),(46,13),(48,13),(53,13),(55,13),(61,13),(63,13),(65,13),(66,13),(68,13),(70,13),(72,13),(74,13);
-- Category 14: Weird Shit
INSERT INTO `spell_categories` (`spell_id`, `category_id`) VALUES (13,14),(15,14),(35,14),(43,14),(50,14),(54,14),(60,14),(65,14),(68,14),(69,14),(70,14);

-- Category Metadata Updates
UPDATE `categories` SET `category_description` = 'Spells that are difficult to notice being cast or those that leave no obvious magical signature. Used for social engineering or sneaking where the act of casting itself must remain hidden.', `display_order` = 1 WHERE `category_name` = 'Subtle Spells';
UPDATE `categories` SET `category_description` = 'Illusions that have a physical or mental bite. These deal damage (Mental, Shadow, or otherwise) and are used as direct offensive tools.', `display_order` = 2 WHERE `category_name` = 'Damage Spells';
UPDATE `categories` SET `category_description` = 'Spells that can be cast from a significant distance (generally 120ft or more), allowing the caster to influence a battlefield or a social situation from a position of safety.', `display_order` = 3 WHERE `category_name` = 'Long Range Spells';
UPDATE `categories` SET `category_description` = 'Area of Effect illusions. These affect multiple targets or a large swath of terrain simultaneously, such as bursts, cones, or emanations.', `display_order` = 4 WHERE `category_name` = 'AoE Spells';
UPDATE `categories` SET `category_description` = 'Spells that last 1 minute or less. These are "combat-time" illusions meant for immediate tactical impact rather than long-term deception.', `display_order` = 5 WHERE `category_name` = 'Short Duration Spells';
UPDATE `categories` SET `category_description` = 'Spells that last 10 minutes, 1 hour, or until the next daily preparation. These are meant for infiltration, long-term masking, or "setting the stage."', `display_order` = 6 WHERE `category_name` = 'Long Duration Spells';
UPDATE `categories` SET `category_description` = 'The art of being elsewhere. Includes invisibility, vanishing acts, and spells that erase the presence of a creature or object from sight.', `display_order` = 7 WHERE `category_name` = 'Disappearance';
UPDATE `categories` SET `category_description` = 'Spells that change a creature''s or object''s appearance into something else. Used for impersonation or hiding the true nature of an item.', `display_order` = 8 WHERE `category_name` = 'Disguise';
UPDATE `categories` SET `category_description` = 'Illusions that provide a specific mechanical advantage on the battlefield, such as concealment, flanking opportunities, or redirecting attacks (e.g., Mirror Image).', `display_order` = 9 WHERE `category_name` = 'Tactics';
UPDATE `categories` SET `category_description` = 'Spells designed to overwhelm the senses or strike fear into the heart. These involve loud noises, flashing lights, or terrifying phantasms that cause status effects like Frightened or Dazzled.', `display_order` = 10 WHERE `category_name` = 'Terrorism & Sensory Assault';
UPDATE `categories` SET `category_description` = 'Offensive spells that do not allow a traditional save (like a Will save) to negate the primary effect, or spells that target AC/auto-succeed in their utility.', `display_order` = 11 WHERE `category_name` = 'No Defense (Offensive)';
UPDATE `categories` SET `category_description` = 'The creation of external, independent illusions. These are "things" placed in the world—walls, creatures, or items—that exist separate from the caster’s body.', `display_order` = 12 WHERE `category_name` = 'Projection & Objects';
UPDATE `categories` SET `category_description` = 'Spells that create chaos and unpredictability. They break the standard rules of engagement, confuse friend and foe alike, and generally make the battlefield difficult to manage.', `display_order` = 13 WHERE `category_name` = 'Fucking Mayhem';
UPDATE `categories` SET `category_description` = 'Spells that don''t fit into traditional categories. These often involve strange geometry, unique utility, or occult concepts that defy simple classification.', `display_order` = 14 WHERE `category_name` = 'Weird Shit';
CREATE OR REPLACE VIEW view_spell_categorization AS
SELECT 
    c.category_name,
    s.spell_name AS spellName,
    s.rank
FROM categories c
JOIN spell_categories sc ON c.id = sc.category_id
JOIN spells s ON s.id = sc.spell_id
ORDER BY 
    s.rank ASC, 
    s.spell_name ASC;

CREATE OR REPLACE VIEW view_spell_details_by_category AS
SELECT 
    -- ids
    c.id AS categoryId,
    s.id AS id,
    -- names
    c.category_name AS categoryName, -- Aliased to camelCase
    s.spell_name AS spellName,             -- Aliased to camelCase
    -- data fields
    s.archive_URL AS archiveURL,
    s.rank AS rank,
    s.traits AS traits,
    s.actions AS actions,
    s.spell_target AS spellTarget,
    s.spell_range AS spellRange,
    s.area AS area,
    s.duration AS duration,
    s.defense AS defense,
    s.rarity AS rarity,
    s.summary AS summary,
    s.spoilers AS spoilers,
    s.source AS source,
    s.heighten AS heighten,
    c.display_order AS displayOrder
FROM categories c
JOIN spell_categories sc ON c.id = sc.category_id
JOIN spells s ON s.id = sc.spell_id
ORDER BY s.rank ASC, s.spell_name ASC;

CREATE OR REPLACE VIEW view_categories AS
SELECT 
    id AS categoryId, 
    category_name AS categoryName, 
    category_description as categoryDescription
FROM categories;
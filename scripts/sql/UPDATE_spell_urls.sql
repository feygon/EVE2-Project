-- ========================================
-- Update Spell URLs to Corrected Values
-- Run this on production database
-- ========================================

UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=847' WHERE `id` = 1;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1967' WHERE `id` = 3;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1213' WHERE `id` = 4;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2495' WHERE `id` = 6;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2336' WHERE `id` = 8;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=882' WHERE `id` = 9;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=937' WHERE `id` = 13;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2503' WHERE `id` = 16;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1148' WHERE `id` = 17;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1353' WHERE `id` = 19;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1528' WHERE `id` = 20;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1551' WHERE `id` = 22;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2509' WHERE `id` = 29;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=936' WHERE `id` = 32;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1595' WHERE `id` = 35;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1598' WHERE `id` = 36;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1604' WHERE `id` = 37;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=950' WHERE `id` = 39;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=951' WHERE `id` = 40;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=198' WHERE `id` = 41;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1605' WHERE `id` = 42;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Monsters.aspx?ID=3105' WHERE `id` = 44;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=959' WHERE `id` = 45;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1630' WHERE `id` = 48;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1230' WHERE `id` = 49;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=968' WHERE `id` = 51;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=969' WHERE `id` = 53;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1640' WHERE `id` = 55;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1293' WHERE `id` = 56;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2448' WHERE `id` = 57;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Feats.aspx?ID=3799' WHERE `id` = 58;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=714' WHERE `id` = 59;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=996' WHERE `id` = 61;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2025' WHERE `id` = 62;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2513' WHERE `id` = 63;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2032' WHERE `id` = 65;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1210' WHERE `id` = 66;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1211' WHERE `id` = 70;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1741' WHERE `id` = 72;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=1238' WHERE `id` = 73;
UPDATE `spells` SET `archive_URL` = 'https://2e.aonprd.com/Spells.aspx?ID=2040' WHERE `id` = 74;

SELECT 'URLs updated successfully!' AS status;

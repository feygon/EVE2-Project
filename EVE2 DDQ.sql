-- Table Data Definition Queries begin at line 1667. Before that, there are stored procedures.

-- use cs340_nickersr;

DROP PROCEDURE IF EXISTS SP_getItemStructureID;
DROP PROCEDURE IF EXISTS SP_getLocs;
DROP PROCEDURE IF EXISTS SP_getCSid;
DROP PROCEDURE IF EXISTS SP_getParams4CreateCS;
DROP PROCEDURE IF EXISTS SO_getSpaceStationCSid;
DROP PROCEDURE IF EXISTS SP_putPlayerInPod;
DROP PROCEDURE IF EXISTS SP_startingPlayersInPods;



DROP PROCEDURE IF EXISTS SP_CreateItemStructure;
DROP PROCEDURE IF EXISTS SP_CreateLoc;
DROP PROCEDURE IF EXISTS SP_CreateItemUse;
DROP PROCEDURE IF EXISTS SP_CreateLink;
DROP PROCEDURE IF EXISTS SP_CreatePlayer;
DROP PROCEDURE IF EXISTS SP_CreateCargoSpace;
DROP PROCEDURE IF EXISTS SP_CreateObject;
DROP PROCEDURE IF EXISTS SP_startingPlayersInPods;


DELIMITER //

CREATE PROCEDURE SP_getItemStructureID(IN itemname varchar(255))
BEGIN
    SET @itemStructureID = (SELECT id FROM EVE2_ItemStructure
        WHERE name = itemname);
END //

CREATE PROCEDURE SP_getLocs(IN sourceLoc varchar(255),
                            IN linkLoc varchar(255))
BEGIN
    SET @loc1 = (SELECT id FROM EVE2_Locations
        WHERE name = sourceLoc);
    SET @loc2 = (SELECT id from EVE2_Locations
        WHERE name = linkLoc);
END //

CREATE PROCEDURE SP_getCSid(IN playerName varchar(255),
                              IN containerItemName varchar(255))
BEGIN
    SET @playerID = (SELECT id FROM EVE2_Players
        WHERE name = playerName);
    SET @ItemUseID = (SELECT EVE2_CargoSpace.id FROM EVE2_CargoSpace
    	INNER JOIN EVE2_Players ON EVE2_CargoSpace.player_id = EVE2_Players.id
        INNER JOIN EVE2_ItemUse ON EVE2_CargoSpace.itemUse_id = EVE2_ItemUse.id
        INNER JOIN EVE2_ItemStructure ON EVE2_ItemUse. itemStructure_id = EVE2_ItemStructure.id
        WHERE EVE2_ItemStructure.name = containerItemName AND EVE2_Players.name = playerName
        LIMIT 1);
END //

CREATE PROCEDURE SP_getParams4CreateCS(IN playerName varchar(255),
                                  IN containerName varchar(255),
                                  IN locationName varchar(255))
BEGIN
    SET @playerID = (SELECT id FROM EVE2_Players
        WHERE name = playerName);
    SET @ItemUseID = (SELECT EVE2_ItemUse.id FROM EVE2_ItemUse
        INNER JOIN EVE2_ItemStructure ON EVE2_ItemStructure.id = EVE2_ItemUse.itemStructure_id
        WHERE name = containerName);
    SET @loc1 = (SELECT id FROM EVE2_Locations
        WHERE name = locationName);
END //

CREATE PROCEDURE SO_getSpaceStationCSid(IN playerName varchar(255),
                                          containerName varchar(255),
                                          locationName varchar(255))
BEGIN
    SET @stationCSid = (SELECT EVE2_CargoSpace.id FROM EVE2_CargoSpace
    	INNER JOIN EVE2_ItemUse on EVE2_CargoSpace.itemUse_id = EVE2_ItemUse.id
    	INNER JOIN EVE2_ItemStructure on EVE2_ItemStructure.id = EVE2_ItemUse.itemStructure_id
    	INNER JOIN EVE2_Players on EVE2_Players.id = EVE2_CargoSpace.player_id
    	INNER JOIN EVE2_Locations on EVE2_Locations.id = EVE2_CargoSpace.location_id
    	WHERE EVE2_ItemStructure.name = containerName AND
          	  EVE2_Players.name = playerName AND
          	  EVE2_Locations.name = locationName
    	LIMIT 1);
END //

CREATE PROCEDURE SP_putPlayerInPod(IN playerName varchar(255))
BEGIN
	CALL SP_getCSid(playerName, "pod");
    UPDATE EVE2_Players SET EVE2_Players.piloting_CS_id = @ItemUseID
    	WHERE EVE2_Players.name = playerName;
END //

CREATE PROCEDURE SP_CreateItemStructure()
BEGIN
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Nothing", 0, 0, "Nothing");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Aqueous Liquids", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Autotrophs", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Bacteria", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Base Metals", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Biocells", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Biofuels", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Biomass", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Biotech Research Reports", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Broadcast Node", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Camera Drones", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Carbon Compounds", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Chiral Structures", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Complex Organisms", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Condensates", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Construction Blocks", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Consumer Electronics", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Coolant", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Cryoprotectant Solution", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Data Chips", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Electrolytes", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Enriched Uranium", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Felsic Magma", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Fertilizer", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Gel_Matrix Biopaste", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Genetically Enhanced Livestock", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Guidance Systems", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Hazmat Detection Systems", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Heavy Metals", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Hermetic Membranes", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("High_Tech Transmitters", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Industrial Explosives", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Industrial Fibers", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Integrity Response Drones", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Ionic Solutions", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Livestock", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mechanical Parts", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Microfiber Shielding", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Microorganisms", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Miniature Electronics", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Nanites", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Nano_Factory", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Neocoms", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Noble Gas", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Noble Metals", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Non_CS Crystals", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Nuclear Reactors", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Organic Mortar Applicators", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Oxides", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Oxidizing Compound", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Oxygen", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Planetary Vehicles", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Planktic Colonies", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Plasmoids", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Polyaramids", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Polytextiles", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Precious Metals", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Proteins", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Reactive Gas", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Reactive Metals", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Recursive Computing Module", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Robotics", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Rocket Fuel", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Self_Harmonizing Power Core", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Silicate Glass", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Silicon", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Smartfab Units", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Sterile Conduits", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Supercomputers", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Superconductors", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Supertensile Plastics", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Suspended Plasma", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Synthetic Oil", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Synthetic Synapses", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Test Cultures", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Toxic Metals", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Transcranial Microcontrollers", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Transmitter", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Ukomi Superconductors", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Vaccines", 6, 6, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Viral Agent", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Water", 0.38, 0.38, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Water_Cooled CPU", 1.5, 1.5, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Wetware Mainframe", 100, 100, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Rorqual", 1300000, 14500000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Hulk", 3750, 200000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mackinaw", 3750, 150000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Skiff", 3750, 100000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Covetor", 3750, 200000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Retriever", 3750, 150000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Procurer", 3750, 100000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Modulated Strip Miner II", 5, 5, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Strip Miner I", 25, 25, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mercoxit Mining Crystal II", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Ice Mining Laser II", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mining Laser Upgrade II", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Arkonor Mining Crystal II", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Miner II", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Ice Mining Laser I", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Veldspar Mining Crystal II", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mercoxit Mining Crystal I", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Arkonor Mining Crystal I", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Mining Laser Upgrade I", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Nanite Repair Paste", 0.01, 0.01, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Hydrogen Fuel Block", 5, 5, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Oxygen Fuel Block", 5, 5, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Veldspar Mining Crystal I", 10, 10, "Charge");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("500MN Microwarpdrive", 10, 10, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("100MN Afterburner", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("50MN Microwarpdrive", 10, 10, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("10MN Afterburner", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("5MN Microwarpdrive", 10, 10, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("1MN Afterburner", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Miner I", 5, 5, "Module");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Morphite", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Strontium Clathrates", 3, 3, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Hydrogen Isotopes", 0.03, 0.03, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Oxygen Isotopes", 0.03, 0.03, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Megacyte", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Heavy Water", 0.4, 0.4, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Isogen", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Tritanium", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Pyerite", 0.01, 0.01, "Material");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Small Standard Container", 10, 100, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Medium Standard Container", 33, 325, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Large Standard Container", 65, 650, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Small Secure Container", 10, 100, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Medium Secure Container", 33, 325, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Large Secure Container", 65, 650, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Giant Secure Container", 300, 3000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Large Freight Container", 100, 10000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Giant Freight Container", 1200, 120000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Enormous Freight Container", 2500, 250000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Station Container", 10000, 2000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Station Vault Container", 50000, 5000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Station Warehouse Container", 100000, 10000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Astrahus", 8000, 3000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Fortizar", 80000, 10000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Keepstar", 800000, 50000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Infrastructure Hub", 60000, 60000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Athanor", 8000, 3000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Tatara", 80000, 10000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Raitaru", 8000, 3000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Azbel", 80000, 10000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Sotiyo", 800000, 50000000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Territorial Claim Unit", 5000, 5000, "Satellite");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Ibis", 2500, 15000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Bantam", 2500, 20000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Condor", 2500, 18000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Griffin", 2500, 19400, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Heron", 2500, 18900, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Kestrel", 2500, 19700, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Merlin", 2500, 16500, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Blackbird", 10000, 96000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Caracal", 10000, 92000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Osprey", 10000, 107000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Raven", 50000, 486000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Rokh", 50000, 486000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Scorpion", 50000, 468000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Wyvern", 1300000, 53000000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Phoenix", 1300000, 16250000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES ("Leviathan", 10000000, 132500000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES
        ("Epithal", 20000, 200000, "Container"),
        ("Kryos", 20000, 200000, "Container"),
        ("Miasmos", 20000, 200000, "Container"),
        ("Nereus", 20000, 200000, "Container"),
        ("Iteron Mark V", 20000, 200000, "Container");
    INSERT INTO EVE2_ItemStructure (name, vol_packed, vol_unpacked, type) VALUES 
        ("Ore Hold", 0, 0, "Container"),
        ("Mineral Hold", 0, 0, "Container"),
        ("Fleet Hangar", 0, 0, "Container"),
        ("Fuel Bay", 0, 0, "Container"),
        ("Ship Maintenance Bay", 0, 0, "Container"),
        ("Pod", 0, 0, "Container");
END //

-- SP_CreateLoc:      stored procedure to input locations (without links)
CREATE PROCEDURE SP_CreateLoc()
BEGIN
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Jita", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("New Caldari", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Maurasi", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Perimeter", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Niyabainen", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Hirtamon", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("KHM_J1", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Kisogo", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Urlen", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Muvolailen", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Sobaseki", 0.8);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Malkalen", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Alikara", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Josameto", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Otela", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Poinen", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Obanen", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Liekuri", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Ikuchi", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Sakenta", 1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Tunttaras", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Itamo", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Olo", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Osmon", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Korsiki", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Airaken", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Oijanen", 0.4);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Akora", 0.3);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Ikami", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Reisen", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Maila", 0.4);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Purjola", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Hampinen", 0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Hurtoken", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Abagawa", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Saisio", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Jakanerva", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Nomaa", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Geras", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Tuuriainas", 0.6);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Shihuken", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Senda", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Unpas", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Uitra", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Sirppala", 0.9);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Inaro", 0.8);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Sirseshin", 0.7);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Messoya", 0.3);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Tasti", 0.3);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Otosela", 0.2);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Uemon", 0.2);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Paala", 0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("LXQ2_T", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Fuskunen", 0.2);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("Ofage", 0.3);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("8KE_YS", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("ZS_PNI", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("O_LJOO", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("PX_IHN", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("M9_LAN", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("IL_H0A", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("L4X_1V", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("CT8K_0", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("C_4D0W", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("WPV_JN", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("QBZO_R", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("CL_IRS", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("O_EUHA", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("ZZ5X_M", 0);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("MO_I1W", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("FKR_SR", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("C9R_NO", -0.2);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("5U_3PW", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("89JS_J", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("CYB_BZ", -0.3);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("43_1TL", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("TZ_74M", -0.1);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("KMH_J1", -0.5);
    INSERT INTO EVE2_Locations (name, sec_status) VALUES ("HV_EAP", -0.2);
END //

-- SP_CreateItemUse:     stored procedure to input cargo spaces (with item structure assignments)
CREATE PROCEDURE SP_CreateItemUse()
BEGIN
    CALL SP_getItemStructureID("Small Standard Container");
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 120, "Box");
    CALL SP_getItemStructureID("Medium Standard Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 390, "Box");
    CALL SP_getItemStructureID("Large Standard Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 780, "Box");
    CALL SP_getItemStructureID("Small Secure Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 120, "Box");
    CALL SP_getItemStructureID("Medium Secure Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 390, "Box");
    CALL SP_getItemStructureID("Large Secure Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 780, "Box");
    CALL SP_getItemStructureID("Giant Secure Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 3900, "Box");
    CALL SP_getItemStructureID("Large Freight Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 10000, "Box");
    CALL SP_getItemStructureID("Giant Freight Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 120000, "Box");
    CALL SP_getItemStructureID("Enormous Freight Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 250000, "Box");
    CALL SP_getItemStructureID("Station Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 1000000, "Box");
    CALL SP_getItemStructureID("Station Vault Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 10000000, "Box");
    CALL SP_getItemStructureID("Station Warehouse Container"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, 100000000, "Box");
    CALL SP_getItemStructureID("Astrahus"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Fortizar"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Keepstar"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Athanor"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Tatara"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Raitaru"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Azbel"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Sotiyo"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Ibis"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 125, "Ship");
    CALL SP_getItemStructureID("Bantam"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 270, "Ship");
    CALL SP_getItemStructureID("Condor"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 130, "Ship");
    CALL SP_getItemStructureID("Griffin"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 260, "Ship");
    CALL SP_getItemStructureID("Heron"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 400, "Ship");
    CALL SP_getItemStructureID("Kestrel"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 160, "Ship");
    CALL SP_getItemStructureID("Merlin"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 150, "Ship");
    CALL SP_getItemStructureID("Blackbird"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 305, "Ship");
    CALL SP_getItemStructureID("Caracal"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 450, "Ship");
    CALL SP_getItemStructureID("Osprey"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 485, "Ship");
    CALL SP_getItemStructureID("Raven"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 830, "Ship");
    CALL SP_getItemStructureID("Rokh"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 820, "Ship");
    CALL SP_getItemStructureID("Scorpion"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 690, "Ship");
    CALL SP_getItemStructureID("Wyvern"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 2500000, "Ship");
    CALL SP_getItemStructureID("Phoenix"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 1000000, "Ship");
    CALL SP_getItemStructureID("Leviathan"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 5000000, "Ship");
    CALL SP_getItemStructureID("Epithal"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 45000, "Ship");
    CALL SP_getItemStructureID("Kryos"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 43000, "Ship");
    CALL SP_getItemStructureID("Miasmos"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 42000, "Ship");
    CALL SP_getItemStructureID("Nereus"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 2700, "Ship");
    CALL SP_getItemStructureID("Iteron Mark V"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 5800, "Ship");
    CALL SP_getItemStructureID("Ship Maintenance Bay"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Ore Hold"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Mineral Hold"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Fleet Hangar"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Fuel Bay"); 
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Pod");
    INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES (@itemStructureID, 1, 0, "Ship");
END //

-- SP_CreateLink: stored procedure to input location links
CREATE PROCEDURE SP_CreateLink()
BEGIN
    CALL SP_getLocs("Jita", "Niyabainen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "Perimeter"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "Maurasi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "Muvolailen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "Sobaseki"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jita", "Ikuchi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("New Caldari", "Alikara"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("New Caldari", "Malkalen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("New Caldari", "Niyabainen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("New Caldari", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("New Caldari", "Hirtamon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maurasi", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maurasi", "Perimeter"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maurasi", "Muvolailen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maurasi", "Itamo"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Perimeter", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Perimeter", "Niyabainen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Perimeter", "Maurasi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Perimeter", "Urlen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Niyabainen", "Tunttaras"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Niyabainen", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Niyabainen", "Perimeter"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Niyabainen", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Kisogo", "Urlen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Urlen", "Kisogo"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Urlen", "Perimeter"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Urlen", "Unpas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Urlen", "Sirppala"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Muvolailen", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Muvolailen", "Maurasi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sobaseki", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sobaseki", "Malkalen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Malkalen", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Malkalen", "Sobaseki"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Alikara", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Josameto", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Josameto", "Otela"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Josameto", "Liekuri"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Josameto", "Poinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Otela", "Poinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Otela", "Josameto"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Poinen", "Obanen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Poinen", "Liekuri"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Poinen", "Otela"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Poinen", "Nomaa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Poinen", "Josameto"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Obanen", "Poinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Obanen", "Liekuri"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Obanen", "Olo"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Liekuri", "Obanen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Liekuri", "Josameto"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Liekuri", "Poinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikuchi", "Jita"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikuchi", "Hirtamon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikuchi", "Sakenta"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikuchi", "Tunttaras"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hirtamon", "Ikuchi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hirtamon", "New Caldari"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sakenta", "Ikuchi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tunttaras", "Ikuchi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tunttaras", "Niyabainen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Itamo", "Maurasi"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Olo", "Obanen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Olo", "Osmon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Osmon", "Olo"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Osmon", "Korsiki"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Korsiki", "Osmon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Korsiki", "Airaken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Airaken", "Korsiki"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Airaken", "Oijanen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Oijanen", "Airaken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Oijanen", "Akora"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Akora", "Oijanen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Akora", "Messoya"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Akora", "Reisen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Akora", "Maila"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikami", "Reisen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikami", "Purjola"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ikami", "Hampinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Reisen", "Purjola"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Reisen", "Akora"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Reisen", "Ikami"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maila", "Akora"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Maila", "Purjola"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Purjola", "Reisen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Purjola", "Ikami"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Purjola", "Maila"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hampinen", "Ikami"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hampinen", "Hurtoken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hampinen", "Jakanerva"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hurtoken", "Hampinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Hurtoken", "Abagawa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Abagawa", "Hurtoken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Abagawa", "Saisio"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Saisio", "Abagawa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Saisio", "Jakanerva"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Saisio", "Nomaa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jakanerva", "Hampinen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Jakanerva", "Saisio"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Nomaa", "Saisio"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Nomaa", "Geras"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Nomaa", "Abagawa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Geras", "Nomaa"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Geras", "Tuuriainas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tuuriainas", "Geras"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tuuriainas", "Sirseshin"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tuuriainas", "Shihuken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Shihuken", "Tuuriainas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Shihuken", "Senda"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Shihuken", "Unpas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Senda", "Shihuken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Unpas", "Uitra"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Unpas", "Shihuken"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Unpas", "Urlen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Uitra", "Unpas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sirppala", "Urlen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sirppala", "Inaro"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Inaro", "Sirppala"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Inaro", "Sirseshin"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sirseshin", "Inaro"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Sirseshin", "Tuuriainas"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Messoya", "Akora"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Messoya", "Tasti"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tasti", "Messoya"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Tasti", "Otosela"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Otosela", "Uemon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Otosela", "Tasti"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Uemon", "Fuskunen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Uemon", "Paala"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Uemon", "Otosela"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Paala", "Uemon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Paala", "LXQ2_T"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("LXQ2_T", "Paala"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("LXQ2_T", "8KE_YS"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("LXQ2_T", "PX_IHN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Fuskunen", "Uemon"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Fuskunen", "Ofage"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("Ofage", "Fuskunen"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("8KE_YS", "LXQ2_T"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("8KE_YS", "ZS_PNI"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("ZS_PNI", "8KE_YS"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("ZS_PNI", "O_LJOO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_LJOO", "TZ_74M"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_LJOO", "43_1TL"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_LJOO", "ZS_PNI"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("PX_IHN", "LXQ2_T"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("PX_IHN", "QBZO_R"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("PX_IHN", "M9_LAN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("PX_IHN", "WPV_JN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("PX_IHN", "IL_H0A"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("M9_LAN", "IL_H0A"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("M9_LAN", "CT8K_0"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("M9_LAN", "PX_IHN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("IL_H0A", "PX_IHN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("IL_H0A", "M9_LAN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("IL_H0A", "CT8K_0"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("IL_H0A", "L4X_1V"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("L4X_1V", "IL_H0A"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("L4X_1V", "WPV_JN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CT8K_0", "C_4D0W"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CT8K_0", "M9_LAN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CT8K_0", "IL_H0A"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("C_4D0W", "CT8K_0"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("C_4D0W", "WPV_JN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("WPV_JN", "PX_IHN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("WPV_JN", "C_4D0W"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("WPV_JN", "L4X_1V"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("QBZO_R", "PX_IHN"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("QBZO_R", "O_EUHA"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("QBZO_R", "CL_IRS"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CL_IRS", "QBZO_R"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CL_IRS", "ZZ5X_M"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_EUHA", "MO_I1W"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_EUHA", "QBZO_R"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("O_EUHA", "HV_EAP"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("ZZ5X_M", "CL_IRS"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("ZZ5X_M", "MO_I1W"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("MO_I1W", "ZZ5X_M"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("MO_I1W", "O_EUHA"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("FKR_SR", "HV_EAP"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("FKR_SR", "C9R_NO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("C9R_NO", "FKR_SR"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("C9R_NO", "5U_3PW"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("HV_EAP", "FKR_SR"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("HV_EAP", "O_EUHA"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("5U_3PW", "CYB_BZ"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("5U_3PW", "89JS_J"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("5U_3PW", "C9R_NO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("89JS_J", "CYB_BZ"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("89JS_J", "5U_3PW"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("89JS_J", "O_LJOO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CYB_BZ", "89JS_J"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CYB_BZ", "5U_3PW"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("CYB_BZ", "KHM_J1"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("43_1TL", "O_LJOO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("43_1TL", "89JS_J"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("TZ_74M", "O_LJOO"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
    CALL SP_getLocs("KMH_J1", "CYB_BZ"); INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (@loc1, @loc2);
END //

-- SP_CreatePlayer:  stored procedure to input players
CREATE PROCEDURE SP_CreatePlayer()
BEGIN
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Johnny", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("William_Shatner", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Doctor_Tennant", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Sarah_Jane_Smith", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Dentarthurdent", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Zaphod", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Trillian", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Ronald_McSpaceweevilburger", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("RealDrumpf", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("MatzoManRandallSausage", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Daily_Multivitamin_Man", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("KurtRussell", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("CaptainRon", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("MajorMacGuyver", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Major_Hooligan", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("Private_Hooligan", NULL);
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES ("General_Hooligan", NULL);
END //

-- SP_CreateCargoSpace:     stored procedure to input cargo spaces
CREATE PROCEDURE SP_CreateCargoSpace()
BEGIN
    CALL SP_getParams4CreateCS("Johnny", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Pod", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Jita");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "New Caldari");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Maurasi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Perimeter");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Niyabainen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Kisogo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Urlen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Muvolailen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Sobaseki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Malkalen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Alikara");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Josameto");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Otela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Poinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Obanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Liekuri");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Ikuchi");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Sakenta");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Tunttaras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Itamo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Olo");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Osmon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Korsiki");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Airaken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Ikami");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Reisen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Purjola");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Hampinen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Hurtoken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Abagawa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Saisio");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Jakanerva");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Nomaa");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Geras");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Tuuriainas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Shihuken");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Senda");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Unpas");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Uitra");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Sirppala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Inaro");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Sirseshin");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Oijanen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Akora");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Maila");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Messoya");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Tasti");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Otosela");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Uemon");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Paala");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Fuskunen");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Fortizar", "Ofage");  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (@playerID, @ItemUseID, @loc1, NULL);
END //

-- SP_CONTAINS: stored procedure to input contained items
CREATE PROCEDURE SP_CreateObject()
BEGIN
    CALL SO_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SO_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
END //

CREATE PROCEDURE SP_startingPlayersInPods()
BEGIN
    CALL SP_putPlayerInPod("Johnny");
    CALL SP_putPlayerInPod("William_Shatner");
    CALL SP_putPlayerInPod("Doctor_Tennant");
    CALL SP_putPlayerInPod("Sarah_Jane_Smith");
    CALL SP_putPlayerInPod("Dentarthurdent");
    CALL SP_putPlayerInPod("Zaphod");
    CALL SP_putPlayerInPod("Trillian");
    CALL SP_putPlayerInPod("Ronald_McSpaceweevilburger");
    CALL SP_putPlayerInPod("RealDrumpf");
    CALL SP_putPlayerInPod("MatzoManRandallSausage");
    CALL SP_putPlayerInPod("Daily_Multivitamin_Man");
    CALL SP_putPlayerInPod("KurtRussell");
    CALL SP_putPlayerInPod("CaptainRon");
    CALL SP_putPlayerInPod("MajorMacGuyver");
    CALL SP_putPlayerInPod("Major_Hooligan");
    CALL SP_putPlayerInPod("Private_Hooligan");
    CALL SP_putPlayerInPod("General_Hooligan");
END //

DELIMITER ;
-- end of stored procedure declarations
-- use cs340_nickersr;

CREATE TABLE IF NOT EXISTS EVE2_Players(id int primary key not null auto_increment);
ALTER TABLE EVE2_Players DROP FOREIGN KEY IF EXISTS FK_PILOT_OWNS_id;
DROP TABLE IF EXISTS EVE2_Objects;
DROP TABLE IF EXISTS EVE2_CargoSpace;
DROP TABLE IF EXISTS EVE2_ItemUse;
DROP TABLE IF EXISTS EVE2_ItemStructure;
DROP TABLE IF EXISTS EVE2_Players;
DROP TABLE IF EXISTS EVE2_LINKS;
DROP TABLE IF EXISTS EVE2_Locations;

CREATE TABLE EVE2_ItemStructure(
    id int(20) not null auto_increment,
    primary key (id),
    name varchar(255) unique not null,
    vol_packed float(20,2) not null default 1.0,
    vol_unpacked float(20,2) not null default 1.0,
    type varchar(255) not null
) ENGINE=InnoDB;

CREATE TABLE EVE2_ItemUse(
    id int(20) not null auto_increment,
    primary key (id),
    itemStructure_id int(20) not null,
    constraint FK_containers_item_id foreign key (itemStructure_id) references EVE2_ItemStructure(id),
    pilotable tinyint(1) default 0 not null,
    capacity float(20,2) default 100.0,
    type varchar(255) not null
) ENGINE=InnoDB;

CREATE TABLE EVE2_Locations(
    id int(20) not null auto_increment,
    primary key (id),
    name varchar(255) unique not null,
    sec_status float(3,1) not null default 10.0
) ENGINE=InnoDB;

CREATE TABLE EVE2_LINKS(
    source_id int(20) not null,
    constraint FK_LINKS_source_id foreign key (source_id)
    	references EVE2_Locations(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    link_id int(20) not null,
    constraint FK_LINKS_link_id foreign key (link_id) references EVE2_Locations(id)
        ON DELETE CASCADE
    	ON UPDATE CASCADE,
    primary key (source_id, link_id)
) ENGINE=InnoDB;

CREATE TABLE EVE2_Players(
    id int(20) not null auto_increment,
    primary key (id),
    name varchar(255) unique not null
) ENGINE=InnoDB;

CREATE TABLE EVE2_CargoSpace(
    id int(20) unique not null auto_increment,
    primary key (id),
    name varchar(255) unique NOT NULL,
    player_id int(20) not null,
    constraint FK_OWNS_player_id foreign key (player_id) 
    	references EVE2_Players(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    itemUse_id int(20) not null,
    constraint FK_OWNS_container_id foreign key (itemUse_id)
    	references EVE2_ItemUse(id)
        ON DELETE CASCADE
    	ON UPDATE CASCADE,
    location_id int(20) not null,
    constraint FK_OWNS_location_id foreign key (location_id)
    	references EVE2_Locations(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    inside_cargoSpace_id int(20),
    constraint FK_OWNS_inside_OWNS_id foreign key (inside_cargoSpace_id)
        references EVE2_CargoSpace(id)
) ENGINE=InnoDB;

ALTER TABLE EVE2_Players ADD COLUMN piloting_CS_id int;
ALTER TABLE EVE2_Players ADD CONSTRAINT FK_PILOT_OWNS_id
	foreign key (piloting_CS_id) references EVE2_CargoSpace(id)
    ON DELETE CASCADE;
    
CREATE TABLE EVE2_Objects(
    itemStructure_id int(20) not null,
    constraint FK_CONTAINS_item_id foreign key (itemStructure_id) references EVE2_ItemStructure(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    cargoSpace_id int(20) not null,
    constraint FK_CONTAINS_OWNS_id foreign key (cargoSpace_id) references EVE2_CargoSpace(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    primary key (itemStructure_id, cargoSpace_id),
    id int(20) unique not null auto_increment,
    quantity int(20) not null default 1,
    packaged tinyint(1) not null default 1
) ENGINE=InnoDB;

CALL SP_CreateItemStructure();
CALL SP_CreateLoc();
CALL SP_CreateItemUse();
CALL SP_CreateLink();
CALL SP_CreatePlayer();

-- good until here.

CALL SP_CreateCargoSpace();
CALL SP_startingPlayersInPods;
CALL SP_CreateObject();
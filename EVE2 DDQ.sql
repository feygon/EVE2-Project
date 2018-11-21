-- Table Data Definition Queries begin at line 1667. Before that, there are stored procedures.

use cs340_nickersr;

DROP PROCEDURE IF EXISTS SP_getCSpacesInCS;
DROP PROCEDURE IF EXISTS CSListIsNotEmpty;
DROP PROCEDURE IF EXISTS SP_getCSpacesInCS_List;
DROP PROCEDURE IF EXISTS SP_station_getCSpaces;

DROP PROCEDURE IF EXISTS SP_newPlayerGetsPodInJita;
DROP PROCEDURE IF EXISTS SP_getItemStructureID;
DROP PROCEDURE IF EXISTS SP_getLocs;
DROP PROCEDURE IF EXISTS SP_getCSid;
DROP PROCEDURE IF EXISTS SP_getParams4CreateCS;
DROP PROCEDURE IF EXISTS SP_getSpaceStationCSid;
DROP PROCEDURE IF EXISTS SP_putPlayerInPod;
DROP PROCEDURE IF EXISTS SP_startingPlayersInPods;
DROP PROCEDURE IF EXISTS SP_Log;

DROP PROCEDURE IF EXISTS SP_CreateItemStructure;
DROP PROCEDURE IF EXISTS SP_CreateLoc;
DROP PROCEDURE IF EXISTS SP_CreateItemUse;
DROP PROCEDURE IF EXISTS SP_CreateLink;
DROP PROCEDURE IF EXISTS SP_CreatePlayer;
DROP PROCEDURE IF EXISTS SP_CreateCargoSpace;
DROP PROCEDURE IF EXISTS SP_CreateObject;
DROP PROCEDURE IF EXISTS SP_startingPlayersInPods;
DROP PROCEDURE IF EXISTS SP_linkNewWormhole;

DELIMITER //

-- gives back a selection from the named binary procedure's outgoing parameter.
DROP PROCEDURE IF EXISTS SP_getSelectFromBinarySP //
CREATE PROCEDURE SP_getSelectFromBinarySP(IN incoming int(20), IN procedureName varchar(255))
BEGIN
    DECLARE getOut int(20);

    SET @st1 = 'CALL ?(incoming, getOut)';
    PREPARE stmt FROM @st1;
    SET @in1 = procedureName;
    EXECUTE stmt using @in1;
    SELECT (getOut);
    DEALLOCATE PREPARE stmt;
END //

-- get structure ID from id of cargo space
DROP PROCEDURE IF EXISTS SP_GetIStrFromCSid //
CREATE PROCEDURE SP_GetIStrFromCSid(IN CSid int(20), OUT IStrID int(20))
BEGIN
    SET IStrID = (SELECT IStr.id
        FROM EVE2_ItemStructure as IStr
            INNER JOIN EVE2_ItemUse as IU ON IU.itemStructure_id = IStr.id
            INNER JOIN EVE2_CargoSpace as CS ON CS.itemUse_id = IU.id
            AND CS.id = CSid);
END //

-- insert object for ship in target station.
-- update ship object_id to that object
DROP PROCEDURE IF EXISTS SP_DockShip //
CREATE PROCEDURE SP_DockShip(IN CSid int(20), IN StationID int(20))
BEGIN
    DECLARE IStrID int(20);
    SET @mangled_tempObjID = 0;
    CALL SP_GetIStrFromCSid(CSid, IStrID);
    INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged)
        VALUES ( IStrID, StationID, 1, 0);

    CALL SP_getMaxCargoSpace(mangled_tempObjID);
    UPDATE EVE2_CargoSpace SET object_id = mangled_tempObjID WHERE id = CSid;
END //

-- delete ship's object. nullify ship object id.
DROP PROCEDURE IF EXISTS SP_UndockShip //
CREATE PROCEDURE SP_UndockShip(IN CSid int(20))
BEGIN
    DECLARE _ShipObjectID int(20);
    CALL SP_GetShipObjectID(CSid, _ShipObjectID);

    DELETE FROM EVE2_Objects WHERE id = _ShipObjectID;
    UPDATE EVE2_CargoSpace SET object_id = NULL WHERE id = CSid;
END //

-- get the id of the station a ship is in
DROP PROCEDURE IF EXISTS SP_GetStationShipIsIn //
CREATE PROCEDURE SP_GetStationShipIsIn(IN ShipID int(20), OUT _StationID int(20))
BEGIN
    SET _StationID = (SELECT Station.id FROM EVE2_CargoSpace as Station
        INNER JOIN EVE2_Objects as Obj ON Obj.cargoSpace_id = Station.InnoDB
        INNER JOIN EVE2_CargoSpace as Ship ON Ship.object_id = obj.id
        AND Ship.id = CSid);
END //

-- get the object id of a ship
DROP PROCEDURE IF EXISTS SP_GetShipObjectID //
CREATE PROCEDURE SP_GetShipObjectID(IN ShipID int(20), OUT _ObjectID int(20))
BEGIN
    SET _ObjectID = (SELECT object_id FROM EVE2_CargoSpace WHERE id = ShipID);
END //

-- display a selection from a view (used in other SPs)
DROP PROCEDURE IF EXISTS SP_selectView //
CREATE PROCEDURE SP_selectView(IN viewName varchar(20))
BEGIN
    PREPARE stmt FROM 'SELECT * FROM ?';
    SET @in1 = viewName;
    EXECUTE stmt USING @in1;
    DEALLOCATE PREPARE stmt;
END //


DROP PROCEDURE IF EXISTS SP_view_ObjectsInCS //
CREATE PROCEDURE SP_view_ObjectsInCS(IN CSid int(20))
BEGIN
    SET @str = '
    CREATE VIEW view_ObjectsInCS AS
        (SELECT Obj.id FROM EVE2_Objects as Obj
            INNER JOIN EVE2_CargoSpace as CS ON CS.Object_id = Obj.id
            AND CS.id = ?)';
    PREPARE stmt FROM @str;
    SET @in1 = CSid;
    EXECUTE stmt using @in1;
    DEALLOCATE PREPARE stmt;
END //

-- create view of objects in the cargo space, and get a selection of that view
DROP PROCEDURE IF EXISTS SP_get_ObjectsInCS //
CREATE PROCEDURE SP_get_ObjectsInCS(IN CSid int(20))
BEGIN
    CALL SP_view_ObjectsInCS(CSid);
    CALL SP_selectView(view_ObjectsInCS);
END //

-- create view of cargo spaces in a view listing objects
DROP PROCEDURE IF EXISTS SP_view_CSpacesInObjectView //
CREATE PROCEDURE SP_view_CSpacesInObjectView(IN viewname varchar(255))
BEGIN
    SET @str = CONCAT('CREATE VIEW view_CSpacesInObjectView AS
        (SELECT CS.ID FROM EVE2_CargoSpace AS CS
            WHERE CS.ID IN (SELECT * from ', viewname , ')');
    PREPARE stmt FROM @str;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
-- see with SP_selectView(view_CSpacesInObjectView);

-- union the selected contents of 2 views into the first.
DROP PROCEDURE IF EXISTS SP_unionViews //
CREATE PROCEDURE SP_unionViews(IN viewname varchar(255), 
                               IN viewname2 varchar(255))
BEGIN
    DROP VIEW IF EXISTS tempView;
    SET @str = CONCAT('
    CREATE VIEW tempView AS 
        SELECT * FROM ', viewname, ' UNION SELECT * FROM ', viewname2);
    PREPARE stmt FROM @str;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @str2 = CONCAT('DROP VIEW ', viewname, ';');
    PREPARE stmt2 FROM @str2;
    EXECUTE stmt2;
    DEALLOCATE PREPARE stmt2;

    SET @str3 = CONCAT('CREATE VIEW ', viewname , ' AS SELECT * FROM tempView');
    PREPARE stmt3 FROM @str3;
    EXECUTE stmt3;
    DEALLOCATE PREPARE stmt3;
END //

-- get a view of objects from a view of cargo spaces
DROP PROCEDURE IF EXISTS SP_view_ObjectsInCSView //
CREATE PROCEDURE SP_view_ObjectsInCSView(IN viewname varchar(255))
BEGIN
    SET @str1 = CONCAT('
    CREATE VIEW ObjectsInCSView AS 
        SELECT Obj.id FROM EVE2_Objects as Obj
            INNER JOIN EVE2_CargoSpace as CS ON Obj.cargoSpace_id = CS.id
            AND CS.id IN (SELECT ', viewname,')');
    PREPARE stmt FROM @str1;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

-- call SP_view_ObjectsInCS ==> view_ObjectsInCS contains ship inventory objs
-- call SP_view_CSpacesInObjectView ==> view_CSpacesInObjectView
--      contains any cargo spaces in that inventory
-- Create a veiw containing only the CSid.
-- Union that view with the CSids matching the ship's inventory objects.
DROP PROCEDURE IF EXISTS SP_view_ShipUnionNestedCSs //
CREATE PROCEDURE SP_view_ShipUnionNestedCSs(IN CSid int(20))
BEGIN
    CALL SP_view_ObjectsInCS(CSid);
    call SP_view_CSpacesInObjectView("view_ObjectsInCS");

    SET @str1 = CONCAT('
        CREATE VIEW view_ShipUnionNestedCSs AS
            SELECT ', CSid);
    PREPARE stmt FROM @str1;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    CALL SP_unionViews("view_ShipUnionNestedCSs", "view_CSpacesInObjectView");
END //

-- as above, with more:
-- call SP_view_ObjectsInCSView ==> view_ObjectsInCSView contains all objects
--      in the station and its ships
-- call SP_view_CSpacesInObjectView ==> view_CSpacesInObjectView
--      contains the ships and boxes in the station
-- Union that view w/ the previous, and you've got the station, ships, and boxes.
DROP PROCEDURE IF EXISTS SP_view_StationUnionNestedCSs //
CREATE PROCEDURE SP_view_StationUnionNestedCSs(IN CSid int(20))
BEGIN

    CALL SP_view_ObjectsInCS(CSid);
    CALL SP_view_CSpacesInObjectView("view_ObjectsInCS");

    SET @str1 = CONCAT('
        CREATE VIEW view_StationUnionNestedCSs AS
            SELECT ', CSid);
    PREPARE stmt FROM @str1;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    CALL SP_unionViews("view_StationUnionNestedCSs", "view_CSpacesInObjectView");
    CALL SP_view_ObjectsInCSView("view_ShipUnionNestedCSs");
    CALL SP_view_CSpacesInObjectView("view_ObjectsInCSView");
    CALL SP_unionViews("view_StationUnionNestedCSs", "view_CSpacesInObjectView");
END //

DROP PROCEDURE IF EXISTS SP_expand_obj_view //
CREATE PROCEDURE SP_expand_obj_view(IN viewname varchar(255),
        IN orderBy1 varchar(255), IN ascending1 varchar(255),
        IN orderBy2 varchar(255), IN ascending2 varchar(255))
BEGIN

    SET @str1 = CONCAT('
    SELECT Str.Name, 
        Str.vol_packed, 
        Str.vol_unpacked,
        Str.type,
        Obj.cargoSpace_id,
        Obj.Quantity,
        Obj.packaged,
        IU.pilotable,
        IU.capacity,
        IU.scale,
        CS.name,
        Player.Name,
        Player.piloting_CS_id
        FROM EVE2_Objects as Obj
        INNER JOIN EVE2_ItemStructure as Str ON Obj.itemStructure_id = Str.id
        INNER JOIN EVE2_ItemUse as IU ON Str.id = IU.itemStructure_id
        INNER JOIN EVE2_CargoSpace as CS ON Obj.cargoSpace_id = CS.id
        LEFT JOIN  EVE2_Players as Players ON CS.player_id = Players.id
        WHERE Obj.id IN (select ?)
        ORDER BY ', orderBy1,' ?, 
                 ', orderBy2,' ?');
    SET @in1b = ifnull(ascending1, "ASC");
    SET @in2b = ifnull(ascending2, "ASC");
    SET @inView = viewname;
    PREPARE stmt FROM @str1;
    EXECUTE stmt USING @inView, @in1b, @in2b;
    DEALLOCATE PREPARE stmt;

END //


DROP PROCEDURE IF EXISTS SP_view_StationObjects_Deep //
CREATE PROCEDURE SP_view_StationObjects_Deep(IN CSid int(20),
        IN orderBy1 varchar(255), IN ascending1 varchar(255),
        IN orderBy2 varchar(255), IN ascending2 varchar(255),
        IN orderBy3 varchar(255), IN ascending3 varchar(255))
BEGIN
    CALL SP_view_StationUnionNestedCSs(CSid);
    CALL SP_view_ObjectsInCSView("view_StationUnionNestedCSs");
    CALL SP_expand_obj_view("view_ObjectsInCSView", 
                            orderBy1, ascending1,
                            orderBy2, ascending2,
                            orderBy3, ascending3);
END //



DROP PROCEDURE IF EXISTS SP_view_ShipObjects_Deep //
CREATE PROCEDURE SP_view_ShipObjects_Deep(IN CSid int(20),
        IN orderBy1 varchar(255), IN ascending1 varchar(255),
        IN orderBy2 varchar(255), IN ascending2 varchar(255),
        IN orderBy3 varchar(255), IN ascending3 varchar(255))
BEGIN
    CALL SP_view_ShipUnionNestedCSs(CSid);
    CALL SP_view_ObjectsInCSView("view_ShipUnionNestedCSs");
    CALL SP_expand_obj_view("view_ObjectsInCSView", 
                            orderBy1, ascending1,
                            orderBy2, ascending2,
                            orderBy3, ascending3);
END //

DROP PROCEDURE IF EXISTS SP_getMaxCargoSpace //
CREATE PROCEDURE SP_getMaxCargoSpace(OUT _CSid int(20))
BEGIN
 SET _CSid = (SELECT id FROM EVE2_CargoSpace WHERE 
        id in (SELECT MAX(id) FROM EVE2_CargoSpace));
END //

DROP PROCEDURE IF EXISTS SP_getItemStructureID //
CREATE PROCEDURE SP_getItemStructureID(IN itemname varchar(255))
BEGIN
    SET @itemStructureID = (SELECT EVE2_ItemStructure.id FROM EVE2_ItemStructure
        WHERE name = itemname);
END //

CREATE PROCEDURE SP_getLocs(IN sourceLoc varchar(255),
                            IN linkLoc varchar(255))
BEGIN
    SET @loc1 = (SELECT EVE2_Locations.id FROM EVE2_Locations
        WHERE name = sourceLoc);
    SET @loc2 = (SELECT EVE2_Locations.id from EVE2_Locations
        WHERE name = linkLoc);
END //

CREATE PROCEDURE SP_getCSid(IN playerName varchar(255),
                              IN itemUseName varchar(255))
BEGIN
    SET @playerID = (SELECT EVE2_Players.id FROM EVE2_Players
        WHERE name = playerName);
    SET @ItemUseID = (SELECT EVE2_CargoSpace.id FROM EVE2_CargoSpace
    	INNER JOIN EVE2_Players ON EVE2_CargoSpace.player_id = EVE2_Players.id
        INNER JOIN EVE2_ItemUse ON EVE2_CargoSpace.itemUse_id = EVE2_ItemUse.id
        INNER JOIN EVE2_ItemStructure ON EVE2_ItemUse. itemStructure_id = EVE2_ItemStructure.id
        WHERE EVE2_ItemStructure.name = itemUseName AND EVE2_Players.name = playerName
        LIMIT 1);
END //

DROP PROCEDURE IF EXISTS SP_getParams4CreateCS //
CREATE PROCEDURE SP_getParams4CreateCS(IN playerName varchar(255),
                                  IN itemUseName varchar(255),
                                  IN locationName varchar(255),
                                  IN integerVal int(11))
BEGIN
    SET @playerID = (SELECT EVE2_Players.id FROM EVE2_Players
        WHERE name = playerName);
    SET @ItemUseID = (SELECT EVE2_ItemUse.id FROM EVE2_ItemUse
        INNER JOIN EVE2_ItemStructure ON EVE2_ItemStructure.id = EVE2_ItemUse.itemStructure_id
        WHERE name = itemUseName);
    SET @ItemStructureName = (SELECT name FROM EVE2_ItemStructure IStr
        INNER JOIN EVE2_ItemUse as IU ON IU.itemStructure_id = IStr.id 
        AND IU.id = @ItemUseID);
    SET @loc1 = (SELECT EVE2_Locations.id FROM EVE2_Locations
        WHERE name = locationName);

    SET @CSname = (SELECT CONCAT(
        (SELECT name FROM EVE2_Players where id = @playerID),
            "'s ",
            @ItemStructureName,
            integerVal)
        AS concatString);
END //


CREATE PROCEDURE SP_getSpaceStationCSid(IN playerName varchar(255),
                                          itemUseName varchar(255),
                                          locationName varchar(255))
BEGIN
    SET @stationCSid = (SELECT EVE2_CargoSpace.id FROM EVE2_CargoSpace
    	INNER JOIN EVE2_ItemUse on EVE2_CargoSpace.itemUse_id = EVE2_ItemUse.id
    	INNER JOIN EVE2_ItemStructure on EVE2_ItemStructure.id = EVE2_ItemUse.itemStructure_id
    	INNER JOIN EVE2_Players on EVE2_Players.id = EVE2_CargoSpace.player_id
    	INNER JOIN EVE2_Locations on EVE2_Locations.id = EVE2_CargoSpace.location_id
    	WHERE EVE2_ItemStructure.name = itemUseName AND
          	  EVE2_Players.name = playerName AND
          	  EVE2_Locations.name = locationName
    	LIMIT 1);
END //

DROP PROCEDURE IF EXISTS SP_newPlayerGetsPodInJita //
CREATE PROCEDURE SP_newPlayerGetsPodInJita(IN playerName varchar(255))
BEGIN
    INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES (playerName, NULL);
    SET @newestPlayerID = (SELECT id FROM EVE2_Players WHERE name = playerName);
    SET @newestPlayerName = (SELECT name FROM EVE2_Players where id=@newestPlayerID);
    CALL SP_getItemStructureID("Keepstar");
    SET @stationISid = @itemStructureID;
    SET @stationIUID = (SELECT id from EVE2_ItemUse WHERE itemStructure_id = @stationISid);
    CALL SP_getItemStructureID("Pod");
    SET @podISid = @itemStructureID;
    SET @podIUID = (SELECT id FROM EVE2_ItemUse WHERE itemStructure_id = @podISid);
    CALL SP_getItemStructureID("Precious Metals");
    SET @preciousMetalsID = @itemStructureID;
    CALL SP_getItemStructureID("Water");
    SET @waterID = @itemStructureID;
    CALL SP_getItemStructureID("Oxygen");
    SET @oxygenID = @itemStructureID;

    SET @jitaID = (SELECT loc.id FROM EVE2_Locations as loc WHERE loc.name="Jita");
    INSERT INTO EVE2_CargoSpace (
        name, player_id, itemUse_id, location_id, object_id) VALUES
        (CONCAT(playerName, "'s Keepstar"), @newestPlayerID, @stationIUID, @jitaID, NULL);

    SET @stationCSid = (SELECT id FROM EVE2_CargoSpace WHERE 
        id in (SELECT MAX(id) FROM EVE2_CargoSpace));
    INSERT INTO EVE2_CargoSpace (name, player_id, itemUse_id, location_id, object_id) VALUES
        (CONCAT(playerName, "'s Pod"), @newestPlayerID, @podIUID, @jitaID, NULL);
    SET @shipCSid = (SELECT id FROM EVE2_CargoSpace WHERE
        id in (SELECT MAX(id) FROM EVE2_CargoSpace));
    CALL SP_DockShip(@shipCSid, @stationCSid);
    INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES
        (@preciousMetalsID, @stationCSid, 100, 1);
    INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES
        (@waterID, @stationCSid, 100, 1);
    INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES
        (@oxygenID, @stationCSid, 100, 1);
    UPDATE EVE2_Players SET piloting_CS_id = @shipCSid WHERE id = @newestPlayerID;
END //

CREATE PROCEDURE SP_putPlayerInPod(IN playerName varchar(255))
BEGIN
	CALL SP_getCSid(playerName, "pod");
    UPDATE EVE2_Players SET EVE2_Players.piloting_CS_id = @ItemUseID
    	WHERE EVE2_Players.name = playerName;
END //

DROP PROCEDURE IF EXISTS SP_linkNewWormhole //
CREATE PROCEDURE SP_linkNewWormhole(
        IN source int(20), 
        IN destoName varchar(255),
        IN secStatus float(3,1)
    )
BEGIN
    INSERT INTO EVE2_Locations (name, sec_status) 
        VALUES (destoName, secStatus);
    SET @maxID = (SELECT locID FROM (SELECT MAX(loc.id) as locID FROM EVE2_Locations as loc) AS SQ);
    INSERT INTO EVE2_LINKS (source_id, link_id)
        VALUES (source, @maxID);
    INSERT INTO EVE2_LINKS (source_id, link_id)
        VALUES (@maxID, source);
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
    CALL SP_getItemStructureID("Small Standard Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 120, "Box");
    CALL SP_getItemStructureID("Medium Standard Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 390, "Box");
    CALL SP_getItemStructureID("Large Standard Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 780, "Box");
    CALL SP_getItemStructureID("Small Secure Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 120, "Box");
    CALL SP_getItemStructureID("Medium Secure Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 390, "Box");
    CALL SP_getItemStructureID("Large Secure Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 780, "Box");
    CALL SP_getItemStructureID("Giant Secure Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 3900, "Box");
    CALL SP_getItemStructureID("Large Freight Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 10000, "Box");
    CALL SP_getItemStructureID("Giant Freight Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 120000, "Box");
    CALL SP_getItemStructureID("Enormous Freight Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 250000, "Box");
    CALL SP_getItemStructureID("Station Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 1000000, "Box");
    CALL SP_getItemStructureID("Station Vault Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 10000000, "Box");
    CALL SP_getItemStructureID("Station Warehouse Container"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, 100000000, "Box");
    CALL SP_getItemStructureID("Astrahus"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Fortizar"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Keepstar"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Athanor"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Tatara"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Raitaru"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Azbel"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Sotiyo"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Space Station");
    CALL SP_getItemStructureID("Ibis"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 125, "Ship");
    CALL SP_getItemStructureID("Bantam"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 270, "Ship");
    CALL SP_getItemStructureID("Condor"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 130, "Ship");
    CALL SP_getItemStructureID("Griffin"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 260, "Ship");
    CALL SP_getItemStructureID("Heron"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 400, "Ship");
    CALL SP_getItemStructureID("Kestrel"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 160, "Ship");
    CALL SP_getItemStructureID("Merlin"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 150, "Ship");
    CALL SP_getItemStructureID("Blackbird"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 305, "Ship");
    CALL SP_getItemStructureID("Caracal"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 450, "Ship");
    CALL SP_getItemStructureID("Osprey"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 485, "Ship");
    CALL SP_getItemStructureID("Raven"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 830, "Ship");
    CALL SP_getItemStructureID("Rokh"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 820, "Ship");
    CALL SP_getItemStructureID("Scorpion"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 690, "Ship");
    CALL SP_getItemStructureID("Wyvern"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 2500000, "Ship");
    CALL SP_getItemStructureID("Phoenix"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 1000000, "Ship");
    CALL SP_getItemStructureID("Leviathan"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 5000000, "Ship");
    CALL SP_getItemStructureID("Epithal"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 45000, "Ship");
    CALL SP_getItemStructureID("Kryos"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 43000, "Ship");
    CALL SP_getItemStructureID("Miasmos"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 42000, "Ship");
    CALL SP_getItemStructureID("Nereus"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 2700, "Ship");
    CALL SP_getItemStructureID("Iteron Mark V"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 5800, "Ship");
    CALL SP_getItemStructureID("Pod"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 1, 0, "Ship");
    CALL SP_getItemStructureID("Ship Maintenance Bay"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Ore Hold"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Mineral Hold"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Fleet Hangar"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Bay");
    CALL SP_getItemStructureID("Fuel Bay"); INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, scale) VALUES (@itemStructureID, 0, NULL, "Bay");
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

CREATE PROCEDURE SP_Log()
BEGIN
    INSERT INTO EVE2_SP_debug (report) VALUES (
        (SELECT
            CONCAT("playerID: ", @playerID,
                " itemUseID: " , @ItemUseID,
                " loc1: " , @loc1,
                " CSname: " , @CSname)
            AS ConcatenatedString
        )
    );
END //

-- SP_CreateCargoSpace:     stored procedure to input cargo spaces
CREATE PROCEDURE SP_CreateCargoSpace()
BEGIN
    CALL SP_getParams4CreateCS("Johnny", "Pod", "Jita", 0);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Pod", "Jita", 1);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Pod", "Jita", 2);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Pod", "Jita", 3);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Pod", "Jita", 4);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Pod", "Jita", 5);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Pod", "Jita", 6);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Pod", "Jita", 7);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Pod", "Jita", 8);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Pod", "Jita", 9);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Pod", "Jita", 10);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Pod", "Jita", 11);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Pod", "Jita", 12);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Pod", "Jita", 13);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Pod", "Jita", 14);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Pod", "Jita", 15);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Pod", "Jita", 16);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Jita", 17);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Jita", 18);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Jita", 19);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Jita", 20);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Jita", 21);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Jita", 22);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Jita", 23);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Jita", 24);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Jita", 25);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Jita", 26);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Jita", 27);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Jita", 28);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Jita", 29);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Jita", 30);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Jita", 31);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Jita", 32);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Jita", 33);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "New Caldari", 34);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "New Caldari", 35);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "New Caldari", 36);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "New Caldari", 37);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "New Caldari", 38);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "New Caldari", 39);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "New Caldari", 40);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "New Caldari", 41);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "New Caldari", 42);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "New Caldari", 43);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "New Caldari", 44);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "New Caldari", 45);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "New Caldari", 46);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "New Caldari", 47);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "New Caldari", 48);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "New Caldari", 49);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "New Caldari", 50);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Maurasi", 51);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Maurasi", 52);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Maurasi", 53);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Maurasi", 54);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Maurasi", 55);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Maurasi", 56);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Maurasi", 57);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Maurasi", 58);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Maurasi", 59);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Maurasi", 60);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Maurasi", 61);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Maurasi", 62);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Maurasi", 63);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Maurasi", 64);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Maurasi", 65);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Maurasi", 66);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Maurasi", 67);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Perimeter", 68);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Perimeter", 69);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Perimeter", 70);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Perimeter", 71);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Perimeter", 72);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Perimeter", 73);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Perimeter", 74);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Perimeter", 75);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Perimeter", 76);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Perimeter", 77);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Perimeter", 78);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Perimeter", 79);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Perimeter", 80);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Perimeter", 81);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Perimeter", 82);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Perimeter", 83);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Perimeter", 84);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Johnny", "Keepstar", "Niyabainen", 85);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("William_Shatner", "Keepstar", "Niyabainen", 86);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Doctor_Tennant", "Keepstar", "Niyabainen", 87);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Sarah_Jane_Smith", "Keepstar", "Niyabainen", 88);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Dentarthurdent", "Keepstar", "Niyabainen", 89);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Zaphod", "Keepstar", "Niyabainen", 90);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Trillian", "Keepstar", "Niyabainen", 91);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Ronald_McSpaceweevilburger", "Keepstar", "Niyabainen", 92);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("RealDrumpf", "Keepstar", "Niyabainen", 93);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MatzoManRandallSausage", "Keepstar", "Niyabainen", 94);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Daily_Multivitamin_Man", "Keepstar", "Niyabainen", 95);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("KurtRussell", "Keepstar", "Niyabainen", 96);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("CaptainRon", "Keepstar", "Niyabainen", 97);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("MajorMacGuyver", "Keepstar", "Niyabainen", 98);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Major_Hooligan", "Keepstar", "Niyabainen", 99);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("Private_Hooligan", "Keepstar", "Niyabainen", 100);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
    CALL SP_getParams4CreateCS("General_Hooligan", "Keepstar", "Niyabainen", 101);  INSERT INTO EVE2_CargoSpace (player_id, itemUse_id, location_id, name, object_id) VALUES (@playerID, @ItemUseID, @loc1, @CSname, NULL);
END //

-- SP_CONTAINS: stored procedure to input contained items
CREATE PROCEDURE SP_CreateObject()
BEGIN
    CALL SP_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Oxygen");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Precious Metals");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Johnny", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("William_Shatner", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Doctor_Tennant", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Sarah_Jane_Smith", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Dentarthurdent", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Zaphod", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Trillian", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Ronald_McSpaceweevilburger", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("RealDrumpf", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MatzoManRandallSausage", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Daily_Multivitamin_Man", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("KurtRussell", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("CaptainRon", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("MajorMacGuyver", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Major_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("Private_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
    CALL SP_getSpaceStationCSid("General_Hooligan", "Keepstar", "Jita"); CALL SP_getItemStructureID("Water");  INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (@itemStructureID, @stationCSid, 100, 1);
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
ALTER TABLE EVE2_Players DROP FOREIGN KEY IF EXISTS FK_Player_CS_id;
CREATE TABLE IF NOT EXISTS EVE2_CargoSpace(id int primary key not null auto_increment);
ALTER TABLE EVE2_CargoSpace DROP FOREIGN KEY IF EXISTS FK_Object_CS_id;
CREATE TABLE IF NOT EXISTS EVE2_Objects(id int primary key not null auto_increment);
ALTER TABLE EVE2_Objects DROP FOREIGN KEY IF EXISTS FK_Object_CS_id;
DROP TABLE IF EXISTS EVE2_CargoSpace;
DROP TABLE IF EXISTS EVE2_Objects;
DROP TABLE IF EXISTS EVE2_ItemUse;
DROP TABLE IF EXISTS EVE2_ItemStructure;
DROP TABLE IF EXISTS EVE2_Players;
DROP TABLE IF EXISTS EVE2_LINKS;
DROP TABLE IF EXISTS EVE2_Locations;
DROP TABLE IF EXISTS EVE2_SP_debug;

CREATE TABLE EVE2_SP_debug(
    id int(11)not null auto_increment,
    primary key (id),
    report varchar(255)
) ENGINE=InnoDB;

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
    scale varchar(255) not null
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
    constraint FK_CS_player_id foreign key (player_id) 
    	references EVE2_Players(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    itemUse_id int(20) not null,
    constraint FK_CS_itemUse_id foreign key (itemUse_id)
    	references EVE2_ItemUse(id)
        ON DELETE CASCADE
    	ON UPDATE CASCADE,
    location_id int(20) not null,
    constraint FK_CS_location_id foreign key (location_id)
    	references EVE2_Locations(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE EVE2_Players ADD COLUMN piloting_CS_id int;
ALTER TABLE EVE2_Players ADD CONSTRAINT FK_Player_CS_id
	foreign key (piloting_CS_id) references EVE2_CargoSpace(id)
    ON DELETE CASCADE;
    
CREATE TABLE EVE2_Objects(
    itemStructure_id int(20) not null,
    constraint FK_Objects_itemStructure_id foreign key (itemStructure_id) 
        references EVE2_ItemStructure(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    cargoSpace_id int(20) not null,
    constraint FK_Object_CS_id foreign key (cargoSpace_id) references EVE2_CargoSpace(id)
    	ON DELETE CASCADE
    	ON UPDATE CASCADE,
    primary key (itemStructure_id, cargoSpace_id),
    id int(20) unique not null auto_increment,
    quantity int(20) not null default 1,
    packaged tinyint(1) not null default 1
) ENGINE=InnoDB;

ALTER TABLE EVE2_CargoSpace ADD COLUMN object_id int(20);
ALTER TABLE EVE2_CargoSpace ADD constraint FK_CS_Object_id foreign key (object_id)
        references EVE2_Objects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE; 

CALL SP_CreateItemStructure();
CALL SP_CreateLoc();
CALL SP_CreateItemUse();
CALL SP_CreateLink();
CALL SP_CreatePlayer();

-- good until here.

CALL SP_CreateCargoSpace();
CALL SP_startingPlayersInPods;
CALL SP_CreateObject();
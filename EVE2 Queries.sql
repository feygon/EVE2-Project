/*   
*   
*   SQL Queries for CS340 project
*   Requirements:
*
*   1) Add capability for all entities
*
*   2) Delete and update capability for any entity
*
*   3) Add to all relationships
*
*   4) Add and remove to at least one many-to-many relationship
*
*   5) Search using text or filter using dynamically populated list
*       of properties to filter on, present for at least one entity 
*       (either players on player screen or structures in industry)
*   
*/

/* C-style prototypes for stored procedures:
    void SP_addObjectToCS(IN structureID int, IN qty INT, IN packed TINYINT(1), IN OCT int);
    void SP_remObjectFromCS(IN OCT int, IN structureID INT, IN packed TINYINT(1), IN qty INT);
    int SP_getItemUseItemID(IN OCTid int, OUT structureID int);
    int SP_getPilotedCS_id(IN playerID int, OUT shipID int);
    void SP_moveCSintoCS(IN subOCT int, IN newOCT int);
*/

-- QUERIES BY Requirement
-- 1)   Add capability for all entities
--      INSERT player entity --     player view
--      INSERT item use entity --  industry view
--      INSERT structures entity --      industry view
--      INSERT locations entity --  out in space view
-- 
-- 2)   Delete and update capability for any entity
--      DELETE player entity --     player view
--      UPDATE player entity --     space station view (unpackaging/repackaging an item)
--      
-- 3)   Add to all relationships
--      item IS container --                industry view (design an item use)
--      Cargo Space --            space station view (unpackage a container)
--      cargo space CONTAINS item --    space station view (move an item into a container)
--      container NESTS IN container --     space station view (move a container into another container),
--                                          or out in space view (dock)
--      cargo space OCCUPIES location - player view (creating a new player makes a ship in a station), 
--                                       -- or space station view (unpackage a container)
--      location CONNECTS TO location --    out in space view (open a wormhole)
--      player PILOTS cargo space --    space station view (changing ships),
--                                          or player view (creating a character starts them piloting a ship)
-- 
-- 4)   Add and remove to at least one many-to-many relationship
--      Add to a many-to-many relationship included above.
--      remove a many-to-many relationship -- player gives container to another player
--                                         -- or structures moved into other containers
-- 
-- 5)   Search using text or filter using dynamically populated list
--       of properties to filter on, present for at least one entity
--          Players View -- sort players by name or location
--          Item view    -- sort structures by name, type, or volume


-- QUERIES BY View

-- Players View
--  INSERT to create a new player by a form
--  SELECT to list players by id (hidden), name, piloting container, location for main player list and selection box
--  DELETE a player by ID

-- Out in space View
--  UPDATE to dock: move NESTS IN location of container 
--          by session player -> container_piloting, location id in dropdown
--  UPDATE* to travel: change cargo space location and all sub-containers recursively
--  SELECT&DELETE* to jettison a container: recursively remove cargo space, subcontainers, and corresponding structures
--  DELETE to jettison an item: removes just an item contained in an owned ship container
--  INSERT to chart a wormhole: add a new location by a form and link it to your current location

-- Space Station View
--  UPDATE to undock: new location NULL
--  SELECT to view inventory of a specific container
--  SELECT* to generate a tree of containers recursively
--  SELECT to populate item selection input:                trash an item
--  SELECT to populate players selection input:             give an item to another player
--  SELECT to populate container input:                     move an item into another container
--  INSERT to unpackage a container
--  DELETE to repackage a container
--  INSERT to move objects into containers
--  DELETE to move objects out of containers
--  SELECT&DELETE&INSERT* to empty container contents recursively
--  UPDATE to change piloting ships
--  
-- Industry View
--  INSERT to invent an item structure
--  INSERT to design a container
--  INSERT to make/buy objects
--  SELECT to get item types
--  SELECT to get Container types
--  SELECT to get item list


-- QUERIES BY TYPE
--  SELECT to list players by id (hidden), name, piloting container, location for main player list and selection box
SELECT 
    player.id AS playerID,
    player.name AS playerName,
    player.piloting_CS_id AS playerShip
    Ship.Location_ID as playerPosition
    FROM EVE2_Players as player
    INNER JOIN EVE2_CargoSpace as Ship ON Ship.id = player.piloting_CS_id
    ORDER BY ?, ?;

/*note to self: transform into stored procedure?*/
--  SELECT to view inventory of a specific container (OWNS.id)
-- objects in that container
DROP VIEW IF EXISTS objects_in_CS_?;
CREATE VIEW objects_in_CS_? AS
SELECT
    structures.id AS structureID,
    structures.name AS itemName,
    structures.type AS itemType,
    structures.vol_packed,
    structures.vol_unpacked,
    objects.qty,              -- will always be 1 with an OCT
    objects.packaged          -- will always be 1 with an OCT
    FROM EVE2_Objects AS objects
    INNER JOIN EVE2_ItemStructure AS structures ON structures.id = objects.itemStructure_id
    INNER JOIN EVE2_CargoSpace AS CS ON CS.id = objects.id
        AND OWNS.id = ?;

    -- place in stored procedure with 3 parameters for ?, ?, ?, takes 2 parameters from values
-- unpackaged containers in that container (inside_CS_id = OWNS.id)
DROP VIEW IF EXISTS cargoSpaces_in_cargoSpace_?;
CREATE VIEW cargoSpaces_in_cargoSpace_? AS
SELECT
    structures.id AS structureID,
    structures.name AS itemName,
    structures.type AS itemType,
    structures.vol_packed,
    structures.vol_unpacked,
    OWNS.id AS OCTid,
    OWNS.name AS OCTname,
    OWNS.itemUse_id AS OCT_base_id
    FROM EVE2_CargoSpace AS OWNS
    INNER JOIN EVE2_ItemUse as itemUse ON itemUse.id = Object.itemUse_id
    INNER JOIN EVE2_ItemStructure as structures ON structures.id = itemUse.itemStructure_id
    INNER JOIN EVE2_Objects as Object ON Object.cargoSpace_id = OWNS.id
            AND OWNS.inside_CS_id = ?;
-- IDs of objects that don't correspond to unpackaged containers
DROP VIEW IF EXISTS non_CS_objects_in_CS_?;
CREATE VIEW non_CS_objects_in_CS_? AS
SELECT
    structureID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged
    FROM objects_in_CS_?
    WHERE structureID NOT IN (SELECT structureID FROM cargoSpaces_in_cargoSpace_?);
-- Final query, merging containers with non-containers
DROP VIEW IF EXISTS merged_objects_?;
CREATE VIEW merged_objects_?
SELECT structureID, itemName, itemType, 
    vol_packed, qty, packaged, NULL, NULL, NULL
    FROM objects_in_CS_?
UNION
SELECT structureID, itemName, itemType, 
    vol_unpacked, NULL, NULL, OCTid, OCTname, OCT_base_id
    FROM non_CS_objects_in_CS_?
    ORDER BY ?, ?;
    
SET @containerCount = (SELECT count(structureID) FROM cargoSpaces_in_cargoSpace_?);
SET @totalVol = (SELECT sum(sum(vol_packed)) FROM non_CS_objects_in_CS_?);
SET @totalVolAll = (SELECT sum(vol_packed) FROM objects_in_CS_?);


--  SELECT to populate item selection input:                trash an item
-- re-use above.

--  SELECT to populate players selection input:             give an item to another player
SELECT
    player.id AS playerID,
    player.name AS playerName,
    ship.name AS playerShip,
    ship.location AS playerLocation,
    ship.inside_CS_id AS playerPosition
    FROM EVE2_Players as player
    INNER JOIN EVE2_CargoSpace as ship ON ship.id = player.piloting_CS_id
    ORDER BY ?, ?;

--  SELECT to populate container input:                     move an item into another container
-- re-use above on sub-container

--  SELECT to get item names for industry view selection box
CREATE VIEW indyItems_? AS
SELECT
    structures.id AS structureID,
    structures.name AS itemName
    FROM EVE2_ItemStructure as structures;

--  SELECT to get Container names for industry view selection box
CREATE VIEW indyCTs_? AS
SELECT
    itemUse.id AS CTid,
    object.name AS CTitemName
    FROM EVE2_ItemUse AS itemUse
    INNER JOIN EVE2_ItemStructure as object ON object.id = itemUse.itemStructure_id;
    
SELECT structureID, itemName FROM indyItems_?
UNION
SELECT CTid, CTitemName FROM indyCTs_?
    ORDER BY itemName;
    
DROP VIEW IF EXISTS indyItems_?;
DROP VIEW IF EXISTS indyCTs_?;

--  SELECT to get item type list for item creation form selection box
SELECT structures.type FROM EVE2_ItemStructure AS structures ORDER BY type;
-- SELECT to get container type list for form selection box
SELECT itemUse.scale FROM EVE2_ItemUse as itemUse ORDER BY type;


--  SELECT* to generate a tree of containers *recursively*
-- use code from CREATE VIEW cargoSpaces_in_cargoSpace_? above, recursively?
/*
* implement recursion with javascript code concatenation of mysql strings
*  and adding entries to views tables, later to be dropped. It's brutish,
*  but it's easier to implement than recursion at a known constant depth of 2
*/

--  SELECT(&DELETE)* to jettison a container: *recursively* remove cargo space, subcontainers, and corresponding objects
-- re-use code above to recursively generate a view of a list of containers.

DROP VIEW IF EXISTS cargoSpaces_in_cargoSpace_?_twoDeep;
-- Use concat or ?unionall? to union all sub-container, and call it 
--  cargoSpaces_in_cargoSpace_?_twoDeep. Then:

SELECT Object.id FROM EVE2_Objects AS Object
    WHERE Object.cargoSpace_id IS IN (cargoSpaces_in_cargoSpace_?_twoDeep); -- (above)
DELETE Object.id FROM EVE2_Objects AS Object
    WHERE Object.cargoSpace_id IS IN (cargoSpaces_in_cargoSpace_?_twoDeep); -- (use above to confirm)

--  SELECT(&DELETE&INSERT)* to empty container contents recursively
-- re-use code from jettisoning, but before the delete while doing so,
--  insert the objects into another container.
INSERT INTO Object (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES (( SELECT /* Some other stuff */));
    -- ****unionize the select of what containers are in the top box and the objects in just the top box****
    -- ****delete them from the top container****
    -- ****insert them into the target container****


--  UPDATE to dock: move NESTS IN location of container 
--          by session player -> container_piloting, location id in dropdown
UPDATE EVE2_CargoSpace
    SET EVE2_CargoSpace.inside_CS_id = ? -- ? is id of station if docking or null if undocking.
    WHERE EVE2_CargoSpace.id = ( -- the id of the player's piloted ship, by player.
        CALL SP_getPilotedCS_id(?); -- ? is player id
    )
;

DELIMITER //
DROP PROCEDURE IF EXISTS SP_addObjectToCS;
CREATE PROCEDURE SP_addObjectToCS(
    IN structureID int,
    IN qty INT,
    IN packed TINYINT(1),
    IN OCT int)
BEGIN
    INSERT INTO EVE2_Objects (itemStructure_id, cargoSpace_id, quantity, packaged) VALUES
                              (structureID,  OCT,      qty,      packed);
END //

DROP PROCEDURE IF EXISTS SP_remObjectFromCS;
CREATE PROCEDURE SP_remObjectFromCS(
    IN OCT int,
    IN structureID INT,
    IN packed TINYINT(1),
    IN qty INT)
BEGIN
    WITH (SELECT ) AS itemInfo
    IF (itemInfo) NOT NULL
    END IF
END //

-- get an item id of the unpackaged item of qty 1 corresponsing to a container
DROP PROCEDURE IF EXISTS SP_getItemUseItemID;
CREATE PROCEDURE SP_getItemUseItemID(
    IN OCTid int,
    OUT structureID int)
BEGIN
    structureID = (SELECT structure.id FROM EVE2_ItemStructure as structure
                INNER JOIN EVE2_ItemUse as CTs ON CTs.itemStructure_id = item
                INNER JOIN EVE2_CargoSpace as OCT ON OCT.itemUse_id = CTs.id
                    AND OCT.id = OCTid
             );
END //

-- returns player.piloting_CS_id of piloted ship
DROP PROCEDURE IF EXISTS SP_getPilotedCS_id;
CREATE PROCEDURE SP_getPilotedCS_id(
    IN playerID int,
    OUT shipID int)
BEGIN
    SET shipID = (
        SELECT piloting_CS_id FROM EVE2_Players
    );
END //

-- for moving a container into another container
-- can be used for docking from space too.
DROP PROCEDURE IF EXISTS SP_moveOCTIntoOCT;
CREATE PROCEDURE SP_moveCSintoCS(
    IN subOCT int,
    IN newOCT int)
BEGIN
/*
first, update the parent OCT in the child OCT.
then, remove the child item from the old parent OCT
finally, add the child item to the new parent OCT
*/
    DECLARE oldOCT int;
    oldOCT = (SELECT inside_CS_id FROM EVE2_CargoSpace WHERE id = subOCT);
    
    UPDATE EVE2_CargoSpace AS OWNS 
        SET (inside_CS_id) VALUES (subOCT)
        WHERE OWNS.id = newOCT;
    
    DECLARE structureID int;
    SET structureID = (SELECT structureID FROM (CALL getCorrespondintItem_xOCT(subOCT)));

    IF (oldOCT) NOT NULL THEN
        remItemFromOCT(structureID, 1, 1, oldOCT);
    END IF;
    addItemToOCT(structureID, 1, 1, newOCT); -- i.e. box's id of quantity 1 is unpacked.
END //

DELIMITER ;

--  UPDATE to undock: new outer OCT NULL
UPDATE EVE2_CargoSpace SET inside_CS_id = NULL WHERE id = ?;

--  UPDATE to change piloting ships
UPDATE EVE2_Players SET piloting_CS_id = ? WHERE id = ?;

--  UPDATE* to travel: change cargo space location and all sub-containers recursively
UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location = ? WHERE id IN (
    SELECT ?
    UNION
    SELECT (/*get list of OWNED container ids recursively*/)
);

-- -----
--  (SELECT&DELETE&)INSERT* to empty container contents recursively

--  DELETE a player by ID
DELETE FROM EVE2_Players WHERE id = ?;
--  DELETE to jettison an item: removes just an item contained in an owned ship container
DELETE FROM EVE2_Objects WHERE id = ?;
--  DELETE to repackage a container
DELETE FROM EVE2_CargoSpace where id = ?;
--  DELETE to move an item out of a container
DELETE FROM EVE2_ItemStructure WHERE id = ?;
-- -----
--  (SELECT&)DELETE(&INSERT)* to empty container contents *recursively*
--  (SELECT&)DELETE* to jettison a container: remove cargo space and corresponding objects
-- while out in space, ships will only be jettisoning containers that have no containers in them.
-- EVE2_Objects's foreign key has on delete cascade, so if the OCT is deleted, the objects
--  will be deleted too.
-- Just need to delete the OCT.

-- -----
--  INSERT to create a new player by a form
INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES (?,?);
--  INSERT to chart a wormhole: add a new location by a form and link it to your current location
INSERT INTO EVE2_Locations (name, sec_status) VALUES (?,?);
--  INSERT to put a container into another container
INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (?,?);
--  INSERT to unpackage a container
INSERT INTO EVE2_CargoSpace(player_id, itemUse_id, location_id, inside_CS_id) VALUES (?,?,?,?);
--  INSERT to invent an item structure
INSERT INTO EVE2_ItemStructure(name, vol_packed, vol_unpacked, type) VALUES(?,?,?,?);
--  INSERT to design an item use
INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES(?,?,?,?);--  INSERT to make/buy objects
--  INSERT to move objects into containers
    -- PROTOTYPE: void SP_addObjectToCS(IN structureID int, IN qty INT, IN packed TINYINT(1), IN OCT int);
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
*       (either players on player screen or items in industry)
*   
*/

/* C-style prototypes for stored procedures:
    void SP_addItemToOCT(IN itemID int, IN qty INT, IN packed TINYINT(1), IN OCT int);
    void SP_remItemFromOCT(IN OCT int, IN itemID INT, IN packed TINYINT(1), IN qty INT);
    int SP_getCTItemID(IN OCTid int, OUT itemID int);
    int SP_getPilotedShipID(IN playerID int, OUT shipID int);
    void SP_moveContainerIntoContainer(IN subOCT int, IN newOCT int);
*/

-- QUERIES BY Requirement
-- 1)   Add capability for all entities
--      INSERT player entity --     player view
--      INSERT container entity --  industry view
--      INSERT items entity --      industry view
--      INSERT locations entity --  out in space view
-- 
-- 2)   Delete and update capability for any entity
--      DELETE player entity --     player view
--      UPDATE player entity --     space station view (unpackaging/repackaging an item)
--      
-- 3)   Add to all relationships
--      item IS container --                industry view (invent a container)
--      player OWNS container --            space station view (unpackage a container)
--      owned container CONTAINS item --    space station view (move an item into a container)
--      container NESTS IN container --     space station view (move a container into another container),
--                                          or out in space view (dock)
--      owned container OCCUPIES location - player view (creating a new player makes a ship in a station), 
--                                       -- or space station view (unpackage a container)
--      location CONNECTS TO location --    out in space view (open a wormhole)
--      player PILOTS owned container --    space station view (changing ships),
--                                          or player view (creating a character starts them piloting a ship)
-- 
-- 4)   Add and remove to at least one many-to-many relationship
--      Add to a many-to-many relationship included above.
--      remove a many-to-many relationship -- player gives container to another player
--                                         -- or items moved into other containers
-- 
-- 5)   Search using text or filter using dynamically populated list
--       of properties to filter on, present for at least one entity
--          Players View -- sort players by name or location
--          Item view    -- sort items by name, type, or volume


-- QUERIES BY View

-- Players View
--  INSERT to create a new player by a form
--  SELECT to list players by id (hidden), name, piloting container, location for main player list and selection box
--  DELETE a player by ID

-- Out in space View
--  UPDATE to dock: move NESTS IN location of container 
--          by session player -> container_piloting, location id in dropdown
--  UPDATE* to travel: change owned container location and all sub-containers recursively
--  SELECT&DELETE* to jettison a container: recursively remove owned container, subcontainers, and corresponding items
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
--  INSERT to move items into containers
--  DELETE to move items out of containers
--  SELECT&DELETE&INSERT* to empty container contents recursively
--  UPDATE to change piloting ships
--  
-- Industry View
--  INSERT to invent an item
--  INSERT to invent a container
--  INSERT to make/buy items
--  SELECT to get item types
--  SELECT to get Container types
--  SELECT to get item list


-- QUERIES BY TYPE
--  SELECT to list players by id (hidden), name, piloting container, location for main player list and selection box
SELECT 
    player.id AS playerID,
    player.name AS playerName,
    player.piloting_OWNS_id AS playerShip
    Ship.Location_ID as playerPosition
    FROM EVE2_Players as player
    INNER JOIN EVE2_OWNS as Ship ON Ship.id = player.piloting_OWNS_id
    ORDER BY ?, ?;

/*note to self: transform into stored procedure?*/
--  SELECT to view inventory of a specific container (OWNS.id)
-- items in that container
DROP VIEW IF EXISTS items_in_OCT_?;
CREATE VIEW items_in_OCT_? AS
SELECT
    items.id AS itemID,
    items.name AS itemName,
    items.type AS itemType,
    items.vol_packed,
    items.vol_unpacked,
    CTinv.qty,              -- will always be 1 with an OCT
    CTinv.packaged          -- will always be 1 with an OCT
    FROM EVE2_CONTAINS AS CTinv
    INNER JOIN EVE2_Items AS items ON items.id = CTinv.item_id
    INNER JOIN EVE2_OWNS AS OWNS ON OWNS.id = CTinv.id
        AND OWNS.id = ?
    ORDER BY ?, ?;
-- unpackaged containers in that container (inside_OWNS_id = OWNS.id)
DROP VIEW IF EXISTS unp_CT_in_OCT_?;
CREATE VIEW unp_CT_in_OCT_? AS
SELECT
    items.id AS itemID,
    items.name AS itemName,
    items.type AS itemType,
    items.vol_packed,
    items.vol_unpacked,
    OWNS.id AS OCTid,
    OWNS.name AS OCTname,
    OWNS.container_id AS OCT_base_id
    FROM EVE2_OWNS AS OWNS
    INNER JOIN EVE2_Containers as CT ON CT.id = CTinv.container_id
    INNER JOIN EVE2_Items as items ON items.id = CT.item_id
    INNER JOIN EVE2_CONTAINS as CTinv ON CTinv.OWNS_id = OWNS.id
            AND OWNS.inside_OWNS_id = ?;
-- IDs of items that don't correspond to unpackaged containers
DROP VIEW IF EXISTS non_CT_items_?;
CREATE VIEW non_CT_items_? AS
SELECT
    itemID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged
    FROM items_in_OCT_?
    WHERE itemID NOT IN (SELECT itemID FROM unp_CT_in_OCT);
-- Final query, merging containers with non-containers
DROP VIEW IF EXISTS merged_items_?;
CREATE VIEW merged_items_?
SELECT itemID, itemName, itemType, 
    vol_packed, qty, packaged, NULL, NULL, NULL
    FROM items_in_OCT_?
UNION
SELECT itemID, itemName, itemType, 
    vol_unpacked, NULL, NULL, OCTid, OCTname, OCT_base_id
    FROM non_CT_items_?;
    
SET @containerCount = (SELECT count(itemID) FROM unp_CT_in_OCT_?);
SET @totalVol = (SELECT sum(sum(vol_packed)) FROM non_CT_items_?);


--  SELECT to populate item selection input:                trash an item
-- re-use above.

--  SELECT to populate players selection input:             give an item to another player
SELECT
    player.id AS playerID,
    player.name AS playerName,
    ship.name AS playerShip,
    ship.location AS playerLocation,
    ship.inside_OWNS_id AS playerPosition
    FROM EVE2_Players as player
    INNER JOIN EVE2_OWNS as ship ON ship.id = player.piloting_OWNS_id
    ORDER BY ?, ?;

--  SELECT to populate container input:                     move an item into another container
-- re-use above on sub-container

--  SELECT to get item names for industry view selection box
CREATE VIEW indyItems_? AS
SELECT
    items.id AS itemID,
    items.name AS itemName
    FROM EVE2_Items as items;

--  SELECT to get Container names for industry view selection box
CREATE VIEW indyCTs_? AS
SELECT
    CT.id AS CTid,
    CTitem.name AS CTitemName
    FROM EVE2_Containers AS CT
    INNER JOIN EVE2_Items as CTitem ON CTitem.id = CT.item_id;
    
SELECT itemID, itemName FROM indyItems_?
UNION
SELECT CTid, CTitemName FROM indyCTs_?
    ORDER BY itemName;
    
DROP VIEW IF EXISTS indyItems_?;
DROP VIEW IF EXISTS indyCTs_?;

--  SELECT to get item type list for item creation form selection box
SELECT items.type FROM EVE2_Items AS items ORDER BY type;
-- SELECT to get container type list for form selection box
SELECT CT.type FROM EVE2_Containers as CT ORDER BY type;


--  SELECT* to generate a tree of containers *recursively*
-- use code from CREATE VIEW unp_CT_in_OCT_? above, recursively?
/*
* implement recursion with javascript code concatenation of mysql strings
*  and adding entries to views tables, later to be dropped. It's brutish,
*  but it's easier to implement than recursion at a known constant depth of 2
*/

--  SELECT(&DELETE)* to jettison a container: *recursively* remove owned container, subcontainers, and corresponding items
-- re-use code above to recursively generate a view of a list of containers.

DROP VIEW IF EXISTS unp_CT_in_OCT_?_twoDeep;
-- Use concat to union all sub-container, and call it 
--  unp_CT_in_OCT_?_twoDeep. Then:
SELECT CTinv.id FROM EVE2_CONTAINS AS CTinv
    WHERE CTinv.OWNS_id IS IN (unp_CT_in_OCT_?_twoDeep); -- (above)
DELETE CTinv.id FROM EVE2_CONTAINS AS CTinv
    WHERE CTinv.OWNS_id IS IN (unp_CT_in_OCT_?_twoDeep); -- (use above to confirm)

--  SELECT(&DELETE&INSERT)* to empty container contents recursively
-- re-use code from jettisoning, but before the delete while doing so,
--  insert the items into another container.
INSERT INTO CTinv (item_id, OWNS_id, quantity, packaged) VALUES (( SELECT /* Some other stuff */));

--  UPDATE to dock: move NESTS IN location of container 
--          by session player -> container_piloting, location id in dropdown
UPDATE EVE2_OWNS
    SET EVE2_OWNS.inside_OWNS_id = ? -- ? is id of station if docking or null if undocking.
    WHERE EVE2_OWNS.id = ( -- the id of the player's piloted ship, by player.
        CALL SP_getPilotedShipID(?); -- ? is player id
    )
;

DELIMITER //
DROP PROCEDURE IF EXISTS SP_addItemToOCT;
CREATE PROCEDURE SP_addItemToOCT(
    IN itemID int,
    IN qty INT,
    IN packed TINYINT(1),
    IN OCT int)
BEGIN
    INSERT INTO EVE2_CONTAINS (item_id, OWNS_id, quantity, packaged) VALUES
                              (itemID,  OCT,      qty,      packed);
END //

DROP PROCEDURE IF EXISTS SP_remItemFromOCT;
CREATE PROCEDURE SP_remItemFromOCT(
    IN OCT int,
    IN itemID INT,
    IN packed TINYINT(1),
    IN qty INT)
BEGIN
    WITH (SELECT ) AS itemInfo
    IF (itemInfo) NOT NULL
    END IF
END //

-- get an item id of the unpackaged item of qty 1 corresponsing to a container
DROP PROCEDURE IF EXISTS SP_getCTItemID;
CREATE PROCEDURE SP_getCTItemID(
    IN OCTid int,
    OUT itemID int)
BEGIN
    itemID = (SELECT item.id FROM EVE2_Items as item
                INNER JOIN EVE2_Containers as CTs ON CTs.item_id = item
                INNER JOIN EVE2_OWNS as OCT ON OCT.container_id = CTs.id
                    AND OCT.id = OCTid
             );
END //

-- returns player.piloting_OWNS_id of piloted ship
DROP PROCEDURE IF EXISTS SP_getPilotedShipID;
CREATE PROCEDURE SP_getPilotedShipID(
    IN playerID int,
    OUT shipID int)
BEGIN
    SET shipID = (
        SELECT piloting_OWNS_id FROM EVE2_Players
    );
END //

-- for moving a container into another container
-- can be used for docking from space too.
DROP PROCEDURE IF EXISTS SP_moveOCTIntoOCT;
CREATE PROCEDURE SP_moveContainerIntoContainer(
    IN subOCT int,
    IN newOCT int)
BEGIN
/*
first, update the parent OCT in the child OCT.
then, remove the child item from the old parent OCT
finally, add the child item to the new parent OCT
*/
    DECLARE oldOCT int;
    oldOCT = (SELECT inside_OWNS_id FROM EVE2_OWNS WHERE id = subOCT);
    
    UPDATE EVE2_OWNS AS OWNS 
        SET (inside_OWNS_id) VALUES (subOCT)
        WHERE OWNS.id = newOCT;
    
    DECLARE itemID int;
    SET itemID = (SELECT itemID FROM (CALL getCorrespondintItem_xOCT(subOCT)));

    IF (oldOCT) NOT NULL THEN
        remItemFromOCT(itemID, 1, 1, oldOCT);
    END IF;
    addItemToOCT(itemID, 1, 1, newOCT); -- i.e. box's id of quantity 1 is unpacked.
END //

DELIMITER ;

--  UPDATE to undock: new outer OCT NULL
UPDATE EVE2_OWNS SET inside_OWNS_id = NULL WHERE id = ?;

--  UPDATE to change piloting ships
UPDATE EVE2_Players SET piloting_OWNS_id = ? WHERE id = ?;

--  UPDATE* to travel: change owned container location and all sub-containers recursively
UPDATE EVE2_OWNS SET EVE2_OWNS.location = ? WHERE id IN (
    SELECT ?
    UNION
    SELECT (/*get list of containers up to one deep recursively*/)
);

-- -----
--  (SELECT&DELETE&)INSERT* to empty container contents recursively

--  DELETE a player by ID
DELETE FROM EVE2_Players WHERE id = ?;
--  DELETE to jettison an item: removes just an item contained in an owned ship container
DELETE FROM EVE2_CONTAINS WHERE id = ?;
--  DELETE to repackage a container
DELETE FROM EVE2_OWNS where id = ?;
--  DELETE to move an item out of a container
DELETE FROM EVE2_Items WHERE id = ?;
-- -----
--  (SELECT&)DELETE(&INSERT)* to empty container contents *recursively*
--  (SELECT&)DELETE* to jettison a container: remove owned container and corresponding items
-- while out in space, ships will only be jettisoning containers that have no containers in them.
-- EVE2_CONTAINS's foreign key has on delete cascade, so if the OCT is deleted, the OCTinventory
--  will be deleted too.
-- Just need to delete the OCT.

-- -----
--  INSERT to create a new player by a form
INSERT INTO EVE2_Players (name, piloting_OWNS_id) VALUES (?,?);
--  INSERT to chart a wormhole: add a new location by a form and link it to your current location
INSERT INTO EVE2_Locations (name, sec_status) VALUES (?,?);
INSERT INTO EVE2_CONNECTS (source_id, link_id) VALUES (?,?);
--  INSERT to unpackage a container
INSERT INTO EVE2_OWNS(player_id, container_id, location_id, inside_OWNS_id) VALUES (?,?,?,?);
--  INSERT to invent an item
INSERT INTO EVE2_Items(name, vol_packed, vol_unpacked, type) VALUES(?,?,?,?);
--  INSERT to invent a container
INSERT INTO EVE2_Containers (item_id, pilotable, capacity, type) VALUES(?,?,?,?);--  INSERT to make/buy items
--  INSERT to move items into containers
    -- PROTOTYPE: void SP_addItemToOCT(IN itemID int, IN qty INT, IN packed TINYINT(1), IN OCT int);
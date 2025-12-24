var queries = {
    "select": [
    {
        "pilot_by_ship": "",    // no parameters -- line 102
        "CS_count": "",  // 3 parameters: OCT id #, order_by0, order_by1 -- line 166
        "objects_in_CS": "",
        "objects_in_CSnumqlist": "",
        "cargoSpaceIDs_in_CargoSpace": "",
        "CargoSpaces_in_CargoSpace_deep": "",
        "non_CS_item_structures": "",
        // likely broken
        // "total_vol_of_non_CS_objects": "",
        // "total_vol_all_objects": "",
        "all_players": "",  // playerID, playerName, shipID, shipNest, shipName, locationID, locationName
        "indy_views_union": "",
        "item_structure_types": "", // type
        "item_use_scales": "", // scale
        "objects_in_listed_cargoSpaces": "",
        "merged_objects_in_cargoSpace_numq": "",
        "item_structure_list": "", // id, name, type, vol_packed, vol_unpacked
        "non_CS_structures": "",
        "useless_item_structures": "",
        "linked_locations": "",
        "itemUse_list_orderbyq":"", // name, id, pilotable, capacity, scale
        "session_player": "",
        "stations_in_space": "", // stationID, stationName
        "station_name": ""
    }],
    "update": [
    {
        "docking": "",
        "set_inside_of": "",
        "set_piloting": "",
        "set_location": "",
        "change_CS_name": "",
        "moveObject": ""
    }],
    "insert": [
    {
        "insert_objects_and_CSs_into_CS": "",// + select + "));"
        "insert_player": "",    // calls stored procedure. adds station, ship, and contents.
        "insert_location": "",  // need SP for wormhole exploration.
        "insert_CS": "",
        "insert_item_structure": "",
        "insert_item_use": "",
        "insert_object": "",
        "insert_unpack_object": ""     // itemStructure_id, cargoSpace_id, quantity, packaged
    }],
    "delete": [
    {
        "del_objects_in_listed_cargoSpaces": "",
        "del_player": "",
        "del_object": "",
        "del_CS": "",
        "del_item_structure": "",
        "del_link": ""
    }],
    "view": [
    {
        "objects_in_CS": "",
        "cargoSpaces_in_CargoSpace": "",
        "non_CS_itemStructures_in_CS_numq": "",
        "indy_itemStructures": "",
        "indy_itemUses": ""
    }],
    "procedure_call": [
    {
        "SP_addObjectToCS": "",
        "SP_remObjectFromCS": "",
        "SP_getItemUseItemID": "",
        "SP_getPilotedCS_id": "",
        "SP_moveCSintoCS": "",
        "dockShip":"",
        "undockShip":"",
        "SP_getShipAndBoxes":"",
        "SP_getStationShipAndBoxes":"",
        "SP_getObjectsInCSView":"", // meant to be used with views from getShipAndBoxes or getStationShipAndBoxes
        "repackageObject":""
    }]
} 

/**
 * @description Get the ID, name, and ship ID of a pilot and their ship.
 * @property playerID Unique idenfier of a player.
 * @property playerName Name of the player.
 * @property playerShip ID of the ship (cargo space of ship type) the player is piloting.
 * @param {string} columns ?, ? Order by playerID, playerName, or playerShip
 */
queries.select.pilot_by_ship = "SELECT "
        + "player.id AS playerID, "
        + "player.name AS playerName, "
        + "player.piloting_CS_id AS playerShip, "
        + "Ship.Location_ID as playerPosition "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as Ship ON Ship.id = player.piloting_CS_id "
    + "ORDER BY ?, ?";

//queries.select.CS_count = "SELECT count(structureID) FROM cargoSpaces_in_cargoSpace_?";

/**
 * @deprecated Not used.
 * @description Get the objects in a cargo space.
 * @property id The unique ID of an object's structure.
 * @property name The name of an object's structure design.
 * @property type The structure type of an object.
 * @property vol_packed Volume of the item per each when packaged is true.
 * @property vol_unpacked Volume of the item per each when packaged is false.
 * @property qty The quantity of an object in the stack.
 * @property packaged A boolean to determine if the object is compressed or assembled.
 * @param {string} id ? The Cargo Space ID
 */
queries.select.objects_in_CS = "SELECT "
        + "structures.id AS id, "
        + "structures.name AS name, "
        + "structures.type AS type, "
        + "structures.vol_packed, "
        + "structures.vol_unpacked, "
        + "objects.qty, " // -- qty will always be 1 with an OCT
        + "objects.packaged " // -- will always be 1 = true with an OCT
    + "FROM EVE2_Objects AS objects "
    + "INNER JOIN EVE2_ItemStructure AS structures ON structures.id = objects.itemStructure_id "
    + "INNER JOIN EVE2_CargoSpace AS CS ON CS.id = objects.id "
    + "AND CS.id = ?";

    // use this query with a concatenated subquery.
/**
 * @deprecated Not used.
 * @description Get the objects in a list of cargo spaces.
 * @property id The unique ID of an object's structure.
 * @property name The name of an object's structure design.
 * @property type The structure type of an object.
 * @property vol_packed Volume of the item per each when packaged is true.
 * @property vol_unpacked Volume of the item per each when packaged is false.
 * @property qty The quantity of an object in the stack.
 * @property packaged A boolean to determine if the object is compressed or assembled.
 * @param {string} Concatenate This query must be concatenated with a selection of Cargo Space IDs.
 */
queries.select.objects_in_CSnumqlist = "SELECT "
        + "structures.id AS id, "
        + "structures.name AS name, "
        + "structures.type AS type, "
        + "structures.vol_packed, "
        + "structures.vol_unpacked, "
        + "objects.qty, " // -- qty will always be 1 with an OCT
        + "objects.packaged " // -- will always be 1 = true with an OCT
    + "FROM EVE2_Objects AS objects "
    + "INNER JOIN EVE2_ItemStructure AS structures ON structures.id = objects.itemStructure_id "
    + "INNER JOIN EVE2_CargoSpace AS CS ON CS.id = objects.id "
    + "AND CS.id IN "; // concat with selection of CSs


// could union this on its own products as inserts to get full depth selection tree.
/**
 * @description Get a selection of Cargo Spaces in an outer cargo space.
 * @property CSid The unique ids of the cargo spaces inside the outer cargo space.
 * @param {string} id ? The unique ID of the outer cargo space.
 */
queries.select.cargoSpaceIDs_in_CargoSpace = "SELECT "
       + "innerCS.id AS CSid "
    + "FROM EVE2_CargoSpace as outerCS "
    + "INNER JOIN EVE2_Objects as obj ON obj.cargoSpace_id = outerCS.id "
    + "INNER JOIN EVE2_CargoSpace as innerCS ON obj.id = innerCS.object_id "
        + "AND outerCS.id = ? ";

/**
 * @description Get a selection of all the player IDs, names, their ships, ship names,
 *     and locations, including where they're docked if applicable.
 * @property playerID Unique identifier of a player.
 * @property playerName Name of a player.
 * @property playerShipCSid Unique identifier of the cargo space (ship) piloted by the player.
 * @property shipNest Unique identifier of the cargo space where the player's ship is docked, if applicable.
 * @property stationName Name of the station cargo space where the player's ship is docked, if applicable.
 * @property shipName Name of the ship piloted by the player.
 * @property locationID Unique identifier of the system where the player's ship is located.
 * @property locationName Name of the system where the player's ship is located.
 * @param {string} columns ?, ? Order of sortation, up to two fields, default to player name.
 */
queries.select.all_players = "SELECT "
        + " player.id AS playerID, "
        + " player.name AS playerName, "
        + " ship.id AS playerShipCSid, "
        + " Obj.cargoSpace_id AS shipNest, " // can be null.
        + " station.name AS stationName, "
        + " ship.name AS shipName, "
        + " ship.location_id AS locationID, "
        + " loc.name AS locationName "
    + " FROM EVE2_Players as player "
    + " INNER JOIN EVE2_CargoSpace as ship ON ship.id = player.piloting_CS_id "
    + " INNER JOIN EVE2_Locations as loc ON ship.location_id = loc.id "
    + " LEFT JOIN EVE2_Objects as Obj ON ship.object_id = Obj.id "
    + " LEFT JOIN (SELECT id, name FROM EVE2_CargoSpace) "
    + " as station ON Obj.cargoSpace_id = station.id "
    + " ORDER BY ? ?, playername";

/**
 * @deprecated MySQL can't use variables this way.
 * @description Get a selection of a union of items which have already been invented.
 *     It is possible for an item structure to exist which does not have an industrial design invesnted yet.
 */
queries.select.indy_views_union = " SELECT structureID, itemName FROM indyItems_? "
    + " UNION "
    + " SELECT CTid, CTitemName FROM indyCTs_ ? "
    + " ORDER BY itemName";

/**
 * @description Get a selection of all possible structure types.
 */
queries.select.item_structure_types = "SELECT structures.type "
    + "FROM EVE2_ItemStructure AS structures GROUP BY type ORDER BY type";

/**
 * @description Get a selection of all invented items and their attributes.
 * @property id Unique identifier of an item structure.
 * @property name Name of an item structure.
 * @property type Type of an item structure.
 * @property vol_packed Volume per each of an item structure when packaged.
 * @property vol_unpacked Volume per each of an item structure when assembled.
 * @property scale Is the scale of an item a commodity, a ship, or a celestial satellite?
 */
queries.select.item_structure_list = " SELECT "
        + " structures.id, "
        + " structures.name, "
        + " structures.type, "
        + " structures.vol_packed, "
        + " structures.vol_unpacked, "
        + " IU.scale "
    + " FROM EVE2_ItemStructure as structures "
    + " LEFT JOIN EVE2_ItemUse as IU ON IU.itemStructure_id = structures.id "
    + " ORDER BY name";

/** 
 * @description Get a selection of all available item use scales.
 * @property scale Is the scale of an item a commodity, a ship, or a celestial satellite?
*/
queries.select.item_use_scales = "SELECT itemUse.scale "
    + "FROM EVE2_ItemUse as itemUse GROUP BY scale ORDER BY scale";

/**
 * @deprecated Not used, in favor of @see monoQueries.js.
 * @description Get a selection of cargo spaces contained in an outer cargo space, using a stored procedure call.
 * @param {string} id? ID of the outer cargo space.
 */
queries.select.CargoSpaces_in_CargoSpace_deep = ""
    + "CALL SP_CSnumq_getCSpaces(?); " // may be obsolete.
    + "SELECT @CSpacesInCS";

/**
 * @deprecated Not used, in favor of @see monoQueries.js.
 * @description Get a selection of objects in a list of cargo spaces
 * @param {string} Concatenate with selection of cargo space IDs.
 */
queries.select.objects_in_listed_cargoSpaces = "SELECT Object.id "
    + "FROM EVE2_Objects AS Object WHERE Object.cargoSpace_id IS IN "; // concat w/ selection or view.

/**
 * @deprecated MySQL can't use variables this way.
 * @description Get a selection of the union of two views.
 */
queries.select.indy_views_union = "SELECT "
    + "structureID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_? "
    + "ORDER BY itemName";

/**
 * @description Get a selection of items which haven't had uses designed yet.
 * @property id Unique identifier of an item structure.
 * @property name Name of an item structure.
 * @property type Type of an item structure.
 */
queries.select.useless_item_structures = "SELECT "
        + "structure.id, "
        + "structure.name, "
        + "structure.type "
    + "FROM EVE2_ItemStructure as structure "
    + "WHERE structure.type = 'container' AND structure.id NOT IN ( " 
        + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
            + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id"
        + ")";

/**
 * @description Get a selection of items which are not usable as cargo spaces.
 * @property id Unique identifier of an item structure.
 * @property name Name of an item structure.
 */
queries.select.non_CS_structures = "SELECT "
        + "structure.id, "
        + "structure.name "
    + "FROM EVE2_ItemStructure AS structure "
    + "WHERE structure.id NOT IN ( " 
        + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
            + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id "
        + ")";

/**
 * @description Get a selection of locations linked from a source location.
 * @property id Unique identifier for a location.
 * @property name Name of a location.
 * @param {number} id ? of the source location.
 */
queries.select.linked_locations = "SELECT "
    + "desto.id, desto.name FROM EVE2_LINKS as wormhole "
    + "INNER JOIN EVE2_Locations as source ON wormhole.source_id = source.id "
        + "AND source.id = ? "
    + "INNER JOIN EVE2_Locations as desto ON wormhole.link_id = desto.id "
    + "ORDER BY desto.name";

/**
 * @description Get a selection of all location names.
 */
queries.select.allLocations = "SELECT name as locationName FROM EVE2_Locations ORDER BY name";

/**
 * @description Get a selection of item uses, and related information.
 * @property name Name of a structure whose item use is recorded.
 * @property id Unique ID of an item use.
 * @property {boolean} pilotable Does the use of the item include being pilotable?
 * @property {number} capacity Volume of other items which fit into this item, if any.
 * @property {string} scale Is the size of an item on the order of 
 *     a commodity, a ship, or a celestial satellite?
 * @param {string} column ? Which column to order by?
 */
queries.select.itemUse_list_orderbyq = "SELECT "
        + " structures.name, "
        + " itemUse.id, " 
        +  "itemUse.pilotable, "
        + " itemUse.capacity, "
        + " itemUse.scale "
    + " FROM EVE2_ItemUse as itemUse "
    + " INNER JOIN EVE2_ItemStructure as structures ON structures.id = itemUse.itemStructure_id "
    + " ORDER BY ?";

/**
 * @description Get a selection of the player, ship, and docking information for a specific player.
 * @property {numeric} playerID Unique identifier of a player.
 * @property {string} playerName Name of a player.
 * @property {numeric} shipID Unique identifier of the player's ship.
 * @property {string} shipName Name of the player's ship.
 * @property {numeric} shipNest Unique identifier of the station where a player's ship is docked, if applicable.
 * @property {string} stationName Name of the station where a player's ship is docked, if applicable.
 * @property {numeric} locationID Unique identifier of the system where a player's ship is located.
 * @property {string} locationName Name of the system where a player's ship is located.
 * @param {numeric} id ? Player ID of the queried player.
 */
queries.select.session_player = "SELECT "
        + " player.id as playerID, "
        + " player.name as playerName, "
        + " CS.id as shipID, "
        + " CS.name as shipName, "
        + " Obj.cargoSpace_id as shipNest, "
        + " station.name as stationName, "
        + " loc.id as locationID, "
        + " loc.name as locationName "
    + " FROM EVE2_Players as player "
    + " INNER JOIN EVE2_CargoSpace AS CS on CS.id = player.piloting_CS_id "
    + " INNER JOIN EVE2_Locations AS loc ON loc.id = CS.location_id "
    + " LEFT JOIN EVE2_Objects AS Obj ON CS.object_id = Obj.id "
    + " LEFT JOIN EVE2_CargoSpace as station on Obj.cargoSpace_id = station.id"
    + " WHERE player.id = ?";

/**
 * @description Get a selection of stations in the current location, available to the current player.
 * @property {numeric} stationID Unique identifier for a station available to the player.
 * @property {string} stationName Name of a station available to the player.
 * @param {numeric} id ? ID of the ship a player is in.
 * @summary Unclear why it is the ship ID and not the player ID which is queried upon. Perhaps only
 *     the ship ID was available in the context of the callback where this query was called.
 */
queries.select.stations_in_space = "SELECT "
        + "station.id as stationID, "
        + "station.name as stationName "
    + "FROM EVE2_CargoSpace as station "
    + "INNER JOIN EVE2_CargoSpace as ship "
        + "ON ship.location_id = station.location_id "
        + "AND ship.player_id = station.player_id "
        + "AND ship.id = ? "
    + "INNER JOIN EVE2_ItemUse as IU "
        + "ON station.itemUse_id = IU.id "
        + "AND IU.scale = 'Space Station'"
    + "ORDER BY stationName";

/**
 * @description Get a station's name from its ID.
 * @property {string} name The name of the station.
 * @param {numeric} id ? Station ID.
 */
queries.select.station_name = "SELECT "
    + " name from EVE2_CargoSpace "
    + " WHERE id = ?";

/**
 * @description Call a stored procedure which creates a new player of the given name.
 * @param {string} name ? The name of the new player.
 */
queries.insert.insert_player = "CALL SP_newPlayerGetsPodInJita(?)";

/**
 * @description Call a stored procedure which creates a new connection from the current system.
 * @param {numeric} source ? The unique identifier for the source location, the system to be linked from.
 * @param {string} destoName ? The name of the new location.
 * @param {numeric} secStatus ? The security status of the new location.
 */
queries.insert.insert_location = "CALL SP_linkNewWormhole(?, ?, ?)"; // source, destoName, secStatus

/**
 * @deprecated Not used. Probably redundant with unpacking a cargo space object.
 * @description Create a new instance of cargo space.
 */
queries.insert.insert_CS = "INSERT INTO EVE2_CargoSpace( "
    + "player_id, itemUse_id, location_id, object_id) "
    + "VALUES (?,?,?,?)";

/**
 * @description Create a new item structure design.
 * @param {string} name ? The name of the item structure design.
 * @param {numeric} vol_packed ? The volume of the item per each when its object is packaged.
 * @param {numeric} vol_unpacked ? The volume of the item per each when its object is unpacked.
 * @param {string} type ? The type of an item, i.e. container, commodity, etc.
 */
queries.insert.insert_item_structure = "INSERT INTO EVE2_ItemStructure( "
    + "name, vol_packed, vol_unpacked, type) "
    + "VALUES(?,?,?,?)";

/**
 * @description Design a new use for an item structure that is currently useless, 
 *     subject to the unique constraint of the itemStructure_id field.
 * @param {numeric} itemStructure_id ? Unique identifier of an item use's assigned item structure.
 * @param {numeric} capacity ? Volume capacity of an item, if applicable.
 * @param {string} scale ? Is the size of an item on the order of 
 *     ammunition, a commodity, a ship, or a celestial satellite?
 */
queries.insert.insert_item_use = "INSERT INTO EVE2_ItemUse ( "
    + "itemStructure_id, capacity, scale) "
    + "VALUES(?,?,?)";

/**
 * @description Instantiate a new object from an existing structural design,
 *     and place a quantity of it in a cargo space, packed or assembled.
 * @param {numeric} itemStructure_id ? Unique Identifier of the item to be instantiated.
 * @param {numeric} cargoSpace_id ? Unique Identifier of the cargo space 
 *     into which the object is to be placed.
 * @param {numeric} quantity ? The number of copies of the object in the stack.
 * @param {boolean} packaged ? Is the item packed or assembled?
 */
queries.insert.insert_object = "INSERT INTO EVE2_Objects ( "
    + "itemStructure_id, cargoSpace_id, quantity, packaged) "
    + "VALUES (?,?,?,?)";

/**
 * @deprecated Does not take into account the celestial ejection and assembly of stations.
 *     Never implemented, in favor of a stored procedure below.
 * @description Unpack an object into a player's inventory of cargo spaces
 * @param {numeric} player_id ? Unique Identifier of the player.
 * @param {numeric} itemUse_id ? Unique Identifier of the designed use of the item.
 * @param {numeric} location_id ? Unique Identifier of the location of the unpacking.
 * @param {numeric} object_id ? Unique Identifier of the object assigned to the cargo space.
 */
queries.insert.insert_unpack_object = "INSERT INTO EVE2_CargoSpace "
    + " (player_id, itemUse_id, location_id, object_id)  VALUES "
    + " (?, ?, ?, ?) ";

/**
 * @deprecated Not used.
 * @description Update the object ID of an object.
 * @param {numeric} object_id ? New Unique Identifier of the object.
 * @param {numeric} id ? Old Unique Identifier of the object.
 */
queries.update.set_object_id = "UPDATE EVE2_CargoSpace "
    + " SET object_id = ? WHERE id = ?";

/**
 * @deprecated Not used.
 * @description Update the object IDs of several objects in a selection.
 */
queries.update.set_object_id_of_selection = "UPDATE EVE2_CargoSpace "
    + " SET object_id = ? WHERE id IN "; // ...concat w/ selection: 

/**
 * @description Update the cargo space being piloted by a player.
 * @param {numeric} piloting_CS_id ? Unique Identifier of the cargo space to be piloted.
 * @param {numeric} id ? Unique Identifier of the player.
 */
queries.update.set_piloting = "UPDATE EVE2_Players "
    + "SET piloting_CS_id = ? WHERE id = ?";

/**
 * @description Update the location of a cargo space. Used for ships traveling between locations.
 * @param {numeric} location_id ? Unique Identifier of location to be traveled to.
 * @param {numeric} id ? Unique identifier of the traveling ship.
 */
queries.update.set_location = "UPDATE EVE2_CargoSpace "
    + " SET EVE2_CargoSpace.location_id = ? WHERE id = ?";

/**
 * @description Update the location of a selection of cargo spaces.
 * @param {numeric} location_id ? Unique Identifier of location to be traveled to.
 * @param {string} Concatenate Selection of cargo spaces to be relocated.
 */
queries.update.set_location_selection = "UPDATE EVE2_CargoSpace "
    + " SET EVE2_CargoSpace.location_id = ? WHERE  id in "/****/; // concat with selection

/**
 * @description Update the name of a cargo space. Name your ship something cool!
 * @param {string} name ? The new name of the ship.
 * @param {numeric} id ? The unique identifier of the ship to be named.
 */
queries.update.change_CS_name = "UPDATE EVE2_CargoSpace "
    + " SET EVE2_CargoSpace.name = ? WHERE id = ?"; // newCSname, CSid

/**
 * @description Update which cargo space contains a certain object.
 * @param {numeric} cargoSpace_id ? Unique Identifier of the new cargo space container.
 * @param {numeric} id ? Unique Identifer of the object to be contained.
 */
queries.update.moveObject = "UPDATE EVE2_Objects "
    + " SET EVE2_Objects.cargoSpace_id = ? WHERE id = ?"

/**
 * @description Delete a certain player.
 * @param {numeric} id ? Unique Identifier of a player.
 */
queries.delete.del_player = "DELETE FROM EVE2_Players WHERE id = ?";

/**
 * @description Delete a certain object.
 * @param {numeric} id ? Unique Identifier of a object.
 */
queries.delete.del_object = "DELETE FROM EVE2_Objects WHERE id = ?";

/**
 * @description Delete a certain cargo space.
 * @param {numeric} id ? Unique Identifier of a cargo space.
 */
queries.delete.del_CS = "DELETE FROM EVE2_CargoSpace where id = ?";

/**
 * @description Delete a certain structural design.
 * @param {numeric} id ? Unique Identifier of a structural design.
 */
queries.delete.del_item_structure = "DELETE FROM EVE2_ItemStructure WHERE id = ?";

/**
 * @description Delete a certain location path.
 * @param {numeric} source_id ? Unique Identifier of a source location.
 * @param {numeric} link_id ? Unique Identifier of a linked location.
 */
queries.delete.del_link = "DELETE FROM EVE2_LINKS WHERE "
    + "(source_id = ? AND link_id = ?) OR "
    + "(source_id = ? AND link_id = ?)";   // delete link to here from there, and to there from here. Don't delete location.

/**
 * @deprecated
 */
queries.insert.insert_objects_and_CSs_into_CS = ""; 
// get selection of objects and CSs into a view, and select it.
// Insert the objects for those into the specified container. for reference, also call 'set_inside_of' for containers.

// deprecated.
/**
 * @deprecated On delete cascade took care of this.
 */
queries.delete.del_objects_in_listed_cargoSpaces = "DELETE Object.id FROM EVE2_Objects AS Object "
    + "WHERE Object.cargoSpace_id IN ";
// on delete cascade took care of this.

/**
 * @description Call stored procedure to dock a ship.
 * @param {numeric} shipID ? Unique identifier of the ship to be docked.
 * @param {numeric} stationID ? Unique identifier of the station to be docked in.
 */
queries.procedure_call.docking = "CALL SP_DockShip(?, ?)"; // shipID, stationID

/**
 * @description Call stored procedure to undock a ship.
* @param {numeric} shipID ? Unique identifier of the ship to be undocked.
 * @param {numeric} stationID ? Unique identifier of the station to be undocked from.
 */
queries.procedure_call.undockShip = "Call SP_UndockShip(?)";

/**
 * @description Call stored procedure to generate a view of a ship and its internal cargo spaces.
 * @param {numeric} ? Unique identifier of the ship to be queried.
 */
queries.procedure_call.SP_getShipAndBoxes = "CALL SP_getShipAndBoxes(?)";

/**
 * @description Call stored procedure to generate a view of a station and its internal cargo spaces.
 * @param {numeric} ? Unique identifier of the station to be queried.
 */
queries.procedure_call.SP_getStationShipAndBoxes = "CALL SP_getStationShipAndBoxes(?)";

/**
 * @description Call stored procedure to generate a view of objects in a cargo space.
 * @param {numeric} ? Unique identifier of the cargo space to be queried.
 */
queries.procedure_call.SP_getObjectsInCSView = "CALL SP_getObjectsInCSView(??)";

/**
 * @description Call stored procedure to repackage an object.
 * @param {numeric} ? Unique identifier of the object to be updated/deleted.
 */
queries.procedure_call.repackageObject = "CALL SP_repackageObject(?)";

/**
 * @description Call stored procedure to unpack an object.
 * @param {numeric} ? Unique identifier of the object to be updated/deleted.
 */
queries.procedure_call.unpackageObject = "CALL SP_unpackageObject(?, ?)";

module.exports = queries;

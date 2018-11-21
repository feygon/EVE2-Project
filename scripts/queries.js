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
        "stations_in_space": "" // stationID, stationName
    }],
    "update": [
    {
        "docking": "",
        "set_inside_of": "",
        "set_piloting": "",
        "set_location": ""
    }],
    "insert": [
    {
        "insert_objects_and_CSs_into_CS": "",// + select + "));"
        "insert_player": "",    // calls stored procedure. adds station, ship, and contents.
        "insert_location": "",  // need SP for wormhole exploration.
        "insert_CS": "",
        "insert_item_structure": "",
        "insert_item_use": "",
        "insert_object": ""     // itemStructure_id, cargoSpace_id, quantity, packaged
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
        "SP_getObjectsInCSView":"" // meant to be used with views from getShipAndBoxes or getStationShipAndBoxes
    }],
    "monolithic": [
    {
        "ship_queries": [
        {
            "create_view_CS_aggregate":"",
            "create_view_obj_aggregate":"",      // union with CSid to create
            "insert_1deep_CSs":"",  // union this manually with above
            "insert_1deep_objs":""
        }
        ],
        "get_ship_contents":"",
        "get_station_contents":""
    }
    ]
} 

queries.monolothic.ship_queries.create_view_CS_aggregate = ""
    + " DROP VIEW IF EXISTS view_CS_aggregate;"
    + " CREATE VIEW view_CS_aggregate AS "
        + " SELECT ? "; // CSid

queries.select.pilot_by_ship = "SELECT "
        + "player.id AS playerID, "
        + "player.name AS playerName, "
        + "player.piloting_CS_id AS playerShip, "
        + "Ship.Location_ID as playerPosition "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as Ship ON Ship.id = player.piloting_CS_id "
    + "ORDER BY ?, ?";

//queries.select.CS_count = "SELECT count(structureID) FROM cargoSpaces_in_cargoSpace_?";

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

    // maybe obsolete b/c of SP?
// queries.select.cargoSpaces_in_CargoSpace = "SELECT "
//     + "structures.id AS structureID, "
//     + "structures.name AS itemName, "
//     + "structures.type AS itemType, "
//     + "structures.vol_packed, "
//     + "structures.vol_unpacked, "
//     + "CS.id AS CSid, "
//     + "CS.name AS CSname, "
//     + "CS.itemUse_id AS CS_itemUse_id "
//     + "FROM EVE2_CargoSpace AS CS "
//     + "INNER JOIN EVE2_ItemUse as IUse ON IUse.id = objects.itemUse_id "
//     + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = IUse.itemStructure_id "
//     + "INNER JOIN EVE2_Objects as objects ON objects.cargoSpace_id = CS.id "
//     + "AND objects.cargoSpace_id = ? ";

// could union this on its own products as inserts to get full depth selection tree.
queries.select.cargoSpaceIDs_in_CargoSpace = "SELECT "
       + "innerCS.id AS CSid "
    + "FROM EVE2_CargoSpace as outerCS "
    + "INNER JOIN EVE2_CargoSpace as innerCS ON obj.id = innerCS.object_id "
    + "INNER JOIN EVE2_Objects as obj ON obj.cargoSpace_id = outerCS.id "
        + "AND outerCS.id = ? ";

// queries.select.non_CS_item_structures = "SELECT "
//     + "structureID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
//     + "FROM objects_in_CS_? "
//     + "WHERE structureID NOT IN "; // concat with selection of OCTs in OCT

// likely broken code. refers to a view that is likely broken.
// queries.select.total_vol_of_non_CS_objects = "SELECT sum(sum(vol_packed)) FROM non_CS_objects_in_CS_?";
// queries.select.total_vol_all_objects = "SELECT sum(vol_packed) FROM objects_in_CS_? ";

queries.select.all_players = "SELECT "
        + "player.id AS playerID, "
        + "player.name AS playerName, "
        + "ship.id AS playerShipCSid, "
        + "Obj.cargoSpace_id AS shipNest, " // can be null.
        + "ship.name AS shipName, "
        + "ship.location_id AS locationID, "
        + "loc.name AS locationName "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as ship ON ship.id = player.piloting_CS_id "
    + "INNER JOIN EVE2_Locations as loc ON ship.location_id = loc.id "
    + "LEFT JOIN EVE2_Objects as Obj ON ship.id = Obj.cargoSpace_id "
    + "ORDER BY ? ?, playername";

queries.select.indy_views_union = "SELECT structureID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_ ? "
    + "ORDER BY itemName";

queries.select.item_structure_types = "SELECT structures.type "
    + "FROM EVE2_ItemStructure AS structures GROUP BY type ORDER BY type";

queries.select.item_structure_list = "SELECT "
        + "structures.id, "
        + "structures.name, "
        + "structures.type, "
        + "structures.vol_packed, "
        + "structures.vol_unpacked "
    + "FROM EVE2_ItemStructure as structures ORDER BY name";

queries.select.item_use_scales = "SELECT itemUse.scale "
    + "FROM EVE2_ItemUse as itemUse GROUP BY scale ORDER BY scale";

queries.select.CargoSpaces_in_CargoSpace_deep = ""
    + "CALL SP_CSnumq_getCSpaces(?); " // may be obsolete.
    + "SELECT @CSpacesInCS";

queries.select.objects_in_listed_cargoSpaces = "SELECT Object.id "
    + "FROM EVE2_Objects AS Object WHERE Object.cargoSpace_id IS IN "; // concat w/ selection or view.

queries.select.indy_views_union = "SELECT "
    + "structureID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_? "
    + "ORDER BY itemName";

queries.select.useless_item_structures = "SELECT "
        + "structure.id, "
        + "structure.name, "
        + "structure.type "
    + "FROM EVE2_ItemStructure as structure "
    + "WHERE structure.type = 'container' AND structure.id NOT IN ( " 
        + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
            + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id"
        + ")";

queries.select.non_CS_structures = "SELECT structure.id, structure.name FROM EVE2_ItemStructure AS structure "
    + "WHERE structure.id NOT IN ( " 
        + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
            + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id "
        + ")";

queries.select.linked_locations = "SELECT "
    + "desto.id, desto.name FROM EVE2_LINKS as wormhole "
    + "INNER JOIN EVE2_Locations as source ON wormhole.source_id = source.id "
        + "AND source.id = ? "
    + "INNER JOIN EVE2_Locations as desto ON wormhole.link_id = desto.id "
    + "ORDER BY desto.name";

queries.select.itemUse_list_orderbyq = "SELECT "
        + "structures.name, "
        + "itemUse.id, "
        + "itemUse.pilotable, "
        + "itemUse.capacity, "
        + "itemUse.scale "
    + "FROM EVE2_ItemUse as itemUse "
    + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = itemUse.itemStructure_id "
    + "ORDER BY ?";

queries.select.session_player = "SELECT "
        + "player.id as playerID, "
        + "player.name as playerName, "
        + "CS.id as shipID, "
        + "CS.name as shipName, "
        + "Obj.cargoSpace_id as shipNest, "
        + "loc.id as locationID, "
        + "loc.name as locationName "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace AS CS on CS.id = player.piloting_CS_id "
    + "INNER JOIN EVE2_Locations AS loc ON loc.id = CS.location_id "
    + "LEFT JOIN EVE2_Objects AS Obj ON CS.object_id = Obj.id "
    + "WHERE player.id = ?";

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
    
queries.insert.insert_player = "CALL SP_newPlayerGetsPodInJita(?)";
queries.insert.insert_location = "CALL SP_linkNewWormhole(?, ?, ?)"; // source, destoName, secStatus



queries.insert.insert_CS = "INSERT INTO EVE2_CargoSpace( "
    + "player_id, itemUse_id, location_id, object_id) "
    + "VALUES (?,?,?,?)";
queries.insert.insert_item_structure = "INSERT INTO EVE2_ItemStructure( "
    + "name, vol_packed, vol_unpacked, type) "
    + "VALUES(?,?,?,?)";
queries.insert.insert_item_use = "INSERT INTO EVE2_ItemUse ( "
    + "itemStructure_id, pilotable, capacity, type) "
    + "VALUES(?,?,?,?)";
queries.insert.insert_object = "INSERT INTO EVE2_Objects ( "
    + "itemStructure_id, cargoSpace_id, quantity, packaged) "
    + "VALUES (?,?,?,?)";
    
queries.update.set_object_id = "UPDATE EVE2_CargoSpace SET object_id = ? WHERE id = ?";
queries.update.set_object_id_of_selection = "UPDATE EVE2_CargoSpace SET object_id = ? "
    + "WHERE id IN "; // ...concat w/ selection: 
queries.update.set_piloting = "UPDATE EVE2_Players SET piloting_CS_id = ? "
    + "WHERE id = ?"; // ...concat w/ selection: 
queries.update.set_location = "UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location_id = ? "
    + "WHERE id = ?";
queries.update.set_location_selection = "UPDATE EVE2_CargoSpace "
    + "SET EVE2_CargoSpace.location_id = ? WHERE  CSid in "/****/; // concat with selection

queries.delete.del_player = "DELETE FROM EVE2_Players WHERE id = ?";
queries.delete.del_object = "DELETE FROM EVE2_Objects WHERE id = ?";
queries.delete.del_CS = "DELETE FROM EVE2_CargoSpace where id = ?";
queries.delete.del_item_structure = "DELETE FROM EVE2_ItemStructure WHERE id = ?";

queries.delete.del_link = "DELETE FROM EVE2_LINKS WHERE "
    + "(source_id = ? AND link_id = ?) OR "
    + "(source_id = ? AND link_id = ?)";   // delete link to here from there, and to there from here. Don't delete location.

queries.insert.insert_objects_and_CSs_into_CS = ""; 
// get selection of objects and CSs into a view, and select it.
// Insert the objects for those into the specified container. for reference, also call 'set_inside_of' for containers.

// deprecated.
queries.delete.del_objects_in_listed_cargoSpaces = "DELETE Object.id FROM EVE2_Objects AS Object "
    + "WHERE Object.cargoSpace_id IN ";
// on delete cascade took care of this.

queries.procedure_call.docking = "CALL SP_DockShip(?, ?)"; // shipID, stationID
queries.procedure_call.undockShip = "Call SP_UndockShip(?)";

queries.procedure_call.SP_getShipAndBoxes = "CALL SP_getShipAndBoxes(?)";
queries.procedure_call.SP_getStationShipAndBoxes = "CALL SP_getStationShipAndBoxes(?)";
queries.procedure_call.SP_getObjectsInCSView = "CALL SP_getObjectsInCSView(??)";

/*
*   Views below won't work w/ current deployment of '?' operator.
*   Better to custom-make views from a procedure call anyway,
*       provided the support department comes through.
*/

// for displaying containers and objects together.
// queries.view.merged_objects_in_cargoSpace_numq = "CREATE VIEW merged_objects_? "
//     + "SELECT structureID, itemName, itemType, vol_packed, qty, packaged, NULL, NULL, NULL "
//         + "FROM objects_in_CS_? "
//     + "UNION "
//     + "SELECT structureID, itemName, itemType, "
//     + "vol_unpacked, NULL, NULL, CSid, CSname "
//         + "FROM non_CS_objects_in_CS_? "
//     + "ORDER BY ?, ?";

// queries.view.cargoSpaces_in_CargoSpace = "CREATE VIEW cargoSpaces_in_cargoSpace_? AS "; // concat w/ selection of OCTs in OCTnum

// queries.view.non_CS_itemStructures_in_CS_numq = "CREATE VIEW non_CS_objects_in_CS_? AS "
//     + "SELECT "
//         + "structureID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
//         + "FROM objects_in_CS_? "
//         + "WHERE structureID NOT IN ("; // concat with selection

// queries.view.indy_itemStructures = "SELECT "
//     + "structures.id AS structureID, "
//     + "structures.name AS itemName "
//     + "FROM EVE2_ItemStructure as structures";

// queries.view.indy_itemUses = "CREATE VIEW indyCTs_? AS "
//     + "SELECT "
//         + "itemUse.id AS id, "
//         + "object.name AS name "
//         + "FROM EVE2_ItemUse AS itemUse "
//         + "INNER JOIN EVE2_ItemStructure as object ON object.id = itemUse.itemStructure_id";

//queries.view.objects_in_CS = "CREATE VIEW objects_in_CS_? AS "; // concat with selection of objects in OCT

// call after docking insert with new object.

// requiring this file will automatically make the var into this object, with the above sub-objects.
module.exports = queries;

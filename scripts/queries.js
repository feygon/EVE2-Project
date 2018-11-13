var queries = {
    "select": [
    {
        "pilot_by_ship": "",    // no parameters -- line 102
        "CS_count": "",  // 3 parameters: OCT id #, order_by0, order_by1 -- line 166
        "objects_in_CS": "",
        "cargoSpaces_in_CargoSpace": "",
        "cargoSpaceIDs_in_CargoSpace": "",
        "CargoSpaces_in_CargoSpace_deep": "",
        "non_CS_item_structures": "",
        "total_vol_of_non_CS_item_structures": "",
        "total_vol_all_item_structures": "",
        "all_players": "",  // playerID, playerName, playerShip, playerLocation, locationName, playerShipCSid
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
        "session_player": ""
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
        "insert_item_use": ""
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
        "SP_moveCSintoCS": ""
    }]
} 

queries.select.pilot_by_ship = "SELECT "
    + "player.id AS playerID, "
    + "player.name AS playerName, "
    + "player.piloting_CS_id AS playerShip, "
    + "Ship.Location_ID as playerPosition "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as Ship ON Ship.id = player.piloting_CS_id "
    + "ORDER BY ?, ?";

queries.select.CS_count = "SELECT count(structureID) FROM cargoSpaces_in_cargoSpace_?";

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
queries.select.items_in_CSnumqlist = "SELECT "
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

queries.select.cargoSpaces_in_CargoSpace = "SELECT "
    + "structures.id AS structureID, "
    + "structures.name AS itemName, "
    + "structures.type AS itemType, "
    + "structures.vol_packed, "
    + "structures.vol_unpacked, "
    + "CS.id AS CSid, "
    + "CS.name AS CSname, "
    + "CS.itemUse_id AS CS_itemUse_id "
    + "FROM EVE2_CargoSpace AS CS "
    + "INNER JOIN EVE2_ItemUse as IUse ON IUse.id = objects.itemUse_id "
    + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = IUse.itemStructure_id "
    + "INNER JOIN EVE2_Objects as objects ON objects.cargoSpace_id = CS.id "
    + "AND CS.inside_CS_id = ? ";

// could union this on its own products as inserts to get full depth selection tree.
queries.select.cargoSpaceIDs_in_CargoSpace = "SELECT "
    + "inner.id AS CSid "
    + "FROM EVE2_CargoSpace as CS "
    + "INNER JOIN EVE2_CargoSpace as inner "
        + "ON inner.inside_CS_id = CS.id "
        + "AND CS.id = ? ";

queries.select.non_CS_item_structures = "SELECT "
    + "structureID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
    + "FROM objects_in_CS_? "
    + "WHERE structureID NOT IN "; // concat with selection of OCTs in OCT

queries.select.total_vol_of_non_CS_item_structures = "SELECT sum(sum(vol_packed)) FROM non_CS_objects_in_CS_?";
queries.select.total_vol_all_item_structures = "SELECT sum(vol_packed) FROM objects_in_CS_? ";

queries.select.all_players = "SELECT "
    + "player.id AS playerID, "
    + "player.name AS playerName, "
    + "ship.name AS playerShip, "
    + "ship.location_id AS playerLocation, "
    + "loc.name AS locationName, "
    + "ship.inside_CS_id AS playerShipCSid "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as ship ON ship.id = player.piloting_CS_id "
    + "INNER JOIN EVE2_Locations as loc ON ship.location_id = loc.id "
    + "ORDER BY ?? ";

queries.select.indy_views_union = "SELECT structureID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_ ? "
    + "ORDER BY itemName";

queries.select.item_structure_types = "SELECT structures.type FROM EVE2_ItemStructure AS structures GROUP BY type ORDER BY type";
queries.select.item_structure_list = "SELECT structures.id, structures.name, structures.type, structures.vol_packed, structures.vol_unpacked FROM EVE2_ItemStructure as structures ORDER BY name";
queries.select.item_use_scales = "SELECT itemUse.scale FROM EVE2_ItemUse as itemUse GROUP BY scale ORDER BY scale";
queries.select.CargoSpaces_in_CargoSpace_deep = ""; // recursive call required. depth unknown, potentially limitless.
queries.select.objects_in_listed_cargoSpaces = "SELECT Object.id FROM EVE2_Objects AS Object WHERE Object.cargoSpace_id IS IN ";
queries.select.indy_views_union = "SELECT structureID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_? "
    + "ORDER BY itemName";

queries.select.useless_item_structures = "SELECT structure.id, structure.name, structure.type FROM EVE2_ItemStructure as structure "
+ "WHERE structure.type = 'container' AND structure.id NOT IN (" 
    + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
        + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id"
    + ")";

queries.select.non_CS_structures = "SELECT structure.id, structure.name FROM EVE2_ItemStructure AS structure "
    + "WHERE structure.id NOT IN (" 
        + "SELECT structure.id FROM EVE2_ItemUse as itemUse "
            + "INNER JOIN EVE2_ItemStructure as structure ON structure.id = itemUse.itemStructure_id"
        + ")";

queries.select.linked_locations = "SELECT link.id, link.name FROM EVE2_LINKS as wormhole "
    + "INNER JOIN EVE2_Locations as source ON wormhole.source_id = source.id "
    + "AND source.id = ?"
    + "INNER JOIN EVE2_Locations as link ON wormhole.link_id = link.id "
    + "ORDER BY link.name";

queries.select.itemUse_list_orderbyqq = "SELECT structures.name, itemUse.id, itemUse.pilotable, itemUse.capacity, itemUse.scale "
    + "FROM EVE2_ItemUse as itemUse "
    + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = itemUse.itemStructure_id "
    + "ORDER BY ??";

queries.select.itemUse_list_orderbyq = "SELECT structures.name, itemUse.id, itemUse.pilotable, itemUse.capacity, itemUse.scale "
    + "FROM EVE2_ItemUse as itemUse "
    + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = itemUse.itemStructure_id "
    + "ORDER BY ?";

queries.select.session_player = "SELECT player.id as playerID, "
        + "player.name as playerName, "
        + "CS.id as CSid, "
        + "CS.inside_CS_id as CSnest, "
        + "loc.id as locationID, "
        + "loc.name as locationName "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace AS CS on CS.id = player.piloting_CS_id "
    + "INNER JOIN EVE2_Locations AS loc ON loc.id = CS.location_id "
    + "WHERE player.id = ?";

queries.insert.insert_player = "CALL SP_newPlayerGetsPodInJita(?)";
queries.insert.insert_location = "CALL SP_linkNewWormhole(?, ?)";
queries.insert.insert_CS = "INSERT INTO EVE2_CargoSpace(player_id, itemUse_id, location_id, inside_CS_id) VALUES (?,?,?,?)";
queries.insert.insert_item_structure = "INSERT INTO EVE2_ItemStructure(name, vol_packed, vol_unpacked, type) VALUES(?,?,?,?)";
queries.insert.insert_item_use = "INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES(?,?,?,?)";

queries.update.docking = "UPDATE EVE2_CargoSpace SET inside_CS_id = ? WHERE id = ?";
queries.update.set_inside_of = "UPDATE EVE2_CargoSpace SET inside_CS_id = ? WHERE id = ?";
queries.update.set_inside_of_selection = "UPDATE EVE2_CargoSpace SET inside_CS_id = ? WHERE id IN "; // concat w/ selection: 
queries.update.set_piloting = "UPDATE EVE2_Players SET piloting_CS_id = ? WHERE id = ?";
queries.update.set_location = "UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location = ? WHERE id = ?";
queries.update.set_location_selection = "UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location = ? WHERE id IN "; // concat with selection

queries.delete.del_player = "DELETE FROM EVE2_Players WHERE id = ?";
queries.delete.del_object = "DELETE FROM EVE2_Objects WHERE id = ?";
queries.delete.del_CS = "DELETE FROM EVE2_CargoSpace where id = ?";
queries.delete.del_item_structure = "DELETE FROM EVE2_ItemStructure WHERE id = ?";

queries.delete.del_link = "";   // delete link to here from there, and to there from here. Don't delete location.


queries.insert.insert_objects_and_CSs_into_CS = ""; 
// get selection of objects and CSs into a view, and select it.
// Insert the objects for those into the specified container. for reference, also call 'set_inside_of' for containers.

// deprecated.
queries.delete.del_objects_in_listed_cargoSpaces = "DELETE Object.id FROM EVE2_Objects AS Object WHERE Object.cargoSpace_id IS IN ";
// on delete cascade took care of this.

// for displaying containers and objects together.
queries.view.merged_objects_in_cargoSpace_numq = "CREATE VIEW merged_objects_? "
    + "SELECT structureID, itemName, itemType, vol_packed, qty, packaged, NULL, NULL, NULL "
        + "FROM objects_in_CS_? "
    + "UNION "
    + "SELECT structureID, itemName, itemType, "
    + "vol_unpacked, NULL, NULL, CSid, CSname "
        + "FROM non_CS_objects_in_CS_? "
    + "ORDER BY ?, ?";

queries.view.cargoSpaces_in_CargoSpace = "CREATE VIEW cargoSpaces_in_cargoSpace_? AS "; // concat w/ selection of OCTs in OCTnum

queries.view.non_CS_itemStructures_in_CS_numq = "CREATE VIEW non_CS_objects_in_CS_? AS "
    + "SELECT "
        + "structureID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
        + "FROM objects_in_CS_? "
        + "WHERE structureID NOT IN ("; // concat with selection

queries.view.indy_itemStructures = "SELECT "
    + "structures.id AS structureID, "
    + "structures.name AS itemName "
    + "FROM EVE2_ItemStructure as structures";

queries.view.indy_itemUses = "CREATE VIEW indyCTs_? AS "
    + "SELECT "
        + "itemUse.id AS id, "
        + "object.name AS name "
        + "FROM EVE2_ItemUse AS itemUse "
        + "INNER JOIN EVE2_ItemStructure as object ON object.id = itemUse.itemStructure_id";

queries.view.objects_in_CS = "CREATE VIEW objects_in_CS_? AS "; // concat with selection of objects in OCT

// requiring this file will automatically make the var into this object, with the above sub-objects.
module.exports = queries;
var queries = {
    "select": [
    {
        "pilot_by_ship": "",    // no parameters -- line 102
        "CS_count": "",  // 3 parameters: OCT id #, order_by0, order_by1 -- line 166
        "objects_in_CS": "",
        "cargoSpaces_in_CargoSpace": "",
        "CargoSpaces_in_CargoSpace_deep": "",
        "non_CS_item_structures": "",
        "total_vol_of_non_CS_item_structures": "",
        "total_vol_all_item_structures": "",
        "all_players": "",
        "indy_views_union": "",
        "item_structure_types": "",
        "item_use_scales": "",
        "objects_in_listed_cargoSpaces": "",
        "merged_objects_in_cargoSpace_numq": "",
        "item_structure_list": "",
        "non_CS_structures": "",
        "useless_item_structures": "",
        "linked_locations": ""
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
        "insert_structures_and_CSs_into_CS": "",// + select + "));"
        "insert_player": "",
        "insert_location": "",
        "insert_link": "",
        "insert_CS": "",
        "insert_item_structure": "",
        "insert_item_use": ""
    }],
    "delete": [
    {
        "del_structures_in_listed_cargoSpaces": "",
        "del_player": "",
        "del_object": "",
        "del_CS": "",
        "del_item_structure": ""
    }],
    "view": [
    {
        "objects_in_CS": "",
        "cargoSpaces_in_CargoSpace": "",
        "non_CS_itemStructures_in_CS_numq": "",
        "indy_itemStructures": "",
        "indy_item_uses": ""
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

queries.select.CS_count = "SELECT count(itemID) FROM cargoSpaces_in_cargoSpace_?";

queries.select.objects_in_CS = "SELECT "
    + "structures.id AS itemID, "
    + "structures.name AS itemName, "
    + "structures.type AS itemType, "
    + "structures.vol_packed, "
    + "structures.vol_unpacked, "
    + "OCTinv.qty, " // -- qty will always be 1 with an OCT
    + "OCTinv.packaged " // -- will always be 1 = true with an OCT
    + "FROM EVE2_Objects AS OCTinv "
    + "INNER JOIN EVE2_ItemStructure AS structures ON structures.id = OCTinv.itemStructure_id "
    + "INNER JOIN EVE2_CargoSpace AS OWNS ON OWNS.id = OCTinv.id "
    + "AND OWNS.id = ?";

queries.select.items_in_OCTnumlist = "SELECT "
    + "structures.id AS itemID, "
    + "structures.name AS itemName, "
    + "structures.type AS itemType, "
    + "structures.vol_packed, "
    + "structures.vol_unpacked, "
    + "OCTinv.qty, " // -- qty will always be 1 with an OCT
    + "OCTinv.packaged " // -- will always be 1 = true with an OCT
    + "FROM EVE2_Objects AS OCTinv "
    + "INNER JOIN EVE2_ItemStructure AS structures ON structures.id = OCTinv.itemStructure_id "
    + "INNER JOIN EVE2_CargoSpace AS OWNS ON OWNS.id = OCTinv.id "
    + "AND OWNS.id IN "; // concat with selection of OCTs

queries.select.cargoSpaces_in_CargoSpace = "SELECT "
    + "structures.id AS itemID, "
    + "structures.name AS itemName, "
    + "structures.type AS itemType, "
    + "structures.vol_packed, "
    + "structures.vol_unpacked, "
    + "OWNS.id AS OCTid, "
    + "OWNS.name AS OCTname, "
    + "OWNS.itemUse_id AS OCT_base_id "
    + "FROM EVE2_CargoSpace AS OWNS "
    + "INNER JOIN EVE2_ItemUse as CT ON CT.id = CTinv.itemUse_id "
    + "INNER JOIN EVE2_ItemStructure as structures ON structures.id = CT.itemStructure_id "
    + "INNER JOIN EVE2_Objects as CTinv ON CTinv.cargoSpace_id = OWNS.id "
    + "AND OWNS.inside_cargoSpace_id = ? ";

queries.select.non_CS_item_structures = "SELECT "
    + "itemID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
    + "FROM items_in_OCT_? "
    + "WHERE itemID NOT IN "; // concat with selection of OCTs in OCT

queries.select.total_vol_of_non_CS_item_structures = "SELECT sum(sum(vol_packed)) FROM non_CT_items_in_OCT_?";
queries.select.total_vol_all_item_structures = "SELECT sum(vol_packed) FROM items_in_OCT_? ";

queries.select.all_players = "SELECT "
    + "player.id AS playerID, "
    + "player.name AS playerName, "
    + "ship.name AS playerShip, "
    + "ship.location AS playerLocation, "
    + "ship.inside_cargoSpace_id AS playerPosition "
    + "FROM EVE2_Players as player "
    + "INNER JOIN EVE2_CargoSpace as ship ON ship.id = player.piloting_CS_id "
    + "ORDER BY ?, ? ";

queries.select.indy_views_union = "SELECT itemID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_ ? "
    + "ORDER BY itemName";

queries.select.item_structure_types = "SELECT structures.type FROM EVE2_ItemStructure AS structures GROUP BY type ORDER BY type";
queries.select.item_structure_list = "SELECT structures.id, structures.name, structures.type FROM EVE2_ItemStructure as structures ORDER BY name";
queries.select.item_use_scales = "SELECT CT.type FROM EVE2_ItemUse as CT GROUP BY type ORDER BY type";
queries.select.CargoSpaces_in_CargoSpace_deep = ""; // recursive call required. depth unknown, potentially limitless.
queries.select.objects_in_listed_cargoSpaces = "SELECT CTinv.id FROM EVE2_Objects AS CTinv WHERE CTinv.cargoSpace_id IS IN ";
queries.select.indy_views_union = "SELECT itemID, itemName FROM indyItems_? "
    + "UNION "
    + "SELECT CTid, CTitemName FROM indyCTs_? "
    + "ORDER BY itemName";

queries.select.useless_item_structures = "SELECT item.id, item.name, item.type FROM EVE2_ItemStructure AS item "
+ "WHERE item.type = 'container' AND item.id NOT IN (" 
    + "SELECT item.id FROM EVE2_ItemUse as CT "
        + "INNER JOIN EVE2_ItemStructure as item ON item.id = CT.itemStructure_id"
    + ")";

queries.select.non_CS_structures = "SELECT item.id, item.name FROM EVE2_ItemStructure AS item "
    + "WHERE item.id NOT IN (" 
        + "SELECT item.id FROM EVE2_ItemUse as CT "
            + "INNER JOIN EVE2_ItemStructure as item ON item.id = CT.itemStructure_id"
        + ")";

queries.select.linked_locations = "link.id, link.name FROM EVE2_LINKS as wormhole "
    + "INNER JOIN EVE2_Locations as source ON wormhole.source_id = source.id "
    + "AND source.id = ?"
    + "INNER JOIN EVE2_Locations as link ON wormhole.link_id = link.id "
    + "ORDER BY link.name";

queries.insert.insert_player = "INSERT INTO EVE2_Players (name, piloting_CS_id) VALUES (?,?)";
queries.insert.insert_location = "INSERT INTO EVE2_Locations (name, sec_status) VALUES (?,?)";
queries.insert.insert_link = "INSERT INTO EVE2_LINKS (source_id, link_id) VALUES (?,?)";
queries.insert.insert_CS = "INSERT INTO EVE2_CargoSpace(player_id, itemUse_id, location_id, inside_cargoSpace_id) VALUES (?,?,?,?)";
queries.insert.insert_item_structure = "INSERT INTO EVE2_ItemStructure(name, vol_packed, vol_unpacked, type) VALUES(?,?,?,?)";
queries.insert.insert_item_use = "INSERT INTO EVE2_ItemUse (itemStructure_id, pilotable, capacity, type) VALUES(?,?,?,?)";

queries.update.docking = "UPDATE EVE2_CargoSpace SET inside_cargoSpace_id = ? WHERE id = ?";
queries.update.set_inside_of = "UPDATE EVE2_CargoSpace SET inside_cargoSpace_id = ? WHERE id = ?";
queries.update.set_inside_of_selection = "UPDATE EVE2_CargoSpace SET inside_cargoSpace_id = ? WHERE id IN "; // concat w/ selection: 
queries.update.set_piloting = "UPDATE EVE2_Players SET piloting_CS_id = ? WHERE id = ?";
queries.update.set_location = "UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location = ? WHERE id = ?";
queries.update.set_location_selection = "UPDATE EVE2_CargoSpace SET EVE2_CargoSpace.location = ? WHERE id IN "; // concat with selection

queries.delete.del_player = "DELETE FROM EVE2_Players WHERE id = ?";
queries.delete.del_object = "DELETE FROM EVE2_Objects WHERE id = ?";
queries.delete.del_CS = "DELETE FROM EVE2_CargoSpace where id = ?";
queries.delete.del_item_structure = "DELETE FROM EVE2_ItemStructure WHERE id = ?";



queries.insert.insert_structures_and_CSs_into_CS = ""; // get selection of objects and OCTs into a view, and select it. Insert the objects for those into the specified container. for reference, also call 'set_inside_of' for containers.
queries.delete.del_structures_in_listed_cargoSpaces = "DELETE CTinv.id FROM EVE2_Objects AS CTinv WHERE CTinv.cargoSpace_id IS IN ";

// for displaying containers and objects together.
queries.view.merged_objects_in_cargoSpace_numq = "CREATE VIEW merged_items_? "
    + "SELECT itemID, itemName, itemType, vol_packed, qty, packaged, NULL, NULL, NULL "
        + "FROM items_in_OCT_? "
    + "UNION "
    + "SELECT itemID, itemName, itemType, "
    + "vol_unpacked, NULL, NULL, OCTid, OCTname, OCT_base_id "
        + "FROM non_CT_items_in_OCT_ ? "
    + "ORDER BY ?, ?";

queries.view.cargoSpaces_in_CargoSpace = "CREATE VIEW cargoSpaces_in_cargoSpace_? AS "; // concat w/ selection of OCTs in OCTnum

queries.view.non_CS_itemStructures_in_CS_numq = "CREATE VIEW non_CT_items_in_OCT_? AS "
    + "SELECT "
        + "itemID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
        + "FROM items_in_OCT_? "
        + "WHERE itemID NOT IN ("; // concat with selection

queries.view.indy_itemStructures = "SELECT "
    + "structures.id AS itemID, "
    + "structures.name AS itemName "
    + "FROM EVE2_ItemStructure as structures";

queries.view.indy_item_uses = "CREATE VIEW indyCTs_? AS "
    + "SELECT "
        + "CT.id AS CTid, "
        + "CTitem.name AS CTitemName "
        + "FROM EVE2_ItemUse AS CT "
        + "INNER JOIN EVE2_ItemStructure as CTitem ON CTitem.id = CT.itemStructure_id";

queries.view.objects_in_CS = "CREATE VIEW items_in_OCT_? AS "; // concat with selection of objects in OCT

// requiring this file will automatically make the var into this object, with the above sub-objects.
module.exports = queries;
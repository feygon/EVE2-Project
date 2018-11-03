module.exports = function() {

    var queries = {
      "select": [
        {
          "pilot_by_ship": "",    // no parameters -- line 102
          "container_count": "",  // 3 parameters: OCT id #, order_by0, order_by1 -- line 166
          "items_in_OCTnum": "",
          "OCTs_in_OCTnum": "",
          "non_OCT_items": "",
          "total_vol_non_container": "",
          "total_vol_all_items": "",
          "all_players": "",
          "indy_views_union": "",
          "item_types": "",
          "container_types",
          "OCTs_in_OCT_deep": "",
          "items_in_listed_OCTs": "",
          "merged_items_in_OCTnum": "",
          "item_list": ""
        }
      ],
      "update": [
        {
          "docking": "",
          "set_inside_of": "",
          "set_piloting": "",
          "set_location": ""
        }
      ],
      "insert": [
        {
          "insert_items_and_OCTs_into_OCT": "",// + select + "));"
          "insert_player": "",
          "insert_location": "",
          "insert_connection": "",
          "insert_OCT": "",
          "insert_new_item": "",
          "insert_container": ""
        }
      ],
      "delete": [
        {
          "del_items_in_listed_OCTs": "",
          "del_player": "",
          "del_CONTAINS": "",
          "del_OCT": "",
          "del_item": ""
        }
      ],
      "view": [
        {
          "items_in_OCTnum": "",
          "OCTs_in_OCTnum": "",
          "non_OCT_items_in_OCTnum": "",
          "indy_items": "",
          "indy_containers": ""
        }
      ],
      "procedure_call": [
        {
          "SP_addItemToOCT": "",
          "SP_remItemFromOCT": "",
          "SP_getCTItemID": "",
          "SP_getPilotedShipID": "",
          "SP_moveContainerIntoContainer": ""
        }
      ]
    } 


    queries.select.pilot_by_ship = "SELECT "
        + "player.id AS playerID, "
        + "player.name AS playerName, "
        + "player.piloting_OWNS_id AS playerShip, "
        + "Ship.Location_ID as playerPosition "
        + "FROM EVE2_Players as player "
        + "INNER JOIN EVE2_OWNS as Ship ON Ship.id = player.piloting_OWNS_id "
        + "ORDER BY ?, ?";

    queries.select.container_count = "SELECT count(itemID) FROM OCTs_in_OCT_?";

    queries.select.items_in_OCTnum = "SELECT "
        + "items.id AS itemID, "
        + "items.name AS itemName, "
        + "items.type AS itemType, "
        + "items.vol_packed, "
        + "items.vol_unpacked, "
        + "OCTinv.qty, " // -- qty will always be 1 with an OCT
        + "OCTinv.packaged " // -- will always be 1 = true with an OCT
        + "FROM EVE2_CONTAINS AS OCTinv "
        + "INNER JOIN EVE2_Items AS items ON items.id = OCTinv.item_id "
        + "INNER JOIN EVE2_OWNS AS OWNS ON OWNS.id = OCTinv.id "
        + "AND OWNS.id = ?";

    queries.select.items_in_OCTnumlist = "SELECT "
        + "items.id AS itemID, "
        + "items.name AS itemName, "
        + "items.type AS itemType, "
        + "items.vol_packed, "
        + "items.vol_unpacked, "
        + "OCTinv.qty, " // -- qty will always be 1 with an OCT
        + "OCTinv.packaged " // -- will always be 1 = true with an OCT
        + "FROM EVE2_CONTAINS AS OCTinv "
        + "INNER JOIN EVE2_Items AS items ON items.id = OCTinv.item_id "
        + "INNER JOIN EVE2_OWNS AS OWNS ON OWNS.id = OCTinv.id "
        + "AND OWNS.id IN "; // concat with selection of OCTs

    queries.select.OCTs_in_OCTnum = "SELECT "
        + "items.id AS itemID, "
        + "items.name AS itemName, "
        + "items.type AS itemType, "
        + "items.vol_packed, "
        + "items.vol_unpacked, "
        + "OWNS.id AS OCTid, "
        + "OWNS.name AS OCTname, "
        + "OWNS.container_id AS OCT_base_id "
        + "FROM EVE2_OWNS AS OWNS "
        + "INNER JOIN EVE2_Containers as CT ON CT.id = CTinv.container_id "
        + "INNER JOIN EVE2_Items as items ON items.id = CT.item_id "
        + "INNER JOIN EVE2_CONTAINS as CTinv ON CTinv.OWNS_id = OWNS.id "
        + "AND OWNS.inside_OWNS_id = ? ";

    queries.select.non_OCT_items = "SELECT "
        + "itemID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
        + "FROM items_in_OCT_? "
        + "WHERE itemID NOT IN "; // concat with selection of OCTs in OCT

    queries.select.total_vol_non_container = "SELECT sum(sum(vol_packed)) FROM non_CT_items_in_OCT_?";
    queries.select.total_vol_all_items = "SELECT sum(vol_packed) FROM items_in_OCT_? ";

    queries.select.all_players = "SELECT "
        + "player.id AS playerID, "
        + "player.name AS playerName, "
        + "ship.name AS playerShip, "
        + "ship.location AS playerLocation, "
        + "ship.inside_OWNS_id AS playerPosition "
        + "FROM EVE2_Players as player "
        + "INNER JOIN EVE2_OWNS as ship ON ship.id = player.piloting_OWNS_id "
        + "ORDER BY ?, ? ";

    queries.select.indy_views_union = "SELECT itemID, itemName FROM indyItems_? "
        + "UNION "
        + "SELECT CTid, CTitemName FROM indyCTs_ ? "
        + "ORDER BY itemName";

    queries.select.item_types = "SELECT items.type FROM EVE2_Items AS items ORDER BY type";
    queries.select.item_list = "SELECT items.id, items.name FROM EVE2_Items ORDER BY name";
    queries.select.container_types = "SELECT CT.type FROM EVE2_Containers as CT ORDER BY type";
    queries.select.OCTs_in_OCT_deep = ""; // recursive call required. depth unknown, potentially limitless.
    queries.select.items_in_listed_OCTs = "SELECT CTinv.id FROM EVE2_CONTAINS AS CTinv WHERE CTinv.OWNS_id IS IN ";
    queries.select.indy_views_union = "SELECT itemID, itemName FROM indyItems_? "
        + "UNION "
        + "SELECT CTid, CTitemName FROM indyCTs_? "
        + "ORDER BY itemName";

    queries.insert.insert_player = "INSERT INTO EVE2_Players (name, piloting_OWNS_id) VALUES (?,?)";
    queries.insert.insert_location = "INSERT INTO EVE2_Locations (name, sec_status) VALUES (?,?)";
    queries.insert.insert_connection = "INSERT INTO EVE2_CONNECTS (source_id, link_id) VALUES (?,?)";
    queries.insert.insert_OCT = "INSERT INTO EVE2_OWNS(player_id, container_id, location_id, inside_OWNS_id) VALUES (?,?,?,?)";
    queries.insert.insert_new_item = "INSERT INTO EVE2_Items(name, vol_packed, vol_unpacked, type) VALUES(?,?,?,?)";
    queries.insert.insert_container = "INSERT INTO EVE2_Containers (item_id, pilotable, capacity, type) VALUES(?,?,?,?)";

    queries.update.docking = "UPDATE EVE2_OWNS SET inside_OWNS_id = ? WHERE id = ?";
    queries.update.set_inside_of = "UPDATE EVE2_OWNS SET inside_OWNS_id = ? WHERE id = ?";
    queries.update.set_inside_of_selection = "UPDATE EVE2_OWNS SET inside_OWNS_id = ? WHERE id IN "; // concat w/ selection: 
    queries.update.set_piloting = "UPDATE EVE2_Players SET piloting_OWNS_id = ? WHERE id = ?";
    queries.update.set_location = "UPDATE EVE2_OWNS SET EVE2_OWNS.location = ? WHERE id = ?";
    queries.update.set_location_selection = "UPDATE EVE2_OWNS SET EVE2_OWNS.location = ? WHERE id IN "; // concat with selection

    queries.delete.del_player = "DELETE FROM EVE2_Players WHERE id = ?";
    queries.delete.del_CONTAINS = "DELETE FROM EVE2_CONTAINS WHERE id = ?";
    queries.delete.del_OCT = "DELETE FROM EVE2_OWNS where id = ?";
    queries.delete.del_item = "DELETE FROM EVE2_Items WHERE id = ?";
    


    queries.insert.insert_items_and_OCTs_into_OCT = ""; // get selection of items and OCTs into a view, and select it. Insert the items for those into the specified container. for reference, also call 'set_inside_of' for containers.
    queries.delete.del_items_in_listed_OCTs = "DELETE CTinv.id FROM EVE2_CONTAINS AS CTinv WHERE CTinv.OWNS_id IS IN ";

    // for displaying containers and items together.
    queries.view.merged_items_in_OCTnum = "CREATE VIEW merged_items_? "
        + "SELECT itemID, itemName, itemType, vol_packed, qty, packaged, NULL, NULL, NULL "
            + "FROM items_in_OCT_? "
        + "UNION "
        + "SELECT itemID, itemName, itemType, "
        + "vol_unpacked, NULL, NULL, OCTid, OCTname, OCT_base_id "
            + "FROM non_CT_items_in_OCT_ ? "
        + "ORDER BY ?, ?";

    queries.view.OCTs_in_OCTnum = "CREATE VIEW OCTs_in_OCT_? AS "; // concat w/ selection of OCTs in OCTnum

    queries.view.non_OCT_items_in_OCTnum = "CREATE VIEW non_CT_items_in_OCT_? AS "
        + "SELECT "
        + "itemID, itemName, itemType, vol_packed, vol_unpacked, qty, packaged "
        + "FROM items_in_OCT_? "
        + "WHERE itemID NOT IN ("; // concat with selection

    queries.view.indy_items = "SELECT "
        + "items.id AS itemID, "
        + "items.name AS itemName "
        + "FROM EVE2_Items as items";

    queries.view.indy_containers = "CREATE VIEW indyCTs_? AS "
        + "SELECT "
            + "CT.id AS CTid, "
            + "CTitem.name AS CTitemName "
            + "FROM EVE2_Containers AS CT "
            + "INNER JOIN EVE2_Items as CTitem ON CTitem.id = CT.item_id";

    queries.view.items_in_OCTnum = "CREATE VIEW items_in_OCT_? AS "; // concat with selection of items in OCT

    return queries;
}();
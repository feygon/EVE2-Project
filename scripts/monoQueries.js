var monoQueries = {};
monoQueries.create_table_CS_aggregate = {};
monoQueries.create_table_obj_aggregate = {};
monoQueries.getShipContents = {};
monoQueries.getStationContents = {};


monoQueries.create_table_CS_aggregate = "DROP TABLE IF EXISTS temp_CS_aggregate; "
    + " CREATE TABLE temp_CS_aggregate as SELECT id FROM EVE2_CargoSpace WHERE id = ?";
monoQueries.create_table_obj_aggregate = "DROP TABLE IF EXISTS temp_obj_aggregate; "
    + " CREATE TABLE temp_obj_aggregate as "
    + " SELECT obj.id FROM EVE2_Objects as obj "
    + " WHERE obj.cargoSpace_id in (SELECT * FROM temp_CS_aggregate)";

    //CALL SP_insert_station_deep()
    //CALL SP_insert_ship_deep()

monoQueries.onboardCargoSpaces = "SELECT "
        + " CS.name, "
        + " CS.id as CSid, "
        + " IU.scale, "
        + " IU.capacity, "
        + " IU.pilotable, "
        + " Obj.cargoSpace_id as NestID, "
        + " Obj.id as ObjID, "
        + " outerCS.name as NestName, "
        + " objectCounter.num as contentsCount "
    + " FROM EVE2_CargoSpace as CS "
    + " INNER JOIN EVE2_ItemUse as IU ON CS.itemUse_id = IU.id "
    + " LEFT JOIN EVE2_Objects as Obj ON CS.object_id = Obj.id "
    + " LEFT JOIN EVE2_CargoSpace as outerCS ON Obj.cargoSpace_id = outerCS.id "
    + " LEFT JOIN ( "
        + " SELECT count(id) as num, cargoSpace_id as CSid FROM EVE2_Objects GROUP BY cargoSpace_id"
    + " ) as objectCounter ON CS.id = objectCounter.CSid "
    + " WHERE CS.id IN ("
        + " SELECT id FROM temp_CS_aggregate"
    + " )";

monoQueries.onboardCargoSpaces_ByScale = "SELECT "
    + " CS.name, "
    + " CS.id as CSid, "
    + " IU.scale, "
    + " IU.capacity, "
    + " IU.pilotable, "
    + " Obj.cargoSpace_id as NestID, "
    + " Obj.id as ObjID, "
    + " outerCS.name as NestName, "
    + " objectCounter.num as contentsCount "
+ " FROM EVE2_CargoSpace as CS "
+ " INNER JOIN EVE2_ItemUse as IU ON CS.itemUse_id = IU.id "
+ " LEFT JOIN EVE2_Objects as Obj ON CS.object_id = Obj.id "
+ " LEFT JOIN EVE2_CargoSpace as outerCS ON Obj.cargoSpace_id = outerCS.id "
+ " LEFT JOIN ( "
    + " SELECT count(id) as num, cargoSpace_id as CSid FROM EVE2_Objects GROUP BY cargoSpace_id"
+ " ) as objectCounter ON CS.id = objectCounter.CSid "
+ " WHERE CS.id IN ("
    + " SELECT id FROM temp_CS_aggregate"
+ " ) AND (IU.scale = ? OR IU.scale = 'Space Station')";

monoQueries.onboardObjects = "SELECT "
        + " IStr.name as structureName, "
        + " IStr.vol_packed, "
        + " IStr.vol_unpacked, "
        + " IStr.type, "
        + " Obj.id as objectID, "
        + " Obj.cargoSpace_id as inside_CSid, "
        + " Obj.quantity, " 
        + " Obj.packaged, "
        + " IU.pilotable, "
        + " IU.capacity, "
        + " IU.scale, "
        + " CS.id as CSid, "
        + " CS.name as CSName "
    + " FROM EVE2_Objects as Obj "
    + " INNER JOIN EVE2_ItemStructure as IStr ON Obj.itemStructure_id = IStr.id "
    + " LEFT JOIN EVE2_ItemUse as IU ON IStr.id = IU.itemStructure_id "
    + " LEFT JOIN EVE2_CargoSpace as CS ON Obj.id = CS.object_id "
    + " WHERE Obj.id IN ("
        + " SELECT id FROM temp_obj_aggregate"
    + " )";

monoQueries.onboardObjects_ByType = "SELECT "
+ " IStr.name as structureName, "
+ " IStr.vol_packed, "
+ " IStr.vol_unpacked, "
+ " IStr.type, "
+ " Obj.id as objectID, "
+ " Obj.cargoSpace_id as inside_CSid, "
+ " Obj.quantity, " 
+ " Obj.packaged, "
+ " IU.pilotable, "
+ " IU.capacity, "
+ " IU.scale, "
+ " CS.id as CSid, "
+ " CS.name as CSName "
+ " FROM EVE2_Objects as Obj "
+ " INNER JOIN EVE2_ItemStructure as IStr ON Obj.itemStructure_id = IStr.id "
+ " LEFT JOIN EVE2_ItemUse as IU ON IStr.id = IU.itemStructure_id "
+ " LEFT JOIN EVE2_CargoSpace as CS ON Obj.id = CS.object_id "
+ " WHERE Obj.id IN ("
+ " SELECT id FROM temp_obj_aggregate"
+ " ) AND IStr.type = ?" ;
module.exports = monoQueries;

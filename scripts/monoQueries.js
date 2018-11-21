var monoQueries = {};
monoQueries.create_view_CS_aggregate = {};
monoQueries.create_view_obj_aggregate = {};
monoQueries.getShipContents = {};
monoQueries.getStationContents = {};


monoQueries.create_view_CS_aggregate = "CREATE VIEW view_CS_aggregate as SELECT id FROM ?";
monoQueries.create_view_obj_aggregate = "CREATE VIEW view_obj_aggregate as "
    + " SELECT obj.id FROM EVE2_Objects as obj "
    + " WHERE obj.cargoSpace_id in (SELECT * FROM view_CS_aggregate)";

    //CALL SP_insert_station_deep()
    //CALL SP_insert_ship_deep()

monoQueries.onboardCargoSpaces = "SELECT id FROM view_CS_aggregate";
monoQueries.onboardObjects = "SELECT id FROM view_obj_aggregate";

module.exports = monoQueries;

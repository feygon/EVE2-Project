use CS340_nickersr;

DROP PROCEDURE IF EXISTS SP_insert_ship_deep;
DROP PROCEDURE IF EXISTS SP_insert_station_deep;

DELIMITER //

DROP PROCEDURE IF EXISTS SP_insert_ship_deep //
CREATE PROCEDURE SP_insert_ship_deep()
BEGIN
    INSERT INTO view_CS_aggregate (id)  
        SELECT CS.id FROM EVE2_CargoSpace as CS
            WHERE CS.object_id IN (
                SELECT id FROM view_obj_aggregate
            );

    INSERT INTO view_obj_aggregate (id)
        SELECT obj.id FROM EVE2_Objects as obj
            WHERE obj.cargoSpace_id IN (
                SELECT id FROM view_CS_aggregate
            );
END //


DROP PROCEDURE IF EXISTS SP_insert_station_deep //
CREATE PROCEDURE SP_insert_station_deep()
BEGIN
    INSERT INTO view_CS_aggregate (id)  
        SELECT CS.id FROM EVE2_CargoSpace as CS
            WHERE CS.object_id IN (
                SELECT id FROM view_obj_aggregate
            );

    INSERT INTO view_obj_aggregate (id)
        SELECT obj.id FROM EVE2_Objects as obj
            WHERE obj.cargoSpace_id IN (
                SELECT id FROM view_CS_aggregate
            );

    DROP VIEW if exists temp;
    CREATE VIEW temp as SELECT id FROM view_CS_aggregate;

    INSERT INTO view_CS_aggregate (id)
        SELECT CS.id FROM EVE2_CargoSpace as CS
            WHERE CS.object_id IN (
                SELECT id FROM view_obj_aggregate
            ) AND NOT IN (
                SELECT id FROM temp
            );

    DROP VIEW IF EXISTS temp;
    CREATE VIEW temp as SELECT id FROM view_obj_aggregate;

    INSERT INTO view_obj_aggregate (id)
        SELECT obj.id FROM EVE2_Objects as obj
            WHERE obj.cargoSpace_id IN (
                SELECT id FROM view_CS_aggregate
            ) AND NOT IN (
                SELECT id FROM temp
            );

    DROP VIEW IF EXISTS temp;
END //





DELIMITER ;
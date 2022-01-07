/**
 * planning on adding data to retrieve cities, stations, bikes etc
 *
*/
const database = require("../db/database.js");

const city = {
    /*
        get all cities
    */
    getAllCities: function (res) {
        let db;

        db = database.getDb();

        let sql = `SELECT * FROM city;`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        path: "/city",
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            return res.status(200).json({
                "data": rows
            });
        });
    },
    /*
        get all stations and bikes in city with id id
    */
    getCityById: function (res, req) {
        let db;

        db = database.getDb();

        let cityId = req.params.id;

        var sqlBike = `SELECT * from BIKE
                        WHERE cityid = ?;`;
        var paramsBike = [cityId];

        //get all bikes in city with id = id
        let getBikes = function(callback) {
            db.all(sqlBike, paramsBike, function(err, rows) {
                callback(err, rows);
            });
        };

        //get bike information (callback to be able to use it further down)
        //and use it together with station info
        getBikes(function(err, bikes) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: `/v1/city${req.path}`,
                        message: "Error retrieving bike information",
                        detail: err.message
                    }
                });
            }

            return city.getCityStations(res, req, bikes, cityId, db);
        });
    },
    getCityStations: function (res, req, bikes, cityId, db) {
        var sqlStation = `SELECT * from STATION
                        WHERE cityid = ? or cityid = ?;`;
        var paramsStation = [cityId, -1];

        let cityInfo = [];
        let i = 0;

        db.all(sqlStation, paramsStation, (error, rows) => {
            if (error) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: `/v1/city${req.path}`,
                        message: "Error retrieving station information",
                        detail: error.message
                    }
                });
            }

            //if rows only contain one station it is -1 and
            //if city also has no bikes
            //then the city in question does not exist
            if (rows.length <= 1 && bikes.length == 0) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        source: `/v1/city${req.path}`,
                        message: "No such city",
                        detail: "No city with that id exists"
                    }
                });
            }

            //for each station, add the corresponding bikes
            rows.forEach((row) => {
                //get bikes
                let stationBikes = bikes.filter(bike => bike.stationid == row.stationid);

                let newObj = {
                    stationid: row.stationid,
                    type: row.type,
                    address: row.address,
                    gps_lat: row.gps_lat,
                    gps_lon: row.gps_lon,
                    bikes: stationBikes
                };

                cityInfo[i] = newObj;

                i++;
            });

            return res.status(200).json({
                data: cityInfo
            });
        });
    },
    /*
        get all stations in city with id cityId
    */
    getStations: function (res, req) {
        let db;
        let cityId = req.params.id;

        db = database.getDb();

        var sql ='SELECT * from STATION WHERE cityid=?;';
        var params =[cityId];

        db.all(sql, [params], (err, rows) => {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        path: `/city${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            return res.status(200).json({
                "data": rows
            });
        });
    },
    /*
        get all bikes in city with id cityId
    */
    getBikes: function (res, req) {
        let db;
        let cityId = req.params.id;

        db = database.getDb();
        var sql = `select bikeid, name, image, description, status,
        battery_level, gps_lat, gps_lon, stationid from bike
        where cityid = ?;`;

        var params =[cityId];

        db.all(sql, [params], (err, rows) => {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        path: `/city${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            return res.status(200).json({
                "data": rows
            });
        });
    }
};

module.exports = city;

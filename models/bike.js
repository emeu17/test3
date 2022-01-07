/**
 * planning on adding data to retrieve cities, stations, bikes etc
 *
*/
const database = require("../db/database.js");

let config;

try {
    config = require('../config/config.json');
} catch (error) {
    console.error(error);
}

const bike = {
    //get Bike with specific id
    getSpecificBike: function (res, req) {
        let db;

        db = database.getDb();

        var sql =`SELECT * from bike, city WHERE bikeid = ? AND bike.cityid = city.cityid;`;
        var params =[req.params.id];

        db.get(sql, params, function (err, row) {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        path: `/bike${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            //check if row exists ie id exists
            return row
                ? res.status(200).json({
                    "data": row
                })
                : res.status(404).json({
                    errors: {
                        status: 404,
                        path: `/bike${req.path}`,
                        title: "Not found",
                        message: "The bike is not found"
                    }
                });
        });
    },
    //update bike with specific id
    updateSpecificBike: function (res, req) {
        var errors=[];

        if (!req.body.gps_lat || !req.body.gps_lon) {
            errors.push("Position missing: gps_lat or gps_lon");
        }
        if (!req.body.stationid) {
            errors.push("Need to specify stationid");
        }
        if (!req.body.status) {
            errors.push("Need to specify status");
        }
        if (errors.length) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    source: `/v1/bike${req.path}`,
                    message: "Missing input",
                    detail: errors.join(", ")
                }
            });
        }

        let db;

        db = database.getDb();

        var sql =`UPDATE bike set
        gps_lat = ?,
        gps_lon = ?,
        stationid = ?,
        status = ?
        WHERE bikeid = ?;`;
        var params = [
            req.body.gps_lat,
            req.body.gps_lon,
            req.body.stationid,
            req.body.status,
            req.params.id
        ];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: `/v1/bike${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }

            if (this.changes > 0) {
                return res.status(200).json({
                    data: {
                        message: "Bike updated",
                        bikeid: req.params.id
                    }
                });
            }

            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/bike${req.path}`,
                    title: "Not found",
                    message: "The bike was not found"
                }
            });
        });
    },

    //get system mode, simulation = true or false
    getSystemMode: function (res) {
        var data = {
            "interval": config.interval,
            "simulation": config.simulation,
            "nr_of_bikes": config.nr_of_bikes,
        };

        return res.status(200).json({"data": data});
    }
};

module.exports = bike;

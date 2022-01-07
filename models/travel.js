/**
 * planning on adding data concerning travel
 *
*/
const database = require("../db/database.js");

let rentQueue = [];
let rentList = [];

const travel = {
    /*
        get all travels for a certain customer
    */
    getCustomerTravel: function (res, req) {
        let db;

        db = database.getDb();

        //check which customer is logged in
        let loggedInCustomerId = req.user.id;

        //if a request is sent to view any other customers data except the
        //customers own data, it will be denied.
        if (loggedInCustomerId != req.params.id) {
            return res.status(400).json({
                errors: {
                    status: 401,
                    path: `/v1/travel${req.path}`,
                    title: "Unauthorized",
                    message: "Current user is not authorized to view data from other users",
                }
            });
        }

        var sql ='SELECT * from travel_history WHERE userid = ?;';
        var params =[req.params.id];

        db.all(sql, params, function (err, rows) {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        path: `/v1/travel${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            //check if row exists ie id exists, otherwise no travels has occurred
            if (rows) {
                //if a message should be sent when there are no travels:
                // if (rows.length == 0) {
                //     return res.status(200).json({
                //         "data": "No travels to show yet."
                //     });
                // }
                return res.status(200).json({
                    "data": rows
                });
            }
            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/travel${req.path}`,
                    title: "Not found",
                    message: "Customer not found"
                }
            });
        });
    },
    /* the customer simulation can rent a bike */
    rentBikeSimulation: function(res, req) {
        //get customerid into user.id
        req.user = {};
        req.user.id = req.body.customerid;
        //add bikeid as params
        req.params.bikeid = req.body.bikeid;
        //done in order to use rentBike-function as-is
        travel.rentBike(res, req);
    },
    /*
        rent a bike,
        first check if bike exists, then
        if its available = vacant.
        Then add customer id + bike id to queue.
        Update bike status from vacant to rented
    */
    rentBike: function (res, req) {
        /* Check if bike is available */
        let db;

        db = database.getDb();

        var sql ='SELECT * from bike WHERE bikeid = ?;';
        var params =[req.params.bikeid];

        db.get(sql, params, function (err, row) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: `/v1/travel${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            //check if row exists ie bikeId exists
            return row
                ? travel.createTravel(res, req, row, db)
                : res.status(400).json({
                    errors: {
                        status: 400,
                        path: `/v1/travel${req.path}`,
                        title: "Bad request",
                        message: "The bike is not found"
                    }
                });
        });
    },

    /*
        create travel if bikeId exists
        and if bike is available
    */
    createTravel: function(res, req, bike, db) {
        //check which customer is logged in

        //TEST then get id from body, need to remove auth.checkToken in route
        // let loggedInCustomerId = (req.body.test) ? req.body.userid : req.user.id;

        let loggedInCustomerId = req.user.id;

        //check if bike is available = vacant
        if (bike.status != 'vacant') {
            return res.status(400).json({
                errors: {
                    status: 400,
                    path: `/v1/travel${req.path}`,
                    title: "Bad request",
                    message: `The bike is currently not available, bike status: ${bike.status}`
                }
            });
        }

        let bikeId = bike.bikeid;

        //change status of bike to "rented" och lägg till i kön
        //över uthyrda cyklar
        var sql = `UPDATE bike set status='rented' where bikeid = ?;`;
        var params =[bikeId];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: `/v1/travel${req.path}`,
                        message: `Error updating bike with id ${bikeId}`,
                        detail: err.message
                    }
                });
            }

            // hämta dessa värden nu från bike
            // dvs hämtar före resan, blir
            // mer data att spara i API:t men
            // en mindre select mot db efter resan

            let newEvent = {
                customerid: loggedInCustomerId,
                bikeid: bikeId,
                timestamp: new Date(),
                cityid: bike.cityid,
                battery_capacity: bike.battery_capacity,
                gps_lat_start: bike.gps_lat,
                gps_lon_start: bike.gps_lon,
                gps_lat: bike.gps_lat,
                gps_lon: bike.gps_lon,
                start_station: bike.stationid,
            };


            //add travel to rentQueue
            rentQueue.unshift(newEvent);

            // console.log("added travel:");
            // console.log(rentQueue);

            return res.status(201).json({
                data: {
                    type: "success",
                    message: `Bike rented`,
                    bikeid: bikeId
                }
            });
        });
    },

    /*
        route returns all newly rented bikes,
        empties that queue and add those bikes to
        the rent-list. Ie:
        - store all bikeids in a temporary array
        - copy data from rentQueue to rentList
        - empty rentQueue
        - return all bikeid's from rentQueue
    */
    getRentQueue: function(res) {
        //temporary array for bikeids
        let bikeids = [];

        //add bikeids to temporary array to return,
        //add rentQueue objects to rentList
        rentQueue.map(element => {
            bikeids.push(element.bikeid);
            rentList.push(element);
        });

        //empty rentQueue
        rentQueue = [];

        // console.log(rentList);

        //return list of bikeids
        return res.status(200).json(bikeids);
    },
    /*
        customer ends bike rental
        bike ride saved and variable customerCancel
        is set to "true"
    */
    returnBike: function (res, req) {
        //TEST loggedInCustomerId = req.body.userid,
        //TEST need to remove checkToken in route
        let loggedInCustomerId = req.user.id;
        let bikeId = req.params.bikeid;

        //check if bike is in rentList
        let bikeIndex = rentList.findIndex(v => v.bikeid == bikeId);

        if (bikeIndex < 0) {
            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/travel${req.path}`,
                    title: "Not found",
                    message: "Bike not found"
                }
            });
        }

        //check that logged in customer is the same as the one
        //who had rented the bike in question
        if (rentList[bikeIndex].customerid == loggedInCustomerId) {
            //add a variable to bike in rentList
            //customerCancel = that customer has
            //canceled the ride
            let bike = rentList[bikeIndex];

            bike.customerCancel = 'true';

            return travel.cancelBike(res, req, bike, bikeIndex);
        }

        return res.status(404).json({
            errors: {
                status: 404,
                path: `/v1/travel${req.path}`,
                title: "Not found",
                message: `This customer has not rented bike with id ${bikeId}`
            }
        });
    },
    /*
        Update bike info
        If canceled = true then remove bike
        from rent-list
    */
    updateBike: function (res, req) {
        //check input
        var errors=[];

        if (!req.body.battery_level) {
            errors.push("No battery_level specified");
        }
        if (!req.body.gps_lat || ! req.body.gps_lon) {
            errors.push("No gps coordinates specified");
        }
        if (!req.body.rent_time) {
            errors.push("No rent_time specified");
        }
        if (!req.body.canceled) {
            errors.push("Not specified if ride is canceled or not");
        }
        if (!req.body.destination_reached) {
            errors.push("Not specified if destionation is reached");
        }
        //if any of the above information is missing,
        //return error message
        if (errors.length) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    path: `/v1/travel${req.path}`,
                    title: "Missing input information",
                    message: errors.join(",")
                }
            });
        }

        let bikeId = req.params.bikeid;

        //TEST
        // rentList = [
        //     {
        //         customerid: '2',
        //         bikeid: '2',
        //         cityid: '2',
        //         timestamp: new Date(),
        //         battery_capacity: 4000,
        //         gps_lat_start: 500.5,
        //         gps_lon_start: 600.6,
        //         start_station: 2,
        //
        //     },
        //     {
        //         customerid: '1',
        //         bikeid: '1',
        //         cityid: '1',
        //         timestamp: new Date(),
        //         battery_capacity: 8000,
        //         gps_lat_start: 200.2,
        //         gps_lon_start: 100.23,
        //         start_station: -1,
        //     }
        // ];

        //check if bike is in rentList
        let bikeIndex = rentList.findIndex(v => v.bikeid == bikeId);

        if (bikeIndex < 0) {
            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/travel${req.path}`,
                    title: "Not found",
                    message: "Bike not found"
                }
            });
        }

        let canceled = req.body.canceled;

        //update bike
        let bike = rentList[bikeIndex];

        //if customer has canceled bike,
        //the travel has already been saved to DB
        //remove the bike from rentList and
        //send back response with canceling-status
        if (bike.customerCancel) {
            canceled = 'true';

            rentList.splice(bikeIndex, 1);

            return res.status(200).json({
                data: {
                    type: "success",
                    message: "Bike canceled by customer",
                    bikeid: bike.bikeid,
                    canceled: canceled
                }
            });
        }

        bike.battery_level = req.body.battery_level;
        bike.gps_lat = req.body.gps_lat;
        bike.gps_lon = req.body.gps_lon;
        bike.rent_time = req.body.rent_time;
        bike.canceled = canceled;
        bike.destination_reached = req.body.destination_reached;

        //ending bike ride if cancel is true
        if (canceled == 'true') {
            return travel.cancelBike(res, req, bike, bikeIndex);
        }

        //otherwise send back that bike is updated
        //ie data only saved locally in API rentList
        return res.status(200).json({
            data: {
                type: "success",
                message: "Bike updated",
                bikeid: bike.bikeid,
                canceled: canceled
            }
        });
    },
    /*
        Cancel bike ride.
        First check if bike has reached destination,
        if so check if it is returned
        at a station. Do this with a callback
        as station info is needed to update bike.
        Update bike and add travel_history in DB,
        then remove bike from rentList
    */
    cancelBike: function(res, req, bike, bikeIndex) {
        let db;

        db = database.getDb();

        //if bike has not reached destination, assume
        //that it has not been left at a station, thus
        //no need to check against DB for station
        if (bike.destination_reached != 'true') {
            bike.end_station = -1;
            return travel.updateTravel(res, req, bike, bikeIndex, db);
        }

        var sqlStation = `SELECT * from STATION
                        WHERE gps_lat = ? and gps_lon = ?;`;
        var paramsStation = [bike.gps_lat, bike.gps_lon];

        //check if bike is returned at a station
        let getStation = function(callback) {
            db.get(sqlStation, paramsStation, function(err, row) {
                callback(err, row);
            });
        };

        //get station information (callback to be able to use it further down)
        //and use it to update bike
        getStation(function(err, station) {
            if (err) {
                return res.status(400).json({
                    errors: {
                        status: 400,
                        source: `/v1/travel${req.path}`,
                        message: "Error retrieving station information",
                        detail: err.message
                    }
                });
            }

            //if bike is at a station, retrieve stationid. Otherwise set it to -1
            bike.end_station = -1;
            //if bike is at a station, retrieve what type of station it is
            //used for calculating price of travel
            if (station) {
                bike.end_station = station.stationid;
                //if bike is returned at a charging station assume
                //battery charge to 100% instantly
                if (station.type == 'charge') {
                    bike.battery_level = bike.battery_capacity;
                }
            }

            return travel.updateTravel(res, req, bike, bikeIndex, db);
        });
    },
    /*
        update bike-table
        add new row to travel_history
    */
    updateTravel: function(res, req, bike, bikeIndex, db) {
        //calculate price of travel TODO
        bike.price = travel.calcTravelPrice(bike);

        // console.log("price for travel:");
        // console.log(bike.price);

        //update bike status to 'vacant' and set new pos, battery etc
        //insert new travel into travel_history
        var sqlBike = `UPDATE BIKE
                        set status = 'vacant',
                        battery_level = ?,
                        gps_lat = ?,
                        gps_lon = ?,
                        stationid = ?
                        where bikeid = ?;`;
        var sqlTravel = `INSERT INTO travel_history
                        (date_start, bikeid, userid,
                        travel_time, price,
                        gps_lat_start, gps_lon_start,
                        gps_lat_end, gps_lon_end)
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        //get date-time in yyyy-mm-dd hh:mm:ss
        bike.startDate = bike.timestamp.toISOString().slice(0, 19).replace(/T/g, ' ');

        var paramsBike = [
            bike.battery_level,
            bike.gps_lat,
            bike.gps_lon,
            bike.end_station,
            bike.bikeid
        ];

        var paramsTravel = [
            bike.startDate,
            bike.bikeid, bike.customerid,
            bike.rent_time, bike.price,
            bike.gps_lat_start, bike.gps_lon_start,
            bike.gps_lat, bike.gps_lon
        ];

        //update bike and travel_history tables
        db.parallelize(() => {
            db.run(sqlBike, paramsBike)
                .run(sqlTravel, paramsTravel, (err) => {
                    if (err) {
                        return res.status(400).json({
                            errors: {
                                status: 400,
                                source: `/v1/travel${req.path}`,
                                message: "Error adding travel",
                                detail: err.message
                            }
                        });
                    }
                    //if esc has canceled ride:
                    //when bike is updated and travel_history has been added,
                    //remove bike from rentList
                    //if customer has canceled ride leave it
                    //in order for esc to get canceling-status
                    if (!bike.customerCancel) {
                        rentList.splice(bikeIndex, 1);
                    }

                    //bike and travel_history has been updated,
                    //send back OK-response
                    return res.status(200).json({
                        data: {
                            type: "success",
                            message: "Bike ride canceled",
                            bikeid: bike.bikeid
                        }
                    });
                });
        });
    },
    /*
        calculate the price of the bike travel
    */
    calcTravelPrice: function(bike) {
        /* Från kravet:
          "Varje resa som en kund gör kostar pengar, dels en fast taxa och en rörlig taxa per
          tidsenhet och en taxa beroende av var de parkerar."
          "Om en kund tar en cykel som står på fri parkering -
          och lämnar på en definierad parkering -
          så blir startavgiften lite lägre"
          "Cyklar kan även parkeras utanför laddstationer och utanför accepterade platser,
           men det kan då tillkomma en extra avgift för kunden. Detta kallas fri parkering."
           Finns 3 scenario:
           1 kunden hämtar på free parking och lämnar på station - lägre startavgift
           2 kunden hämtar valfritt men lämnar på free parking - extra avgift för free parkering
           3 kunden hämtar på station och lämnar på station - inga +/- avgift
           Calculation of travel cost
           cost = startFee + pricePerSecond * rent_time +
                    priceFreeParking(park outside station) -
                    startFeeDecrease(if parking at station but getting bike outside of station)
        */

        /*
         https://www.expressen.se/dinapengar/konsument/
         hyra-elscooter-har-ar-reglerna-och-vad-det-kostar/
         Valde: 10 kronor att låsa upp samt 3 kronor per minut.
        */

        let price = 0;
        let startFee = 10;
        let pricePerSecond = 0.05;
        let priceFreeParking = 10;
        let startFeeDecrease = 5;

        price += startFee + pricePerSecond * bike.rent_time;

        //if parking at a station
        if (bike.end_station > 0) {
            //if customer has retrieved a bike outside of a station
            if (bike.start_station < 0) {
                console.log("retrieving bike outside of station");
                price -= startFeeDecrease;
            }
            // if customer gets and retrieves at station
            // no extra is added/subtracted from price
            return price;
        }

        //if end station is not a station ("free parking"), add extra fee
        price += priceFreeParking;
        return price;
    },

    /*
        Get all rented bikes in a specific city
        ie bikes in rentList
    */
    getRentedBikes: function (res, req) {
        //TEST
        // rentList = [
        //     {
        //         customerid: 2,
        //         bikeid: 3,
        //         timestamp: 1638954124713,
        //         cityid: 1,
        //         battery_capacity: 9000,
        //         gps_lat_start: 500.1,
        //         gps_lon_start: 500.1,
        //         start_station: 1,
        //         battery_level: '222',
        //         gps_lat: '456.456',
        //         gps_lon: '500.5',
        //         rent_time: '200',
        //         canceled: 'false',
        //         destination_reached: 'false'
        //     },
        //     {
        //         customerid: 3,
        //         bikeid: 4,
        //         timestamp: 1638954124713,
        //         cityid: 2,
        //         battery_capacity: 9000,
        //         gps_lat_start: 100.1,
        //         gps_lon_start: 100.1,
        //         start_station: 1,
        //         battery_level: '222',
        //         gps_lat: '456.456',
        //         gps_lon: '500.5',
        //         rent_time: '200',
        //         canceled: 'false',
        //         destination_reached: 'false'
        //     }
        // ];

        let cityId = req.params.id;
        let currBikes = [];

        rentList.map(element => {
            if (element.cityid == cityId) {
                // console.log(element.cityid);
                let addBike = {
                    bikeid: element.bikeid,
                    gps_lat: element.gps_lat,
                    gps_lon: element.gps_lon
                };

                currBikes.push(addBike);
            }
        });

        return res.status(200).json({
            data: currBikes
        });
    },
    /*
        get specific customers current rentals
        with bike position
    */
    getCustomerRentals: function(res, req) {
        //check which customer is logged in
        let loggedInCustomerId = req.user.id;

        //if a request is sent to view any other customers data except the
        //customers own data, it will be denied.
        if (loggedInCustomerId != req.params.id) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    path: `/v1/auth${req.path}`,
                    title: "Unauthorized",
                    message: "Current user is not authorized to view data from other users",
                }
            });
        }

        //check if bike is in rentList
        // let custIndex = rentList.findIndex(v => v.customerid == loggedInCustomerId);
        let data = rentList.filter(r => r.customerid == loggedInCustomerId);

        if (data.length == 0) {
            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/travel${req.path}`,
                    title: "Not found",
                    message: "No bikes rented"
                }
            });
        }

        return res.status(200).json({
            data
        });
    }
};

module.exports = travel;

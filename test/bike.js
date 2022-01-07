/* global it describe before */

/**
 testing of city-routes
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');

const server = require('../app.js');
const database = require("../db/database.js");

chai.should();

chai.use(chaiHttp);

let config;

try {
    config = require('../config/config.json');
} catch (error) {
    console.error(error);
}

const apiKey = process.env.API_KEY || config.apikey;
const testScript = process.env.TEST_SCRIPT || config.test_script;

describe('bike', () => {
    before(() => {
        return new Promise((resolve) => {
            let db;

            db = database.getDb();

            const dataSql = fs.readFileSync(testScript).toString();

            // Convert the SQL string to array to run one at a time.
            const dataArr = dataSql.toString().split(";");

            //last row is empty, creates a last "empty" ('\n')-element
            dataArr.splice(-1);

            // db.serialize ensures that queries are one after the other
            //depending on which one came first in your `dataArr`
            db.serialize(() => {
                // db.run runs your SQL query against the DB
                db.run("BEGIN TRANSACTION;");
                // Loop through the `dataArr` and db.run each query
                dataArr.forEach(query => {
                    if (query) {
                        // Add the delimiter back to each query
                        //before you run them
                        query += ";";
                        db.run(query, err => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                });
                db.run("COMMIT;");
            });

            console.log("running DB");

            // Close the DB connection
            db.close(err => {
                if (err) {
                    return console.error(err.message);
                }
                resolve();
                // console.log("Closed the database connection.");
            });
        });
    });

    //get info about a specific bike
    describe('GET /v1/bike/{id}', () => {
        it('should get 404 as bikeid does not exist', (done) => {
            chai.request(server)
                .get(`/v1/bike/99?apiKey=${apiKey}`)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Not found");

                    result.should.have.property("message");
                    result.message.should.equal("The bike is not found");

                    done();
                });
        });
        it('should get 200 as we look up a bike', (done) => {
            chai.request(server)
                .get(`/v1/bike/1?apiKey=${apiKey}`)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("bikeid");
                    result.bikeid.should.equal(1);

                    result.should.have.property("cityid");
                    result.cityid.should.equal(2);

                    result.should.have.property("gps_lat");
                    result.should.have.property("gps_lon");

                    done();
                });
        });
    });
    //update a specific bike
    describe('PUT /v1/bike/{id}', () => {
        it('should get 400 as gps_lat is missing in input', (done) => {
            let bikeInfo = {
                // gps_lat: 100,
                gps_lon: 200,
                stationid: -1,
                status: "rented"
            };

            chai.request(server)
                .put(`/v1/bike/2?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");

                    result.should.have.property("detail");
                    result.detail.should.equal("Position missing: gps_lat or gps_lon");

                    done();
                });
        });
        it('should get 400 as stationid is missing in input', (done) => {
            let bikeInfo = {
                gps_lat: 100,
                gps_lon: 200,
                // stationid: -1,
                status: "rented"
            };

            chai.request(server)
                .put(`/v1/bike/2?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");

                    result.should.have.property("detail");
                    result.detail.should.equal("Need to specify stationid");

                    done();
                });
        });
        it('should get 400 as status is missing in input', (done) => {
            let bikeInfo = {
                gps_lat: 100,
                gps_lon: 200,
                stationid: -1,
                // status: "rented"
            };

            chai.request(server)
                .put(`/v1/bike/2?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");

                    result.should.have.property("detail");
                    result.detail.should.equal("Need to specify status");

                    done();
                });
        });

        it('should get 404 as bikeid does not exist', (done) => {
            let bikeInfo = {
                gps_lat: 100,
                gps_lon: 200,
                stationid: -1,
                status: "rented"
            };

            chai.request(server)
                .put(`/v1/bike/99?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Not found");

                    result.should.have.property("message");
                    result.message.should.equal("The bike was not found");

                    done();
                });
        });

        it('should get 200 as we look up a bike', (done) => {
            let bikeInfo = {
                gps_lat: 100,
                gps_lon: 200,
                stationid: -1,
                status: "rented"
            };

            chai.request(server)
                .put(`/v1/bike/2?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("bikeid");
                    result.bikeid.should.equal("2");

                    result.should.have.property("message");
                    result.message.should.equal("Bike updated");

                    done();
                });
        });
    });
    //get system mode - parameters for api updates etc
    describe('GET /v1/bike/mode', () => {
        it('should get status 200', (done) => {
            chai.request(server)
                .get(`/v1/bike/mode?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("interval");
                    result.should.have.property("simulation");
                    done();
                });
        });
    });
});

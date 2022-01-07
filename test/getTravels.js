/* global it describe before */

/**
 testing of Travel-routes,
 getting all travels of a certain customer (auth route)
 getting all current bikes rented out (city route)
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');

const database = require("../db/database.js");
const server = require('../app.js');

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

let token = "";

describe('getTravels', () => {
    //https://stackoverflow.com/questions/24723374/
    //async-function-in-mocha-before-is-alway-finished-before-it-spec
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

    //get list of all bikes that are rented out in city with id {id}
    describe('GET /v1/city/{id}/bike/rented', () => {
        //rent a bike
        it('should get 201 as we rent a bike', (done) => {
            let customer = {
                customerid: 2,
                bikeid: 2
            };

            chai.request(server)
                .post(`/v1/travel/simulation?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("type");
                    reply.type.should.equal("success");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike rented");
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(customer.bikeid);
                    done();
                });
        });
        //rent another bike
        it('should get 201 as we rent a bike', (done) => {
            let customer = {
                customerid: 4,
                bikeid: 4
            };

            chai.request(server)
                .post(`/v1/travel/simulation?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("type");
                    reply.type.should.equal("success");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike rented");
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(customer.bikeid);
                    done();
                });
        });
        //get rentQueue
        it('should get 200 as we get the rentQueue', (done) => {
            chai.request(server)
                .get(`/v1/travel/rented?apiKey=${apiKey}`)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("array");

                    let reply = res.body;

                    reply.should.contain(2);
                    done();
                });
        });
        //get all bikes (ie both above) in city wiht id 3
        it('should get 200 as we get all bikes rented out in city 3', (done) => {
            chai.request(server)
                .get(`/v1/city/3/bike/rented?apiKey=${apiKey}`)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.lengthOf(2);
                    reply[0].should.have.property("bikeid");
                    reply[0].should.have.property("gps_lat");
                    reply[0].should.have.property("gps_lon");
                    done();
                });
        });
    });
    //
    // //get list of rented bikes of a logged in customer
    describe('GET /v1/auth/customer/{id}/rented', () => {
        it('should get 200 login customer', (done) => {
            let customer = {
                email: "test@test.se",
                password: "test123",
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(200);

                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User logged in");

                    result.should.have.property("user");
                    result.user.should.equal("test@test.se");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        //see customers rented bike(s) - at the moment no bikes rented by customer
        it('should get 404 as no bikes are rented by the customer yet', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer/1/rented?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Not found");
                    reply.should.have.property("message");
                    reply.message.should.equal("No bikes rented");
                    done();
                });
        });
        //rent bike with id 3
        it('should get 201 as we rent a bike', (done) => {
            chai.request(server)
                .post(`/v1/travel/bike/3?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("type");
                    reply.type.should.equal("success");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike rented");
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(3);
                    done();
                });
        });

        //get rentQueue
        it('should get 200 as we get the rentQueue', (done) => {
            chai.request(server)
                .get(`/v1/travel/rented?apiKey=${apiKey}`)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("array");

                    let reply = res.body;

                    reply.should.contain(3);
                    done();
                });
        });

        //try seeing another customers rented bike(s)
        it('should get 401 as we try to check which bikes another customer has rented', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer/2/rented?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Unauthorized");
                    done();
                });
        });

        //see logged in customers rented bike(s)
        it('should get 200 as we check which bikes logged in customer has rented', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer/1/rented?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data[0];

                    reply.should.have.property("customerid");
                    reply.customerid.should.equal(1);
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(3);
                    reply.should.have.property("timestamp");
                    reply.should.have.property("cityid");
                    reply.should.have.property("gps_lat");
                    reply.should.have.property("gps_lon");
                    reply.should.have.property("start_station");
                    done();
                });
        });
    });
});

/* global it describe before */

/**
 testing of city-routes
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const emptyDB = require("./emptyDB.js");
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

let token = "";

describe('travel', () => {
    //https://stackoverflow.com/questions/24723374/
    //async-function-in-mocha-before-is-alway-finished-before-it-spec
    before(() => {
        emptyDB.resetDB();
    });

    //get travel history of a logged in customer
    describe('GET /v1/travel/customer/1', () => {
        it('should get 401 as we are not logged in', (done) => {
            let customer = {
                email: "test@test.se",
                password: "test123",
            };

            chai.request(server)
                .get(`/v1/travel/customer/1?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login customer', (done) => {
            let customer = {
                email: "fredrica123@live.com",
                password: "test123"
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
                    result.user.should.equal("fredrica123@live.com");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 400 as we provide token but try to access another customer', (done) => {
            chai.request(server)
                .get(`/v1/travel/customer/1?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Unauthorized");

                    result.should.have.property("message");
                    let message = "Current user is not authorized to view data from other users";

                    result.message.should.equal(message);

                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            chai.request(server)
                .get(`/v1/travel/customer/4?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");

                    let result = res.body.data;

                    result.length.should.equal(3);

                    result[0].should.have.property("userid");
                    result[0].userid.should.equal(4);

                    done();
                });
        });
    });

    //rent a bike as bike-simulator would do
    describe('POST /v1/travel/simulation', () => {
        it('should get 400 as we try renting a non-existent bike', (done) => {
            let customer = {
                customerid: 1,
                bikeid: 99
            };

            chai.request(server)
                .post(`/v1/travel/simulation?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Bad request");
                    reply.should.have.property("message");
                    reply.message.should.equal("The bike is not found");
                    done();
                });
        });

        it('should get 400 as we try renting an already rented bike', (done) => {
            let customer = {
                customerid: 1,
                bikeid: 6
            };

            chai.request(server)
                .post(`/v1/travel/simulation?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Bad request");
                    reply.should.have.property("message");
                    reply.message.should.contain("The bike is currently not available");
                    done();
                });
        });
        it('should get 201 as we rent a bike', (done) => {
            let customer = {
                customerid: 1,
                bikeid: 1
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
    });

    //get rent-queue as bike has been rented
    describe('GET /v1/travel/rented', () => {
        //first rent a bike
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
    });

    //rent a bike as a logged in customer
    describe('POST /v1/travel/bike/{id}', () => {
        it('should get 401 as we are not logged in', (done) => {
            let customer = {
                email: "test@test.se",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/travel/bike/3?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login customer', (done) => {
            let customer = {
                email: "test@test.se",
                password: "test123"
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
    });

    //cancel a bike-ride as a logged in customer
    describe('DELETE /v1/travel/bike/{id}', () => {
        it('should get 401 as we are not logged in', (done) => {
            let customer = {
                email: "isak678@gmail.com",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/travel/bike/4?apiKey=${apiKey}`)
                .send(customer)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login customer', (done) => {
            let customer = {
                email: "isak678@gmail.com",
                password: "test123"
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
                    result.user.should.equal("isak678@gmail.com");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 201 as we rent a bike', (done) => {
            chai.request(server)
                .post(`/v1/travel/bike/7?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("type");
                    reply.type.should.equal("success");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike rented");
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(7);
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

                    reply.should.contain(7);
                    done();
                });
        });

        it('should get 404 as we try return a bike not rented', (done) => {
            chai.request(server)
                .delete(`/v1/travel/bike/6?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Not found");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike not found");
                    done();
                });
        });

        it('should get 404 as we try return a bike rented by another customer', (done) => {
            chai.request(server)
                .delete(`/v1/travel/bike/3?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.have.property("title");
                    reply.title.should.equal("Not found");
                    reply.should.have.property("message");
                    reply.message.should.equal("This customer has not rented bike with id 3");
                    done();
                });
        });

        it('should get 200 as we return/cancel a bike', (done) => {
            chai.request(server)
                .delete(`/v1/travel/bike/7?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    // console.log(res.body);
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("type");
                    reply.type.should.equal("success");
                    reply.should.have.property("message");
                    reply.message.should.equal("Bike ride canceled");
                    reply.should.have.property("bikeid");
                    reply.bikeid.should.equal(7);
                    done();
                });
        });
    });

    //update a bike as bike-simulator would do, then cancel bike ride
    describe('PUT /v1/travel/bike/{id}', () => {
        it('should get 201 as we rent a bike', (done) => {
            let customer = {
                customerid: 4,
                bikeid: 5
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

                    reply.should.contain(5);
                    done();
                });
        });
        //try updating bike but without certain in-parameters
        it('should get 400 as we do not provide battery_level', (done) => {
            let bikeInfo = {
                // battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Missing input information");
                    reply.should.contain.property("message");
                    reply.message.should.equal("No battery_level specified");
                    done();
                });
        });
        it('should get 400 as we do not provide gps_lat', (done) => {
            let bikeInfo = {
                battery_level: 100,
                // gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Missing input information");
                    reply.should.contain.property("message");
                    reply.message.should.equal("No gps coordinates specified");
                    done();
                });
        });
        it('should get 400 as we do not provide rent_time', (done) => {
            let bikeInfo = {
                battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                // rent_time: 50,
                canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Missing input information");
                    reply.should.contain.property("message");
                    reply.message.should.equal("No rent_time specified");
                    done();
                });
        });
        it('should get 400 as we do not provide if bike ride is canceled', (done) => {
            let bikeInfo = {
                battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                // canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Missing input information");
                    reply.should.contain.property("message");
                    reply.message.should.equal("Not specified if ride is canceled or not");
                    done();
                });
        });
        it('should get 400 as we do not provide if bike has reached its destination', (done) => {
            let bikeInfo = {
                battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                canceled: "false",
                // destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Missing input information");
                    reply.should.contain.property("message");
                    reply.message.should.equal("Not specified if destionation is reached");
                    done();
                });
        });
        //try updating a bike that is not rented out (ie not in rentList)
        it('should get 404 as bike is not rented out', (done) => {
            let bikeInfo = {
                battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/6?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors;

                    reply.should.contain.property("title");
                    reply.title.should.equal("Not found");
                    reply.should.contain.property("message");
                    reply.message.should.equal("Bike not found");
                    done();
                });
        });
        //update a bike ride
        it('should get 200 as bike is updated', (done) => {
            let bikeInfo = {
                battery_level: 100,
                gps_lat: 200.0,
                gps_lon: 192.2,
                rent_time: 50,
                canceled: "false",
                destination_reached: "false"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.contain.property("message");
                    reply.message.should.equal("Bike updated");
                    reply.should.contain.property("bikeid");
                    reply.bikeid.should.equal(5);
                    reply.should.contain.property("canceled");
                    reply.canceled.should.equal("false");
                    done();
                });
        });
        //cancel bike ride
        it('should get 200 as bike is canceled', (done) => {
            let bikeInfo = {
                battery_level: 50,
                gps_lat: 100.1,
                gps_lon: 100.1,
                rent_time: 50,
                canceled: "true",
                destination_reached: "true"
            };

            chai.request(server)
                .put(`/v1/travel/bike/5?apiKey=${apiKey}`)
                .send(bikeInfo)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.contain.property("message");
                    reply.message.should.equal("Bike ride canceled");
                    reply.should.contain.property("bikeid");
                    reply.bikeid.should.equal(5);
                    done();
                });
        });
    });
});

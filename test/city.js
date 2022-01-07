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

describe('city', () => {
    before(() => {
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

        // Close the DB connection
        db.close(err => {
            if (err) {
                return console.error(err.message);
            }
            // console.log("Closed the database connection.");
        });
    });

    describe('GET /v1/city', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/city")
                .end((err, res) => {
                    res.should.have.status(401);

                    done();
                });
        });

        it('should get 200 as we do provide an apiKey', (done) => {
            chai.request(server)
                .get(`/v1/city?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should contain an object with city-data', (done) => {
            chai.request(server)
                .get(`/v1/city?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    let reply = res.body;

                    reply.should.be.an("object");
                    reply.data.should.be.an("array");
                    reply.data[1].name.should.be.an("string").that.includes("Sundsvall");
                    reply.data.should.have.lengthOf(4);

                    done();
                });
        });
    });
    describe('GET /v1/city/<id>', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/city/1")
                .end((err, res) => {
                    res.should.have.status(401);

                    done();
                });
        });

        it('should get 200 as we do provide an apiKey', (done) => {
            chai.request(server)
                .get(`/v1/city/1?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should get 400 as we provide apiKey but incorrect cityid', (done) => {
            chai.request(server)
                .get(`/v1/city/100?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("No such city");

                    done();
                });
        });

        it('should contain an object with station and bike-data', (done) => {
            chai.request(server)
                .get(`/v1/city/1?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    let reply = res.body;

                    reply.should.be.an("object");
                    reply.data.should.be.an("array");

                    let bikes = reply.data[0].bikes;

                    bikes.should.be.an("array");

                    bikes[0].name.should.be.a("string").that.equals("cykel6");
                    // reply.data.should.have.lengthOf(4);

                    done();
                });
        });
    });
    describe('GET /v1/city/1/station', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/city/1/station")
                .end((err, res) => {
                    res.should.have.status(401);

                    done();
                });
        });
        it('should get 200 as we do provide an apiKey', (done) => {
            chai.request(server)
                .get(`/v1/city/1/station?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should contain an object with station-data', (done) => {
            chai.request(server)
                .get(`/v1/city/1/station?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    let reply = res.body;

                    reply.should.be.an("object");

                    reply.data[0].address.should.be.an('string').that.equals("Parkering");
                    reply.data.should.have.lengthOf(1);

                    done();
                });
        });
    });

    describe('GET /v1/city/1/bike', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/v1/city/1/bike")
                .end((err, res) => {
                    res.should.have.status(401);

                    done();
                });
        });
        it('should get 200 as we do provide an apiKey', (done) => {
            chai.request(server)
                .get(`/v1/city/1/bike?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);

                    done();
                });
        });

        it('should contain an object with bike-data', (done) => {
            chai.request(server)
                .get(`/v1/city/1/bike?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.be.an("array");
                    reply.should.have.lengthOf(3);
                    reply[0].name.should.be.a('string').that.equals("cykel3");

                    done();
                });
        });
    });
});

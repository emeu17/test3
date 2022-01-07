/* global it describe before */

/**
 testing of index-page
*/

const database = require("../db/testDatabase.js");

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

const fs = require('fs');

chai.should();

chai.use(chaiHttp);

describe('app', () => {
    before(() => {
        let db;

        db = database.getDb();

        const dataSql = fs.readFileSync("test/script/test2_db.sql").toString();

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

    describe('GET /test', () => {
        it('200 HAPPY PATH getting test index page', (done) => {
            chai.request(server)
                .get("/test/")
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('should contain test route description', (done) => {
            chai.request(server)
                .get("/test/")
                .end((err, res) => {
                    res.should.have.status(200);

                    let reply = res.text;

                    reply.should.be.a("string");
                    reply.should.contain("These are the routes for testing the api");

                    done();
                });
        });
    });

    describe('GET /test/data', () => {
        it('should return db-data', (done) => {
            chai.request(server)
                .get(`/test/data`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });
    });

    describe('GET /test/data/:id', () => {
        it('should get HAPPY PATH 200 and return specific row', (done) => {
            chai.request(server)
                .get(`/test/data/1`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.have.property("one");
                    reply.one.should.equal("hello!");

                    done();
                });
        });
    });

    describe('POST /test/data/:id', () => {
        it('should return status 400 as row one is missing', (done) => {
            let newRow = {
                // one: 'testing',
                two: "123"
            };

            chai.request(server)
                .post(`/test/data`)
                .send(newRow)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("error");

                    let reply = res.body.error;

                    reply.should.equal("Column 1 not specified");

                    done();
                });
        });

        it('should return status 400 as row two is missing', (done) => {
            let newRow = {
                one: 'testing',
                // two: "123"
            };

            chai.request(server)
                .post(`/test/data`)
                .send(newRow)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.should.have.property("error");

                    let reply = res.body.error;

                    reply.should.equal("Column 2 not specified");

                    done();
                });
        });

        it('HAPPY PATH 201, should return specific row in db', (done) => {
            let newRow = {
                one: 'testing',
                two: "123"
            };

            chai.request(server)
                .post(`/test/data`)
                .send(newRow)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    done();
                });
        });
    });

    describe('GET /test/db', () => {
        it('should contain Hello World', (done) => {
            chai.request(server)
                .get(`/test/db`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.be.an("object");
                    reply.should.have.property("msg");
                    reply.msg.should.equal("Hello World");

                    done();
                });
        });
    });

    describe('GET /test/hello/:msg', () => {
        it('should contain message sent in', (done) => {
            let message = "testing";

            chai.request(server)
                .get(`/test/hello/${message}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.be.an("object");
                    reply.should.have.property("msg");
                    reply.msg.should.equal(message);

                    done();
                });
        });
    });

    describe('GET /test/hello/:msg/test', () => {
        it('should contain testing + message sent in', (done) => {
            let message = "test-message";

            chai.request(server)
                .get(`/test/hello/${message}/test`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let reply = res.body.data;

                    reply.should.be.an("object");
                    reply.should.have.property("msg");
                    reply.msg.should.equal("testing " + message);

                    done();
                });
        });
    });
});

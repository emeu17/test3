/* global it describe before */

/**
 testing of city-routes
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

describe('staff', () => {
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

    //get all staff
    describe('GET /v1/auth/staff', () => {
        it('should get 401 as we are not logged in', (done) => {
            let staff = {
                email: "test@test.se",
                password: "test123"
            };

            chai.request(server)
                .get(`/v1/auth/staff?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH logging in staff', (done) => {
            let staff = {
                email: "test@test.se",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/staff/login?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("Admin logged in");

                    result.should.have.property("user");
                    result.user.should.equal(staff.email);

                    result.should.have.property("token");
                    token = result.token;
                    done();
                });
        });

        it('should get 200 HAPPY PATH getting all staff info', (done) => {
            chai.request(server)
                .get(`/v1/auth/staff?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.length.should.equal(2);
                    result[0].should.have.property("staffid");
                    result[0].staffid.should.equal(1);

                    result[0].should.have.property("role");
                    result[0].role.should.equal("admin");

                    done();
                });
        });
    });
});

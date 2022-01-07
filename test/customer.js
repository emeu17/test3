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
let nonValidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

describe('customer', () => {
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

    //get all customers, must be a logged in staff
    describe('GET /v1/auth/customer', () => {
        it('should get 401 as we are not logged in', (done) => {
            let staff = {
                email: "test@test.se",
                password: "test123",
            };

            chai.request(server)
                .get(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login staff', (done) => {
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
                    result.user.should.equal("test@test.se");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 400 as we provide non-valid token', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", nonValidToken)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Failed authentication");

                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("array");

                    let result = res.body.data;

                    // result.length.should.equal(7);

                    result[0].should.have.property("userid");
                    result[0].userid.should.equal(1);

                    done();
                });
        });
    });

    //edit a customer by userid, must be a logged in staff
    describe('PUT /v1/auth/customer/2', () => {
        let custId = 2;
        let custIdNonExistent = 11;

        it('should get 401 as we are not logged in', (done) => {
            let custUpdate = {
                firstname: "Konrad",
                lastname: "Magnusson",
                cityid: 2,
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login staff', (done) => {
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
                    result.user.should.equal("test@test.se");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 400 as we provide token but not firstname', (done) => {
            let custUpdate = {
                // firstname: "Konrad",
                lastname: "Magnusson",
                cityid: 2,
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("First or last name not specified");
                    done();
                });
        });

        it('should get 400 as we provide token but not cityid', (done) => {
            let custUpdate = {
                firstname: "Konrad",
                lastname: "Magnusson",
                // cityid: 2,
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Cityid not specified");
                    done();
                });
        });

        it('should get 400 as we provide token but not payment', (done) => {
            let custUpdate = {
                firstname: "Konrad",
                lastname: "Magnusson",
                cityid: 2,
                // payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Payment method or balance missing");
                    done();
                });
        });

        it('should get 404 as we provide token but customer does not exist', (done) => {
            let custUpdate = {
                firstname: "Konrad",
                lastname: "Magnusson",
                cityid: 2,
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custIdNonExistent}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Not found");
                    result.should.have.property("message");
                    result.message.should.equal("The customer is not found");
                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            let custUpdate = {
                firstname: "Konrad",
                lastname: "Magnusson",
                cityid: 2,
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");

                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("Customer updated");
                    result.should.have.property("customerid");
                    result.customerid.should.equal(custId.toString());
                    done();
                });
        });
    });

    //delete a customer by userid, must be a logged in staff
    describe('DELETE /v1/auth/customer/3', () => {
        let custId = 3;
        let custIdNonExistent =10;

        it('should get 401 as we are not logged in', (done) => {
            chai.request(server)
                .delete(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 login staff', (done) => {
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
                    result.user.should.equal("test@test.se");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 404 as we provide token but customer doesnt exist', (done) => {
            chai.request(server)
                .delete(`/v1/auth/customer/${custIdNonExistent}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Not found");
                    result.should.have.property("message");
                    result.message.should.equal(
                        "The customer is not found");

                    done();
                });
        });

        it('should get 204 as we do provide token', (done) => {
            chai.request(server)
                .delete(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });
    });

    //get a specific customer, must be that customer logged in
    describe('GET /v1/auth/customer/2', () => {
        let custId = 2;
        let anotherCustId = 3;

        it('should get 401 as we are not logged in', (done) => {
            let customer = {
                email: "test2@test.se",
                password: "test123",
            };

            chai.request(server)
                .get(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
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
                email: "test2@test.se",
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
                    result.user.should.equal("test2@test.se");

                    result.should.have.property("token");
                    token = res.body.data.token;

                    done();
                });
        });

        it('should get 401 as we try to access another customers data', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer/${anotherCustId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Unauthorized");
                    result.should.have.property("message");
                    result.message.should.equal(
                        "Current user is not authorized to view data from other users");
                    done();
                });
        });

        it('should get 200 as we do provide token', (done) => {
            chai.request(server)
                .get(`/v1/auth/customer/${custId}?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("userid");
                    result.userid.should.equal(custId);
                    result.should.have.property("firstname");
                    result.firstname.should.equal("Konrad");
                    done();
                });
        });
    });

    //edit a customer, the customer is logged in
    describe('PUT /v1/auth/customer', () => {
        it('should get 401 as we are not logged in', (done) => {
            let custUpdate = {
                password: "abc123",
                payment: "card",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer/?apiKey=${apiKey}`)
                .send(custUpdate)
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

        it('should get 400 as we provide token but not payment', (done) => {
            let custUpdate = {
                password: "abc123",
                // payment: "cash",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Payment not specified");
                    done();
                });
        });

        it('should get 400 as we provide token but not balance', (done) => {
            let custUpdate = {
                password: "abc123",
                payment: "cash",
                // balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Balance not specified");
                    done();
                });
        });

        //update logged in customer, not updating password
        it('should get 200 as we provide token, no password provided', (done) => {
            let custUpdate = {
                // password: "abc123",
                payment: "cash",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");

                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("Customer updated");
                    result.should.have.property("user");
                    result.user.should.equal("test@test.se");
                    done();
                });
        });

        //update logged in customer, also updating to new password
        it('should get 200 as we provide token, password change', (done) => {
            let custUpdate = {
                password: "abc123",
                payment: "cash",
                balance: 200
            };

            chai.request(server)
                .put(`/v1/auth/customer?apiKey=${apiKey}`)
                .set("x-access-token", token)
                .send(custUpdate)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");

                    res.body.data.should.be.an("object");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("Customer updated");
                    result.should.have.property("user");
                    result.user.should.equal("test@test.se");
                    done();
                });
        });
    });
});

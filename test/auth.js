/* global it describe before */

/**
 testing of auth-routes
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');
const emptyDB = require("./emptyDB.js");

chai.should();

chai.use(chaiHttp);

let config;

try {
    config = require('../config/config.json');
} catch (error) {
    console.error(error);
}

const apiKey = process.env.API_KEY || config.apikey;

// let token = "";

describe('auth', () => {
    before(() => {
        emptyDB.resetDB();
    });

    //login user
    describe('POST /v1/auth/customer/login', () => {
        it('should get 401 as we do not provide password', (done) => {
            let user = {
                email: "fredrica123@live.com",
                // password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide email', (done) => {
            let user = {
                // email: "fredrica123@live.com",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we provide incorrect email', (done) => {
            let user = {
                email: "incorrectEmail@live.com",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we provide incorrect password', (done) => {
            let user = {
                email: "fredrica123@live.com",
                password: "incorrectPassword"
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);

                    let result = res.body.errors;

                    result.should.have.property("title");
                    result.title.should.equal("Wrong password");

                    result.should.have.property("detail");
                    result.detail.should.equal("Password is incorrect.");
                    done();
                });
        });

        it('should get 401 as we provide incorrect unique_id', (done) => {
            let user = {
                email: "test@test.se",
                unique_id: 89
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH with unique_id login', (done) => {
            let user = {
                email: "test@test.se",
                unique_id: 88
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
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
                    // token = res.body.data.token;

                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
            let user = {
                email: "fredrica123@live.com",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/customer/login?apiKey=${apiKey}`)
                .send(user)
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
                    // token = res.body.data.token;

                    done();
                });
        });
    });

    //create/register user
    describe('POST /v1/auth/customer', () => {
        it('should get 400 as we do not provide password', (done) => {
            let user = {
                email: "test123@test.se",
                // password: "test123",
                firstname: "test",
                lastname: "testsson",
                cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Password not specified");
                    done();
                });
        });

        it('should get 400 as we do not provide email', (done) => {
            let user = {
                // email: "test123@test.se",
                password: "test123",
                firstname: "test",
                lastname: "testsson",
                cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Email not specified");
                    done();
                });
        });

        it('should get 400 as we do not provide firstname', (done) => {
            let user = {
                email: "test123@test.se",
                password: "test123",
                // firstname: "test",
                lastname: "testsson",
                cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
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

        it('should get 400 as we do not provide cityid', (done) => {
            let user = {
                email: "test123@test.se",
                password: "test123",
                firstname: "test",
                lastname: "testsson",
                // cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("City id not specified");
                    done();
                });
        });

        //If a user (email) already exists status code 200 is sent back
        it('should get 200 HAPPY PATH when user already exists', (done) => {
            let user = {
                email: "lowe645@hotmail.com",
                password: "test123",
                firstname: "test",
                lastname: "testsson",
                cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User already exists");
                    result.should.have.property("user");
                    result.user.should.equal(user.email);
                    done();
                });
        });

        //If a user (email) already exists but unique_id is missing
        //unique_id is set and status code 200 is sent back
        it('should get 200 HAPPY PATH when user exists but unique_id is set', (done) => {
            let user = {
                email: "lowe645@hotmail.com",
                password: "test123",
                firstname: "test",
                lastname: "testsson",
                cityid: 3,
                unique_id: 222
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User already exists");
                    result.should.have.property("user");
                    result.user.should.equal(user.email);
                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let user = {
                email: "test123@test.se",
                password: "test123",
                firstname: "test",
                lastname: "testsson",
                cityid: 3
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User created");
                    result.should.have.property("user");
                    result.user.should.equal(user.email);
                    done();
                });
        });

        //New OAuth customer also sends in a unique_id
        it('should get 201 HAPPY PATH for OAuth register', (done) => {
            let user = {
                email: "testOAuth@test.se",
                password: "test123",
                firstname: "OAuth",
                lastname: "test",
                cityid: 1,
                unique_id: 333
            };

            chai.request(server)
                .post(`/v1/auth/customer?apiKey=${apiKey}`)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User created");
                    result.should.have.property("user");
                    result.user.should.equal(user.email);
                    done();
                });
        });
    });

    //create/register staff
    describe('POST /v1/auth/staff', () => {
        it('should get 400 as we do not provide password', (done) => {
            let staff = {
                email: "staff@test.se",
                // password: "test123",
            };

            chai.request(server)
                .post(`/v1/auth/staff?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Password not specified");
                    done();
                });
        });

        it('should get 400 as we do not provide email', (done) => {
            let staff = {
                // email: "staff@test.se",
                password: "test123",
            };

            chai.request(server)
                .post(`/v1/auth/staff?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");

                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Missing input");
                    result.should.have.property("detail");
                    result.detail.should.equal("Email not specified");
                    done();
                });
        });

        //If a user (email) already exists status code 400 is sent back
        it('should get 400 when staff email already exists', (done) => {
            let staff = {
                email: "test@test.se",
                password: "test123",
            };

            chai.request(server)
                .post(`/v1/auth/staff?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an("object");
                    res.body.errors.should.be.an("object");

                    let result = res.body.errors;

                    result.should.have.property("message");
                    result.message.should.equal("Error creating user");
                    result.should.have.property("detail");
                    result.detail.should.contain("UNIQUE constraint failed");
                    done();
                });
        });

        it('should get 201 HAPPY PATH', (done) => {
            let staff = {
                email: "staff@test.se",
                password: "test123",
            };

            chai.request(server)
                .post(`/v1/auth/staff?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.should.have.property("data");

                    let result = res.body.data;

                    result.should.have.property("message");
                    result.message.should.equal("User created");
                    result.should.have.property("user");
                    result.user.should.equal(staff.email);
                    done();
                });
        });
    });

    //login staff
    describe('POST /v1/auth/staff/login', () => {
        it('should get 401 as we do not provide password', (done) => {
            let staff = {
                email: "test@test.se",
                // password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/staff/login?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we do not provide email', (done) => {
            let staff = {
                // email: "test@test.se",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/staff/login?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 401 as we provide incorrect email', (done) => {
            let staff = {
                email: "incorrectEmail@test.se",
                password: "test123"
            };

            chai.request(server)
                .post(`/v1/auth/staff/login?apiKey=${apiKey}`)
                .send(staff)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.an("object");
                    res.body.errors.status.should.be.equal(401);
                    done();
                });
        });

        it('should get 200 HAPPY PATH', (done) => {
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
                    done();
                });
        });
    });
});

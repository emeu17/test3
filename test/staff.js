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

describe('staff', () => {
    before(() => {
        emptyDB.resetDB();
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

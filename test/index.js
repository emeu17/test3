/* global it describe */

/**
 testing of index-page
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
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

describe('app', () => {
    describe('GET /', () => {
        it('200 HAPPY PATH getting base', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('page should contain API description', (done) => {
            chai.request(server)
                .get("/")
                .end((err, res) => {
                    res.should.have.status(200);

                    let reply = res.body;

                    reply.should.be.an("object");

                    let message = reply.data.message;

                    message.should.be.a("string");
                    message.should.equal("API for Scooter project");

                    done();
                });
        });
    });

    describe('GET /nonexistentpage', () => {
        it('should get 401 as we do not provide valid api_key', (done) => {
            chai.request(server)
                .get("/nonexistentpage")
                .end((err, res) => {
                    res.should.have.status(401);
                    // console.log(res.body);
                    done();
                });
        });
        it('should get status 404 as page does not exist', (done) => {
            chai.request(server)
                .get(`/nonexistentpage?apiKey=${apiKey}`)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.an("object");
                    res.body.should.have.property("errors");

                    let reply = res.body.errors[0];

                    reply.should.have.property("title");
                    reply.title.should.equal("Not Found");
                    reply.should.have.property("detail");
                    reply.detail.should.equal("Not Found");
                    done();
                });
        });
    });
});

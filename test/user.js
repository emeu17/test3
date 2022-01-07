/* global it describe */

/**
 testing of city-routes
*/

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

chai.should();

chai.use(chaiHttp);

describe('user', () => {
    //get all staff
    describe('GET /user/', () => {
        it('should get 200 Happy path', (done) => {
            chai.request(server)
                .get(`/user/`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let reply = res.body.data;

                    reply.should.have.property("msg");
                    reply.msg.should.equal("Got a GET request, sending back default 200");

                    done();
                });
        });
    });
    describe('POST /user/', () => {
        it('should get 201 Happy path', (done) => {
            chai.request(server)
                .post(`/user/`)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let reply = res.body.data;

                    reply.should.have.property("msg");
                    reply.msg.should.equal("Got a POST request, sending back 201 Created");

                    done();
                });
        });
    });
    describe('PUT /user/', () => {
        it('should get 200 Happy path', (done) => {
            chai.request(server)
                .put(`/user/`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");

                    let reply = res.body.data;

                    reply.should.have.property("msg");
                    reply.msg.should.equal("User with id xxx created");

                    done();
                });
        });
    });
    describe('DELETE /user/', () => {
        it('should get 204 Happy path', (done) => {
            chai.request(server)
                .delete(`/user/`)
                .end((err, res) => {
                    res.should.have.status(204);

                    done();
                });
        });
    });
});

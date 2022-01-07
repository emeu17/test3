/**
 * planning on adding data concerning customers
 *
*/
const database = require("../db/database.js");
const bcrypt = require('bcryptjs');

const customer = {
    /*
        get all customers
    */
    getAllCustomers: function (res) {
        let db;

        db = database.getDb();

        let sql = `SELECT * FROM customer;`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: "/customer",
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            return res.status(200).json({
                "data": rows
            });
        });
    },
    /*
        get specific customer, for logged in customer
    */
    getSpecificCustomer: function (res, req) {
        let db;

        db = database.getDb();

        //check which customer is logged in
        let loggedInCustomerId = req.user.id;

        //if a request is sent to view any other customers data except the
        //customers own data, it will be denied.
        if (loggedInCustomerId != req.params.id) {
            return res.status(401).json({
                errors: {
                    status: 401,
                    path: `/v1/auth${req.path}`,
                    title: "Unauthorized",
                    message: "Current user is not authorized to view data from other users",
                }
            });
        }

        var sql =`SELECT
                    userid, firstname, lastname, email,
                    cityid, payment, balance
                    FROM customer WHERE userid = ?;`;
        var params =[req.params.id];

        db.get(sql, params, function (err, row) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: `/v1/auth${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            //check if row exists ie id exists
            return row
                ? res.status(200).json({
                    "data": row
                })
                : res.status(404).json({
                    errors: {
                        status: 404,
                        path: `/v1/auth${req.path}`,
                        title: "Not found",
                        message: "The customer is not found"
                    }
                });
        });
    },
    /*
        delete specific customer
    */
    deleteSpecificCustomer: function (res, req) {
        let db;

        db = database.getDb();

        var sql =`DELETE FROM customer where userid = ?;`;
        var params =[req.params.id];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: `/v1/auth${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }

            if (this.changes > 0) {
                return res.status(204).json({
                    data: {
                        msg: "Customer deleted"
                    }
                });
            }

            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/auth${req.path}`,
                    title: "Not found",
                    message: "The customer is not found"
                }
            });
        });
    },
    /*
        update specific customer
    */
    updateSpecificCustomer: function (res, req) {
        var errors=[];

        if (!req.body.firstname || !req.body.lastname) {
            errors.push("First or last name not specified");
        }
        if (!req.body.cityid) {
            errors.push("Cityid not specified");
        }
        if (!req.body.payment || !req.body.balance) {
            errors.push("Payment method or balance missing");
        }
        if (errors.length) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    source: `/v1/auth${req.path}`,
                    message: "Missing input",
                    detail: errors.join(", ")
                }
            });
        }

        let db;

        db = database.getDb();

        var sql =`UPDATE customer set
        firstname = ?,
        lastname = ?,
        cityid = ?,
        payment = ?,
        balance = ? WHERE userid = ?;`;
        var params = [
            req.body.firstname,
            req.body.lastname,
            req.body.cityid,
            req.body.payment,
            req.body.balance,
            req.params.id
        ];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: `/v1/auth${req.path}`,
                        title: "Bad request",
                        message: err.message
                    }
                });
            }

            if (this.changes > 0) {
                return res.status(200).json({
                    data: {
                        message: "Customer updated",
                        customerid: req.params.id
                    }
                });
            }

            return res.status(404).json({
                errors: {
                    status: 404,
                    path: `/v1/auth${req.path}`,
                    title: "Not found",
                    message: "The customer is not found"
                }
            });
        });
    },
    /*
        customer can update its data:
        password, balance and payment
    */
    customerUpdate: async function (res, req) {
        var errors=[];

        const data = {
            password: req.body.password,
            balance: req.body.balance,
            payment: req.body.payment
        };

        if (!data.balance) {
            errors.push("Balance not specified");
        }
        if (!data.payment) {
            errors.push("Payment not specified");
        }
        if (errors.length) {
            return res.status(400).json({
                errors: {
                    status: 400,
                    source: `/v1/auth${req.path}`,
                    message: "Missing input",
                    detail: errors.join(", ")
                }
            });
        }

        //check which customer is logged in
        let loggedInCustomerId = req.user.id;

        let db;

        db = database.getDb();

        if (!data.password) {
            var sql = `UPDATE CUSTOMER SET
                        balance = ?, payment = ?
                        WHERE userid = ?;`;
            var params =[data.balance, data.payment, loggedInCustomerId];

            db.run(sql, params, function (err) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: `/v1/auth${req.path}`,
                            message: "Error updating user",
                            detail: err.message
                        }
                    });
                }
            });
            return res.status(200).json({
                data: {
                    type: "success",
                    message: "Customer updated",
                    user: req.user.email
                }
            });
        }

        //encrypt incoming password
        bcrypt.hash(data.password, 10, async function(err, hash) {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        source: `/v1/auth${req.path}`,
                        title: "bcrypt error",
                        detail: "bcrypt error"
                    }
                });
            }

            var sql = `UPDATE CUSTOMER SET
                        password = ?,
                        balance = ?, payment = ?
                        WHERE userid = ?;`;
            var params =[hash, data.balance, data.payment, loggedInCustomerId];

            db.run(sql, params, function (err) {
                if (err) {
                    return res.status(500).json({
                        errors: {
                            status: 500,
                            source: `/v1/auth${req.path}`,
                            message: "Error updating user",
                            detail: err.message
                        }
                    });
                }
                return res.status(200).json({
                    data: {
                        type: "success",
                        message: "Customer updated",
                        user: req.user.email
                    }
                });
            });
        });
    }
};

module.exports = customer;

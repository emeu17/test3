/**
 * planning on adding data concerning customers
 *
*/
const database = require("../db/database.js");

const staff = {
    /*
        get all bikes
    */
    getAllStaff: function (res) {
        let db;

        db = database.getDb();

        let sql = `SELECT * FROM staff;`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: "/v1/auth/staff",
                        title: "Bad request",
                        message: err.message
                    }
                });
            }
            return res.status(200).json({
                "data": rows
            });
        });
    }
};

module.exports = staff;

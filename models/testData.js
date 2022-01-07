/**
 * planning on adding data to retrieve cities, stations, bikes etc
 *
*/
const database = require("../db/testDatabase.js");

const testData = {
    getAllData: function (res) {
        let db;

        db = database.getDb();

        let sql = `SELECT * FROM tbl1;`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    errors: {
                        status: 500,
                        path: "/data",
                        title: "Database error",
                        message: err.message
                    }
                });
            }
            res.status(200).json({
                "data": rows
            });
        });
    },
    getSpecificRow: function (res, req) {
        let db;

        db = database.getDb();

        console.log("id: " + req.params.id);
        var sql ='SELECT * from tbl1 WHERE rowid = ?;';
        var params =[req.params.id];

        db.get(sql, params, function (err, row) {
            if (err) {
                res.status(400).json({"error": err.message});
                return;
            }
            res.status(200).json({
                "data": row
            });
        });
    },
    addData: function (res, req) {
        let db;

        db = database.getDb();

        var errors=[];

        if (!req.body.one) {
            errors.push("Column 1 not specified");
        }
        if (!req.body.two) {
            errors.push("Column 2 not specified");
        }
        if (errors.length) {
            res.status(400).json({"error": errors.join(",")});
            return;
        }
        var data = {
            one: req.body.one,
            two: req.body.two
        };
        var sql ='INSERT INTO tbl1 (one, two) VALUES (?,?);';
        var params =[data.one, data.two];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(400).json({ "error": err.message });
            }
            return res.status(201).json({
                "message": "row added",
                "data": data,
                "id": this.lastID
            });
        });
    }
};

module.exports = testData;

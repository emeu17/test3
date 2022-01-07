var express = require('express');
var router = express.Router();
const database = require("../db/testDatabase.js");
const data = require("../models/testData.js");

router.get('/', function(req, res) {
    let sendStr = `<h1>These are the routes for testing the api</h1>
            <p>Possible routes include:</p>
            /test/data <br>
            /test/data/&#60;id&#62; <br>
            /test/hello/&#60;msg&#62; <br>
            /test/hello/&#60;msg&#62;/test`;

    res.send(sendStr);
});

// router.get('/',
//     (req, res, next) => auth.checkToken(req, res, next),
//     (req, res) => data.updateData(res, req)
// );

router.get('/data/:id', (req, res) => data.getSpecificRow(res, req));

router.get('/data', (req, res) => data.getAllData(res, req));

router.post('/data', (req, res) => data.addData(res, req));

router.get('/db', function(req, res) {
    //testing opening the test-db
    let db;

    db = database.getDb();

    let sql = `SELECT * FROM tbl1;`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(row.one);
        });
    });

    db.close();

    const data = {
        data: {
            msg: "Hello World"
        }
    };

    res.json(data);
});


//example routes
router.get("/hello/:msg", (req, res) => {
    const data = {
        data: {
            msg: req.params.msg
        }
    };

    res.json(data);
});

router.get("/hello/:msg/test", (req, res) => {
    const data = {
        data: {
            msg: "testing " + req.params.msg
        }
    };

    res.json(data);
});

module.exports = router;

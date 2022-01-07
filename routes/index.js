var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
    const data = {
        data: {
            message: "API for Scooter project"
        }
    };

    res.json(data);
});

module.exports = router;

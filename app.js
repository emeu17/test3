const express = require("express");
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();
const port = 1337;
const path = require('path');

//Lösning för CORS policy: Access-Control-Allow-Origin för React
app.all('*', cors());

//add files for different routes
const index = require('./routes/index');
const user = require('./routes/user');
const test = require('./routes/test');
const bike = require('./routes/bike');
const auth = require('./routes/auth');
const city = require('./routes/city');
const travel = require('./routes/travel');


/* TODO implementera för att kolla api-key på alla routes */
const authModel = require("./models/auth.js");





//Om man vill använda sig av parametrar tillsammans med
//HTTP metoderna POST, PUT och DELETE
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

app.use(express.static(path.join(__dirname, "public")));
//all routes require api
app.all('*', authModel.checkAPIKey);


/**
 * Add routes
*/

app.use('/', index);
app.use('/user', user);
app.use('/test', test);
app.use('/v1/bike', bike);
app.use('/v1/auth', auth);
app.use('/v1/city', city);
app.use('/v1/travel', travel);

// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// keep this last of all routes
app.use((req, res, next) => {
    var err = new Error("Not Found");

    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

// Start up server
const server = app.listen(port, () => {
    console.log('API listening on port ' + port);
});

module.exports = server;

const fs = require('fs');
const database = require("../db/database.js");
let config;

try {
    config = require('../config/config.json');
} catch (error) {
    console.error(error);
}

const testScript = process.env.TEST_SCRIPT || config.test_script;

const emptyDB = {
    /*
        empty DB and run script to reset original data
    */
    resetDB: function () {
        return new Promise((resolve) => {
            let db;

            db = database.getDb();

            const dataSql = fs.readFileSync(testScript).toString();

            // Convert the SQL string to array to run one at a time.
            const dataArr = dataSql.toString().split(";");

            //last row is empty, creates a last "empty" ('\n')-element
            dataArr.splice(-1);

            // db.serialize ensures that queries are one after the other
            //depending on which one came first in your `dataArr`
            db.serialize(() => {
                // db.run runs your SQL query against the DB
                db.run("BEGIN TRANSACTION;");
                // Loop through the `dataArr` and db.run each query
                dataArr.forEach(query => {
                    if (query) {
                        // Add the delimiter back to each query
                        //before you run them
                        query += ";";
                        db.run(query, err => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                });
                db.run("COMMIT;");
            });

            // Close the DB connection
            db.close(err => {
                if (err) {
                    return console.error(err.message);
                }
                resolve();
                // console.log("Closed the database connection.");
            });
        });
    }
};

module.exports = emptyDB;

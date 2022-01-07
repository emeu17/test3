const sqlite3 = require('sqlite3').verbose();

const database = {
    getDb: function getDb() {
        let dbFile = 'db/esc.db';

        if (process.env.NODE_ENV === 'test') {
            dbFile = 'db/esc_test.db';
            // console.log("using test-DB");
        }

        let db = new sqlite3.Database(dbFile, (err) => {
            if (err) {
                console.error(err.message);
            }
            // console.log('Connected to the scooter database.');
        });

        return db;
    }
};

module.exports = database;

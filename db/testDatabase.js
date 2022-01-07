const sqlite3 = require('sqlite3').verbose();

const database = {
    getDb: function getDb() {
        let db = new sqlite3.Database('db/test2.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the test database.');
        });

        return db;
    }
};

module.exports = database;

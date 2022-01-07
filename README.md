[![Node.js CI](https://github.com/BTH-Scooter-Project/api/actions/workflows/node.js.yml/badge.svg)](https://github.com/BTH-Scooter-Project/api/actions/workflows/node.js.yml)

REST-API
==========
Basic API created. Connection to sqlite database established in db/database.js. For implemented routes
with correct database see https://bth-ramverk-grupp7.atlassian.net/wiki/spaces/BTHRAMVERK/pages/8290319/REST-API

Example routes created to show how to get, post, put and delete data to an example db (see example below).

Use API locally
-------------
To try out locally: Download and run *npm install*. Start the application with *npm start* (localhost:1337)

See https://rem.dbwebb.se/ and https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/ for more examples on building routes.

Test-routes
-------------
In folder *routes* there are two files **test.js** and **user.js** that contain example of routes. These
can be used without providing an api-key.

The file **test.js** contains connection to the sqlite database **test2.db** with connection
established in the file **db/testDatabase.js**.

Routes to try out
------------------
- GET /test/ - only shows some basic info about test-routes
- GET /test/db (get all test-data)
- GET /test/db/<id> (get row with id <id>)
- POST /test/db (post data, require body in: **one**: string, **two**: int)

To try out GET/POST/PUT/DELETE and status codes (no parameters in required):
- GET **/user/**
- POST **/user/**
- PUT **/user/**
- DELETE **/user/**

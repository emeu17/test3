PRAGMA foreign_keys = off;
DROP TABLE IF EXISTS bike;
CREATE TABLE "bike" (
	"bikeid"	INTEGER,
	"name"	TEXT,
	"image"	TEXT,
	"description"	TEXT,
	"max_speed"	INTEGER,
	"battery_capacity"	REAL DEFAULT 5000,
	"status"	TEXT DEFAULT 'vacant',
	"battery_level"	NUMERIC DEFAULT 5000,
	"gps_lat"	REAL,
	"gps_lon"	REAL,
	"dest_lat"	REAL,
	"dest_lon"	REAL,
	"stationid"	INTEGER DEFAULT -1,
	"cityid"	INTEGER,
	FOREIGN KEY("cityid") REFERENCES "city"("cityid"),
	FOREIGN KEY("stationid") REFERENCES "station"("stationid"),
	PRIMARY KEY("bikeid" AUTOINCREMENT)
);
INSERT INTO "bike" ("bikeid","name","image","description","max_speed","battery_capacity","status","battery_level","gps_lat","gps_lon","dest_lat","dest_lon","stationid","cityid") VALUES
(1,'cykel1','redBike.jpg','En klassisk rÃ¶d cykel',12,10000.0,'vacant',5000,456.456,500.5,NULL,NULL,1,2),
(2,'cykel2','greenBike.jpg','En grÃ¶n cykel med fart',50,12000.0,'vacant',900,500.5,600.6,NULL,NULL,2,3),
(3,'cykel3','puprleBike.jpg','En liten lila cykel',10,9000.0,'vacant',4200,50.1,50.1,NULL,NULL,4,1),
(4,'cykel4','blueBike.jpg','En blÃ¥ cykel utmÃ¤rkt fÃ¶r terrÃ¤ng',15,8000.0,'vacant',7500,500.5,600.6,NULL,NULL,2,3),
(5,'cykel5','yellowBike.jpg','En gul cykel helt enkelt',13,9000.0,'vacant',7500,100.1,100.1,NULL,NULL,3,3),
(6,'cykel6','pinkBike.jpg','En rosa cykel',11,9500.0,'vacant',2000,10.1,10.1,NULL,NULL,-1,1);

DROP TABLE IF EXISTS city;
CREATE TABLE "city" (
	"cityid"	INTEGER,
	"name"	TEXT,
	"gps_left_lat"	REAL,
	"gps_left_lon"	REAL,
	"gps_right_lat"	REAL,
	"gps_right_lon"	REAL,
	PRIMARY KEY("cityid" AUTOINCREMENT)
);
INSERT INTO city (cityid, name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES (-1, 'Ok�nd', NULL, NULL, NULL, NULL);
INSERT INTO city (cityid, name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES (1, 'Sundsvall', 62.381299, 17.278061, 62.395301, 17.328186);
INSERT INTO city (cityid, name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES (2, 'Stockholm', 59.351495, 18.023087, 59.305341, 18.168215);
INSERT INTO city (cityid, name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES (3, 'Karlskrona', 56.160608, 15.564709, 56.186171, 15.631485);

-- Table: customer
DROP TABLE IF EXISTS customer;
CREATE TABLE "customer" (
	"userid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"email"	TEXT UNIQUE,
	"cityid"	INTEGER,
	"payment"	TEXT,
	"balance"	NUMERIC,
	"unique_id"	TEXT,
	FOREIGN KEY("cityid") REFERENCES "city"("cityid"),
	PRIMARY KEY("userid" AUTOINCREMENT)
);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (1, 'Natali', 'Åström', '$2a$10$A3nR1z9LsJnbvKhwuuuThe5S4dt6fDzM/VTv2FddEAKYl2cDMBRtS', 'test@test.se', 2, 'card', 500, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (2, 'Konrad', 'Magnusson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'test2@test.se', 1, 'card', 100.5, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (3, 'Harald', 'Andersson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'test@gmail.com', 3, 'prepaid', 99, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (4, 'Fredrica', 'Gustavsson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'fredrica123@live.com', 2, 'prepaid', 500, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (5, 'Lowe', 'Jansson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'lowe645@hotmail.com', 1, 'card', 420, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (6, 'Isak', 'Jönsson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'isak678@gmail.com', 3, 'prepaid', 9, NULL);
INSERT INTO customer (userid, firstname, lastname, password, email, cityid, payment, balance, unique_id) VALUES (7, 'Nenad', 'Cuturic', '$2b$10$kFANZPJwO/aGGXtlaf7IVeI47KCZlswg60jdccUgeFiiwRRDgUa6C', 'test@mail.com', 2, 'card', 400, 101);

DROP TABLE IF EXISTS staff;
CREATE TABLE "staff" (
	"staffid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"role"	TEXT,
	"email"	TEXT UNIQUE,
	PRIMARY KEY("staffid" AUTOINCREMENT)
);
INSERT INTO staff (staffid, firstname, lastname, password, role, email) VALUES (1, 'Emilio', 'Löfgren', '$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.', 'admin', 'test@test.se');
INSERT INTO staff (staffid, firstname, lastname, password, role, email) VALUES (2, 'test', 'testsson', '$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.', 'admin', 'test2@test.se');

-- Table: station
DROP TABLE IF EXISTS station;
CREATE TABLE "station" (
	"stationid"	INTEGER,
	"type"	TEXT,
	"address"	TEXT,
	"cityid"	INTEGER,
	"gps_lat"	REAL,
	"gps_lon"	REAL,
	FOREIGN KEY("cityid") REFERENCES "city"("cityid"),
	PRIMARY KEY("stationid" AUTOINCREMENT)
);

INSERT INTO "station" ("stationid","type","address","cityid","gps_lat","gps_lon") VALUES
 (-1,'ingen station','ingen station',-1,NULL,NULL),
 (1,'parking','Fakegatan',2,456.456,500.5),
 (2,'charge','Gatuhörn',3,500.5,600.6),
 (3,'charge','Centrum',3,100.1,100.1),
 (4,'charge','Parkering',1,100.1,100.1);

DROP TABLE IF EXISTS travel_history;
CREATE TABLE "travel_history" (
	"travelid"	INTEGER,
	"date_start"	DATETIME DEFAULT current_timestamp,
	"date_end"	DATETIME,
	"travel_time"	REAL,
	"bikeid"	INTEGER,
	"userid"	INTEGER,
	"price"	REAL,
	"gps_lat_start"	REAL,
	"gps_lon_start"	REAL,
	"gps_lat_end"	REAL,
	"gps_lon_end"	REAL,
	FOREIGN KEY("bikeid") REFERENCES "bike"("bikeid"),
	FOREIGN KEY("userid") REFERENCES "customer"("userid"),
	PRIMARY KEY("travelid" AUTOINCREMENT)
);
INSERT INTO travel_history (travelid, date_start, date_end, travel_time, bikeid, userid, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (1, '2021-12-01 12:00:00', NULL, 1000.0, 1, 6, 20.0, 789.789, 999.999, 789.789, 999.999);
INSERT INTO travel_history (travelid, date_start, date_end, travel_time, bikeid, userid, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (2, '2021-12-01 10:30:20', NULL, 2500.0, 4, 4, 38.0, 123.123, 456.456, 123.123, 456.456);
INSERT INTO travel_history (travelid, date_start, date_end, travel_time, bikeid, userid, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (3, '2021-12-10 09:13:55', NULL, 220.0, 2, 1, 27.2, 123.123, 456.456, 123.123, 456.456);
INSERT INTO travel_history (travelid, date_start, date_end, travel_time, bikeid, userid, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (4, '2021-12-01 10:30:20', NULL, 1000.0, 822, 4, 50.0, 59.3363496299236, 18.1592966294856, 59.3315509019013, 18.0621232019434);
INSERT INTO travel_history (travelid, date_start, date_end, travel_time, bikeid, userid, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (5, '2021-12-25 02:11:04', NULL, 1500.0, 215, 4, 75.0, 59.345864792335, 18.0911208078651, 59.3327883367024, 18.0531695998127);

PRAGMA foreign_keys = on;

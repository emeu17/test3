--
-- File generated with SQLiteStudio v3.3.3 on Fri Dec 3 13:06:49 2021
--
-- Text encoding used: System
--
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS travel_history;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS bike;
DROP TABLE IF EXISTS station;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS log;


-- Table: city
CREATE TABLE "city" (
	"cityid"	INTEGER,
	"name"	TEXT,
	"gps_left_lat"	REAL,
	"gps_left_lon"	REAL,
	"gps_right_lat"	REAL,
	"gps_right_lon"	REAL,
	PRIMARY KEY("cityid" AUTOINCREMENT)
);
INSERT INTO city (cityid, name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES (-1, 'okänd', NULL, NULL, NULL, NULL);
INSERT INTO city (name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES ('Sundsvall', 123.42, 345.678, NULL, NULL);
INSERT INTO city (name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES ('Stockholm', 101.123, 120.123, NULL, NULL);
INSERT INTO city (name, gps_left_lat, gps_left_lon, gps_right_lat, gps_right_lon) VALUES ('Karlskrona', 99.889, 100.123, NULL, NULL);

-- Table: station
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
INSERT INTO station (stationid, type, address, cityid, gps_lat, gps_lon) VALUES (-1, 'ingen station', 'ingen station', -1, NULL, NULL);
INSERT INTO station (type, address, cityid, gps_lat, gps_lon) VALUES ('parking', 'Fakegatan', 2, 456.456, 500.5);
INSERT INTO station (type, address, cityid, gps_lat, gps_lon) VALUES ('charge', 'Gatuhörn', 3, 500.5, 600.6);
INSERT INTO station (type, address, cityid, gps_lat, gps_lon) VALUES ('charge', 'Centrum', 3, 100.1, 100.1);

-- Table: bike
CREATE TABLE "bike" (
	"bikeid"	INTEGER,
	"name"	TEXT,
	"image"	TEXT,
	"description"	TEXT,
	"max_speed"	TEXT,
	"battery_capacity"	NUMERIC DEFAULT 5000,
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
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel1', 'redBike.jpg', 'En klassisk röd cykel', '12', '10000', 'vacant', 5000, 200.123, 300.123, 1, 3);
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel2', 'greenBike.jpg', 'En grön cykel med fart', '50', '12000', 'vacant', 900, 200.123, 300.123, 2, 2);
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel3', 'puprleBike.jpg', 'En liten lila cykel', '10', '9000', 'vacant', 4200, 500.1, 500.1, 1, 1);
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel4', 'blueBike.jpg', 'En blå cykel utmärkt för terräng', '15', '8000', 'vacant', 7500, 400.1, 400.1, 2, 3);
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel5', 'yellowBike.jpg', 'En gul cykel helt enkelt', '13', '9000', 'vacant', 7500, 100.1, 100.1, 1, 2);
INSERT INTO bike (name, image, description, max_speed, battery_capacity, status, battery_level, gps_lat, gps_lon, stationid, cityid) VALUES ('cykel6', 'pinkBike.jpg', 'En rosa cykel', '11', '9500', 'vacant', 2000, 100.1, 100.1, 2, 1);


-- Table: customer
CREATE TABLE "customer" (
	"userid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"email"		TEXT UNIQUE,
	"cityid"	INTEGER,
	"payment"	TEXT,
	"balance"	NUMERIC,
	FOREIGN KEY("cityid") REFERENCES "city"("cityid"),
	PRIMARY KEY("userid" AUTOINCREMENT)
);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Natali', 'Åström', '$2a$10$A3nR1z9LsJnbvKhwuuuThe5S4dt6fDzM/VTv2FddEAKYl2cDMBRtS', 'test@test.se', 2, 'card', 500);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Konrad', 'Magnusson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'test2@test.se', 1, 'card', 100.5);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Harald', 'Andersson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'test@gmail.com', 3, 'prepaid', 99);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Fredrica', 'Gustavsson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'fredrica123@live.com', 2, 'prepaid', 500);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Lowe', 'Jansson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'lowe645@hotmail.com', 1, 'card', 420);
INSERT INTO customer (firstname, lastname, password, email, cityid, payment, balance) VALUES ('Isak', 'Jönsson', '$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu', 'isak678@gmail.com', 3, 'prepaid', 9);

-- Table: log
CREATE TABLE "log" (
	"id"	INTEGER,
	"event"	TEXT,
	"when"	BLOB,
	"error_msg"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
INSERT INTO log (id, event, "when", error_msg) VALUES (1, 'payment correct', '2021-12-02 12:00:00', NULL);
INSERT INTO log (id, event, "when", error_msg) VALUES (2, 'payment failed', '2021-11-20 13:00:00', 'pay101');

-- Table: staff
CREATE TABLE "staff" (
	"staffid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"role"	TEXT,
	"email"	TEXT UNIQUE,
	PRIMARY KEY("staffid" AUTOINCREMENT)
);
INSERT INTO staff (firstname, lastname, password, role, email) VALUES ('Emilio', 'Löfgren', '$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.', 'admin', 'test@test.se');
INSERT INTO staff (firstname, lastname, password, role, email) VALUES ("test","testsson",'$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.',"admin","test2@test.se");

-- 	"email"	TEXT UNIQUE,
-- osäker om vi bör ha unique i db

-- Table: travel_history
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
INSERT INTO travel_history (date_start, bikeid, userid, travel_time, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES ('2021-12-01 12:00:00', 1, 6, 1000.0, 20, '789.789', '999.999', '789.789', '999.999');
INSERT INTO travel_history (date_start, bikeid, userid, travel_time, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES ('2021-12-01 10:30:20', 4, 4, 2500.0, 38, '123.123', '456.456', '123.123', '456.456');
INSERT INTO travel_history (bikeid, userid, travel_time, price, gps_lat_start, gps_lon_start, gps_lat_end, gps_lon_end) VALUES (2, 1, 220.0, 27.2, '123.123', '456.456', '123.123', '456.456');

COMMIT;

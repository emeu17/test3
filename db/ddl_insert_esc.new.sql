BEGIN TRANSACTION;
DROP TABLE IF EXISTS "city";
CREATE TABLE IF NOT EXISTS "city" (
	"cityid"	INTEGER,
	"name"	TEXT,
	"gps_left_lat"	REAL,
	"gps_left_lon"	REAL,
	"gps_right_lat"	REAL,
	"gps_right_lon"	REAL,
	PRIMARY KEY("cityid" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "station";
CREATE TABLE IF NOT EXISTS "station" (
	"stationid"	INTEGER,
	"type"	TEXT,
	"address"	TEXT,
	"cityid"	INTEGER,
	"gps_lat"	REAL,
	"gps_lon"	REAL,
	PRIMARY KEY("stationid" AUTOINCREMENT),
	FOREIGN KEY("cityid") REFERENCES "city"("cityid")
);
DROP TABLE IF EXISTS "log";
CREATE TABLE IF NOT EXISTS "log" (
	"id"	INTEGER,
	"event"	TEXT,
	"when"	BLOB,
	"error_msg"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "staff";
CREATE TABLE IF NOT EXISTS "staff" (
	"staffid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"role"	TEXT,
	"email"	TEXT UNIQUE,
	PRIMARY KEY("staffid" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "travel_history";
CREATE TABLE IF NOT EXISTS "travel_history" (
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
	PRIMARY KEY("travelid" AUTOINCREMENT),
	FOREIGN KEY("userid") REFERENCES "customer"("userid"),
	FOREIGN KEY("bikeid") REFERENCES "bike"("bikeid")
);
DROP TABLE IF EXISTS "customer";
CREATE TABLE IF NOT EXISTS "customer" (
	"userid"	INTEGER,
	"firstname"	TEXT,
	"lastname"	TEXT,
	"password"	TEXT,
	"email"	TEXT UNIQUE,
	"cityid"	INTEGER,
	"payment"	TEXT,
	"balance"	NUMERIC,
	PRIMARY KEY("userid" AUTOINCREMENT),
	FOREIGN KEY("cityid") REFERENCES "city"("cityid")
);
DROP TABLE IF EXISTS "bike";
CREATE TABLE IF NOT EXISTS "bike" (
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
	FOREIGN KEY("stationid") REFERENCES "station"("stationid"),
	PRIMARY KEY("bikeid" AUTOINCREMENT),
	FOREIGN KEY("cityid") REFERENCES "city"("cityid")
);
INSERT INTO "city" ("cityid","name","gps_left_lat","gps_left_lon","gps_right_lat","gps_right_lon") VALUES (-1,'okÃ¤nd',NULL,NULL,NULL,NULL),
 (1,'Sundsvall',123.42,345.678,NULL,NULL),
 (2,'Stockholm',59.351495,18.023087,59.305341,18.168215),
 (3,'Karlskrona',99.889,100.123,NULL,NULL);
INSERT INTO "station" ("stationid","type","address","cityid","gps_lat","gps_lon") VALUES (-1,'ingen station','ingen station',-1,NULL,NULL),
 (1,'parking','Fakegatan',2,456.456,500.5),
 (2,'charge','GatuhÃ¶rn',3,500.5,600.6),
 (3,'charge','Centrum',3,100.1,100.1);
INSERT INTO "log" ("id","event","when","error_msg") VALUES (1,'payment correct','2021-12-02 12:00:00',NULL),
 (2,'payment failed','2021-11-20 13:00:00','pay101');
INSERT INTO "staff" ("staffid","firstname","lastname","password","role","email") VALUES (1,'Emilio','LÃ¶fgren','$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.','admin','test@test.se'),
 (2,'test','testsson','$2a$10$JaYnHel0tWZ2AtlueKo0rOy.BS/ajyuuD8Bo9PnmKQRUwNZrxWqb.','admin','test2@test.se');
INSERT INTO "travel_history" ("travelid","date_start","date_end","travel_time","bikeid","userid","price","gps_lat_start","gps_lon_start","gps_lat_end","gps_lon_end") VALUES (1,'2021-12-01 12:00:00',NULL,1000.0,1,6,20.0,789.789,999.999,789.789,999.999),
 (2,'2021-12-01 10:30:20',NULL,2500.0,4,4,38.0,123.123,456.456,123.123,456.456),
 (3,'2021-12-10 09:13:55',NULL,220.0,2,1,27.2,123.123,456.456,123.123,456.456);
INSERT INTO "customer" ("userid","firstname","lastname","password","email","cityid","payment","balance") VALUES (1,'Natali','Ã…strÃ¶m','$2a$10$A3nR1z9LsJnbvKhwuuuThe5S4dt6fDzM/VTv2FddEAKYl2cDMBRtS','test@test.se',2,'card',500),
 (2,'Konrad','Magnusson','$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu','test2@test.se',1,'card',100.5),
 (3,'Harald','Andersson','$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu','test@gmail.com',3,'prepaid',99),
 (4,'Fredrica','Gustavsson','$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu','fredrica123@live.com',2,'prepaid',500),
 (5,'Lowe','Jansson','$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu','lowe645@hotmail.com',1,'card',420),
 (6,'Isak','JÃ¶nsson','$2a$10$VtbmFuD6v5m3KHujohQZ8.xazF2JziA5uUSinttbKp53JH2EdKPzu','isak678@gmail.com',3,'prepaid',9);
INSERT INTO "bike" ("bikeid","name","image","description","max_speed","battery_capacity","status","battery_level","gps_lat","gps_lon","dest_lat","dest_lon","stationid","cityid") VALUES (1,'cykel1','redBike.jpg','En klassisk rÃ¶d cykel',12,10000.0,'vacant',5000,200.123,300.123,NULL,NULL,1,3),
 (2,'cykel2','greenBike.jpg','En grÃ¶n cykel med fart',50,12000.0,'vacant',900,200.123,300.123,NULL,NULL,2,2),
 (3,'cykel3','puprleBike.jpg','En liten lila cykel',10,9000.0,'vacant',4200,500.1,500.1,NULL,NULL,1,1),
 (4,'cykel4','blueBike.jpg','En blÃ¥ cykel utmÃ¤rkt fÃ¶r terrÃ¤ng',15,8000.0,'vacant',7500,400.1,400.1,NULL,NULL,2,3),
 (5,'cykel5','yellowBike.jpg','En gul cykel helt enkelt',13,9000.0,'vacant',7500,100.1,100.1,NULL,NULL,1,2),
 (6,'cykel6','pinkBike.jpg','En rosa cykel',11,9500.0,'vacant',2000,100.1,100.1,NULL,NULL,2,1),
 (7,'cykel7','cykel7.jpg','En rosa cykel',40,9500.0,'vacant',5000,59.347561,18.025832,59.324783,18.07307,2,2);
COMMIT;

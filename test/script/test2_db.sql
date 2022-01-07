PRAGMA foreign_keys = off;

-- Table: tbl1
DROP TABLE IF EXISTS tbl1;
CREATE TABLE tbl1(one varchar(10), two smallint);
INSERT INTO tbl1 (one, two) VALUES ('hello!', 10);
INSERT INTO tbl1 (one, two) VALUES ('goodbye!', 20);
INSERT INTO tbl1 (one, two) VALUES ('orange', 12);
INSERT INTO tbl1 (one, two) VALUES ('lemon', 1);

-- Table: tbl2
DROP TABLE IF EXISTS tbl2;
CREATE TABLE tbl2 (id int, one varchar(10), two smallint);
INSERT INTO tbl2 (id, one, two) VALUES (1, 'apple', 2);
INSERT INTO tbl2 (id, one, two) VALUES (2, 'banana', 10);

PRAGMA foreign_keys = on;

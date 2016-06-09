CREATE TABLE Queues #IF NOT EXISTS Queues  
(
	id serial NOT NULL,
	users VARCHAR(100)
);
#CREATE TABLE IF NOT EXISTS User 
#(
#	username VARCHAR(255),
#	songsId VARCHAR(100000),
#	PRIMARY KEY ( username )
#);
DROP DATABASE IF EXISTS UserSong;

CREATE DATABASE UserSong;

use UserSong;

CREATE TABLE Users (
  Id int NOT NULL AUTO_INCREMENT,
  Email varchar(255) UNIQUE NOT NULL,
  Pass varchar(60) NOT NULL,
  PRIMARY KEY (Id)
);

CREATE TABLE Songs (
  Sid int NOT NULL AUTO_INCREMENT,
  Name varchar(255) NOT NULL,
  Id int NOT NULL,
  PRIMARY KEY (Sid),
  FOREIGN KEY (Id)
  REFERENCES Users(Id)
);
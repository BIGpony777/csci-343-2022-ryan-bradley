DROP DATABASE IF EXISTS UserScore;

CREATE DATABASE UserScore;

use UserScore;

CREATE TABLE Users (
  Id int NOT NULL AUTO_INCREMENT,
  Email varchar(255) UNIQUE NOT NULL,
  Pass varchar(60) NOT NULL,
  PRIMARY KEY (Id)
);

CREATE TABLE Scores (
  Sid int NOT NULL AUTO_INCREMENT,
  GuessAmt int NOT NULL,
  Id int NOT NULL,
  PRIMARY KEY (Sid),
  FOREIGN KEY (Id)
  REFERENCES Users(Id)
);
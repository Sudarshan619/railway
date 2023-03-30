CREATE DATABASE train;
USE train;
CREATE TABLE passengers_details(id INT(10) PRIMARY KEY AUTO_INCREMENT,fname VARCHAR(30),email VARCHAR(30),pass VARCHAR(30));
CREATE table passengers(id INT(10) PRIMARY KEY AUTO_INCREMENT,fname VARCHAR(30),lname VARCHAR(30)phoneno int(10));
CREATE TABLE booking (id INT PRIMARY KEY  AUTO_INCREMENT  ,fname varchar(30),lname varchar(30),age int(30),phoneno int(30),seat_type varchar(30), train_id int, pnr_no int,owner varchar(30) )
CREATE table train(id INT(10) PRIMARY key AUTO_INCREMENT,train_name VARCHAR(100),source VARCHAR(30),destination VARCHAR(30),train_no int(10));
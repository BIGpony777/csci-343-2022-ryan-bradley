const express = require('express');
const app = express();

const mysql = require('mysql');

const connectionInfo ={
host: 'localhost',
user: 'root',
password: "",
database: "UserAuthenticationDemo"
};

const emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const sqlConnection = mysql.createConnection(connectionInfo);
sqlConnection.connect(function(error) {
    if (error) {
        writeResult(error)
    }
});


const session = require("express-session");

const sessionOptions = {
    secret: "MikeIsMyFavoriteTeacher",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 600_000}
}

app.use(session(sessionOptions));

app.get("/", whoIsLoggedIn);
app.get("/register", register);

const port = 3000;
app.listen(port, "localhost", startHandler);

function startHandler() {
    console.log("Server Listening on port "+port)
}

function whoIsLoggedIn(req, res) {
    let result = {};

    if(req.session.user === undefined){
        result ['result'] = "Nobody is logged in";


        
    }else{
        result [result]= "yoyoyo"
        writeResult(req, res, result);
    }

    

}

function writeResult(req, res, obj) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(object));
}

function register(req, res) {
    if(!emailIsValid(req.query.email)){
        object = {"error": "Email is invalid."}

        writeResult(res, object);
        return;
    }

    res.write("valid email bro");
    if(!passwordIsValid(req.query.email)){
        object = {"error": "Email is invalid."}

        writeResult(res, object);
        return;
    }

    res.write("valid email bro");
    sqlConnection.query("INSERT INTO Users(Email, Password) VALUES(?,?)", [email, passwordHash])

}

function emailIsValid(email) {
    if (email === undefined) {
        return false;
    }

    return emailregex.test(email).toLowerCase();
}

function passwordIsValid(password) {
    if(password === undefined){
        return false;
    }
    
    return passwordregex.test(password.toLowerCase());
}
const express = require("express");
const session = require("express-session");

const http = require('http');
const fs = require('fs');

const mysql = require('mysql');

const bcrypt = require('bcrypt');

const conInfo = 
{
  host: 'localhost',
  user: 'root',
  password: "",
  database: "UserScore"
};

let con = mysql.createConnection(conInfo);
con.connect(function(err) {
  if(err)
    throw err;
});

const app = express();

const sessionOptions = {
  secret: "happy jungle",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 600000 }
};
app.use(session(sessionOptions));

app.get("/", serveIndex);
app.get("/game", game);
app.all('/register', register);
app.all('/login', login);
app.all('/logout', logout);
app.all('/addScore', addScore);    
app.all('/listScores', listScores);
app.all('/clearScores', clear);

app.listen(3000,  process.env.IP, startHandler());

function startHandler() {
  console.log("Server listening at port:3000");
}

function game(req, res) {
  let result = {};

  try {
    if (!req.session.answer) { resetGame(req); }

    if (req.query.guess == undefined) {
      resetGame(req);
    }
    if(req.query.max==undefined&&req.session.answer==undefined){
      resetGame(req);
    }
    else {
      result = evaluateGuess(req, res);
    }
  }
  catch (e) {
    result = handleError(e);
  }
  console.log(result);
  if(result) { writeResult(res, result); }
}

function resetGame(req) {
  
  req.session.guesses = 0;
  req.session.answer = Math.floor(Math.random() * req.query.max)+1;
  console.log(req.session.answer);
}

function evaluateGuess(req, res) {

  if(isGuessCorrect(req)) {
    result = winGame(req, res);
  }
  else {
    incrementGuesses(req);
    result = {gameStatus: "", guesses: req.session.guesses};
  }

  return result;
}

function isGuessCorrect(req) {
  return req.query.guess == req.session.answer
}

function winGame(req, res) {
  incrementGuesses(req);
  result = {gameStatus: "won", guesses: req.session.guesses}
  req.session.answer = undefined;
  return result;
}

function incrementGuesses(req) {
  req.session.guesses += 1;
}

function register(req, res){
    if (req.query.email == undefined || !validateEmail(req.query.email))
    {
      writeResult(res, {'error' : "Please specify a valid email"});
    }

    if (req.query.password == undefined || !validatePassword(req.query.password))
    {
      writeResult(res, {'error' : "Password must have a minimum of eight characters, at least one letter and one number"});
    }

    let hash = bcrypt.hashSync(req.query.password, 12);
    con.query("INSERT INTO Users (Email, Pass) VALUES (?, ?)", [req.query.email, hash], function (err, result, fields) 
    {
      if (err) 
      {
        if (err.code == "ER_DUP_ENTRY")
        {
            err = "User account already exists.";
        }
        writeResult(req, res, {'error' : err});
        }
        else
        {
          con.query("SELECT * FROM Users WHERE Email = ?", [req.query.email], function (err, result, fields) 
          {
            if (err){
              writeResult(res, {'error' : err});

            }else
            {
              req.session.user = {'result' : {'id': result[0].Id, 'email': result[0].Email}};
              console.log(req.session.user);
              writeResult(req, res, req.session.user);
            }
          });
        }
      });
}

function login(req, res){
    if (req.query.email == undefined)
    {
      writeResult(res, {'error' : "Email is required"});
    }

    if (req.query.password == undefined)
    {
      writeResult(res, {'error' : "Password is required"});
    }
    
    con.query("SELECT * FROM Users WHERE Email = ?", [req.query.email], function (err, result, fields) 
    {
      if (err) 
        writeResult(res, {'error' : err});
      else
      {
        if(result.length == 1 && bcrypt.compareSync(req.query.password, result[0].Pass))
        {
          req.session.user = {'result' : {'id': result[0].Id, 'email': result[0].Email}};
          writeResult(res, req.session.user);
        }
        else 
        {
          writeResult(res, {'error': "Invalid email/password"});
        }
        }
      });
  }

function logout(req, res)
  {
    req.session.user = undefined;
    writeResult(res, {'result' : 'Nobody is logged in.'});
  }

function validateEmail(email) 
  {
    if (email == undefined)
    {
      return false;
    }
    else
    {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
  }

function validatePassword(pass)
  {
    if (pass == undefined)
    {
      return false;
    }
    else
    {
      const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      return re.test(pass);
    }
  }

  function addScore(req, res)
  {

    console.log(3);
    isLogged(req,res);

    if(req.query.score == undefined){
      writeResult(req, res, {'error': 'input a score'})
    }

    con.query('INSERT INTO Scores (GuessAmt, Id) VALUES (?, ?)', [req.query.score, req.session.user.result.id], function (err, result, fields) 
    {
      if (err) 
        writeResult(req, res, {'error' : err});
      else
      {
        
            writeResult(res, {'result': result});
          }
          
        
    });
  }

function listScores(req, res){
  isLogged(req, res);

  con.query("SELECT Sid AS scoreId, Id AS userId, GuessAmt AS scoreName FROM Songs WHERE Id = ? ORDER BY Sid", [req.session.user.result.id], function (err, result){
    if(err)
    {
      writeResult(req, res, {'error': err});
    }
    else
    {
      writeResult(req, res, {'result': result});
    }
  })
}

function clear(req, res)
{
  isLogged(req,res);

  con.query('DELETE FROM Scores WHERE Id =?', [req.session.user.result.id], function (err, result, fields) 
  {
    if (err) 
      writeResult(res, {'error' : err});
    else
    {
      listSongs(req, res);
    }
  });
}

function isLogged(req, res)
{
  if(req.session.user == undefined){
    writeResult(req, res, {'error': 'no one is currently logged in'})
  }
}

function writeResult(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function serveIndex(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    var index = fs.readFileSync('index.html');
    res.end(index);
}


const express = require('express');
const app = express();

var mysql = require('mysql');

const conInfo = 
{
    host: 'localhost',
    user: 'root',
    password: "",
    database: "GAMEDB"
};

// install session module first using 'npm install express-session'
var session = require('express-session'); 
app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 60000 }}))

app.get('/', instructions);                  
app.get('/game', game);
app.get('/list', list)
app.listen(3000,  process.env.IP, startHandler())

function startHandler()
{

  console.log('Server listening on port ' + 3000)
}

function game(req, res)
{
  
  let result = {};
  try
  {

    var con = mysql.createConnection(conInfo);
    // if we have not picked a secret number, restart the game...
    if (req.session.answer == undefined)
    {
      req.session.guesses = 0;
      req.session.answer = Math.floor(Math.random() * 100) + 1;
    }
      
    // if a guess was not made, restart the game...
    
    if (req.query.guess == undefined)
    {
      result = {'gameStatus' : 'Pick a number from 1 to 100.'}; 
      req.session.guesses = 0;
      req.session.answer = Math.floor(Math.random() * 100) + 1;
    }
    // a guess was made, check to see if it is correct...
    else if (req.query.guess == req.session.answer)
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : `Correct! It took you ${req.session.guesses} guesses. Play Again!`}; 
      con.connect;
      con.query("INSERT INTO GAMES (SCORES) VALUES ('?')",[req.session.guesses]);
      
      req.session.answer = undefined;
    }
    // a guess was made, check to see if too high...
    else if (req.query.guess > req.session.answer)
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : 'Too High. Guess Again!', 'guesses' : req.session.guesses}; 
    }
    // a guess was made, it must be too low...
    else
    {
      req.session.guesses = req.session.guesses + 1;
      result = {'gameStatus' : 'Too Low. Guess Again!', 'guesses' : req.session.guesses}; 
    };
  }
  catch (e)
  {
    result = {'error' : e.message};
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
}

function instructions(req, res)
{

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("<h1>Number Guessing Game</h1>");
  res.write("<p>Use /game to start a new game.</p>");
  res.write("<p>Use /game?guess=num to make a guess.</p>");
  res.write("<p>Use /list to see your stats.</p>");
  res.end('');
}

function list(req, res)
{

  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
    else
    {
      con.query("SELECT MIN(SCORES) AS best, MAX(SCORES) AS worst, COUNT(SCORES) AS gamesPlayed FROM GAMES", function (err, result, fields) 
      {
        if (err) 
          writeResult(req, res, {'error' : err});
        else
          writeResult(req, res, {'result' : result});
      });
    }
  });
}

function writeResult(req, res, obj)
{
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}
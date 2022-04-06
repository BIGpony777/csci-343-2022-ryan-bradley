const express = require("express");
const session = require("express-session");

const http = require('http');
const fs = require('fs');

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

function writeResult(res, result) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.end(JSON.stringify(result));
}

function serveIndex(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});
    var index = fs.readFileSync('index.html');
    res.end(index);
}


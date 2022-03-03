const express = require('express');
const app = express();

// install mysql module first using 'npm install mysql'
var mysql = require('mysql');

const conInfo = 
{
    host: 'localhost',
    user: 'root',
    password: "",
    database: "GIFTDB"
};

var session = require('express-session'); 
app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 6000000 }}))

app.get('/', list);                  
app.get('/add', add);
app.get('/clear', clear);
app.all('/info', info);

app.listen(3000,  process.env.IP, startHandler())

function startHandler()
{
  console.log('Server listening on port ' + 3000)
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
      con.query("SELECT GName FROM Gifts", function (err, result, fields) 
      {

        let final = [];
        result.forEach(item => final.push(item.GName));

        if (err) 
          writeResult(req, res, {'error' : err});
        else
          writeResult(req, res, {'gifts' : final});
      });
    }
  });
}

function add(req, res)
{

  if(req.session.giftsadded == undefined){
      req.session.giftsadded = 0;
  }

  req.session.giftsadded++;

  if(req.session.totalgifts == undefined){
      req.session.totalgifts = 0;
  }

  req.session.totalgifts++;

  if (req.query.gift == undefined)
    writeResult(req, res, {'error' : "add requires you to enter a gift"});
  else
  {
    var con = mysql.createConnection(conInfo);
    con.connect(function(err) 
    {
      if (err) 
        writeResult(req, res, {'error' : err});
      else
      {
        con.query('INSERT INTO Gifts (GName) VALUES (?)', [req.query.gift], function (err, result, fields) 
        {
          if (err) 
            writeResult(req, res, {'error' : err});
          else
          {
            con.query("SELECT GName FROM Gifts ORDER BY GName", function (err, result, fields) 
            {

                let final = [];
        result.forEach(item => final.push(item.GName));

              if (err) 
                writeResult(req, res, {'error' : err});
              else
                writeResult(req, res, {'gifts' : final});
            });
          }
        });
      }
    });
  }
}

function clear(req, res)
{
    req.session.totalgifts = 0;
  var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
    else
    {
      con.query('DELETE FROM Gifts', function (err, result, fields) 
      {
        if (err) 
          writeResult(req, res, {'error' : err});
        else
        {
          con.query("SELECT GName FROM Gifts ORDER BY GName", function (err, result, fields) 
          {
            if (err) 
              writeResult(req, res, {'error' : err});
            else
              writeResult(req, res, {'gifts' : result});
          });
        }
      });
    }
  });
}

function writeResult(req, res, obj)
{
  if (req.session.commandCount == undefined)
    req.session.commandCount = 0;

  req.session.commandCount++;

  
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end('');
}

function info(req, res){

    if(req.session.commandCount == undefined || req.session.commandCount < 0){
        req.session.commandCount = 0;
    }

    if(req.session.giftsadded == undefined){
        req.session.giftsadded = 0; 
    }

    if(req.session.totalgifts == undefined){
        req.session.totalgifts = 0;
    }
    var con = mysql.createConnection(conInfo);
  con.connect(function(err) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
    else
    {
      con.query("SELECT COUNT(GName) AS totalGifts FROM Gifts", function (err, result, fields) 
      {
        if (err) 
          writeResult(req, res, {'error' : err});
        else

        
        req.session.commandCount = req.session.commandCount - 1;
        writeResult(req, res, {'sessionVisits' : req.session.commandCount, 'sessionGiftsAdded': req.session.giftsadded, '': result});
      });
    }
  });


    
}
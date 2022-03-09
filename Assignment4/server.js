const express = require('express');
const app = express();

const mysql = require('mysql');

const bcrypt = require('bcrypt');

const conInfo = 
{
  host: 'localhost',
  user: 'root',
  password: "",
  database: "UserSong"
};

let con = mysql.createConnection(conInfo);
con.connect(function(err) {
  if(err)
    throw err;
});

const session = require('express-session'); 
app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 6000000 }}));

app.all('/', whoIsLoggedIn);                  
app.all('/register', register);
app.all('/login', login);
app.all('/logout', logout);    
app.all('/addSong', addSong);    
app.all('/listSongs', listSongs);
app.all('/removeSong', remove);
app.all('/clearSongs', clear);

const port = 3000;
app.listen(port, process.env.IP, startHandler());

function startHandler()
  {
    console.log('Server listening on port: ' + port);
  }

function whoIsLoggedIn(req, res)
  {
    if (req.session.user == undefined)
      writeResult(req, res, {'result' : 'Nobody is logged in.'});
   else{
      writeResult(req, res, req.session.user);
    }
  }

function register(req, res)
  {
    if (req.query.email == undefined || !validateEmail(req.query.email))
    {
      writeResult(req, res, {'error' : "Please specify a valid email"});
    }

    if (req.query.password == undefined || !validatePassword(req.query.password))
    {
      writeResult(req, res, {'error' : "Password must have a minimum of eight characters, at least one letter and one number"});
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
            if (err) 
              writeResult(req, res, {'error' : err});
            else
            {
              req.session.user = {'result' : {'id': result[0].Id, 'email': result[0].Email}};
              writeResult(req, res, req.session.user);
            }
          });
        }
      });
}

function login(req, res)
  {
    if (req.query.email == undefined)
    {
      writeResult(req, res, {'error' : "Email is required"});
    }

    if (req.query.password == undefined)
    {
      writeResult(req, res, {'error' : "Password is required"});
    }
    
    con.query("SELECT * FROM Users WHERE Email = ?", [req.query.email], function (err, result, fields) 
    {
      if (err) 
        writeResult(req, res, {'error' : err});
      else
      {
        if(result.length == 1 && bcrypt.compareSync(req.query.password, result[0].Pass))
        {
          req.session.user = {'result' : {'id': result[0].Id, 'email': result[0].Email}};
          writeResult(req, res, req.session.user);
        }
        else 
        {
          writeResult(req, res, {'error': "Invalid email/password"});
        }
        }
      });
  }
 
function logout(req, res)
  {
    req.session.user = undefined;
    writeResult(req, res, {'result' : 'Nobody is logged in.'});
  }

function writeResult(req, res, obj)
  {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(obj));
    res.end('');
  }

function validateEmail(email) 
  {
    if (email == undefined)
    {
      return false;
    }
    else
    {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
      var re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      return re.test(pass);
    }
  }

function addSong(req, res)
  {
    isLogged(req,res);

    if(req.query.song == undefined){
      writeResult(req, res, {'error': 'input a song title'})
    }

    con.query('INSERT INTO Songs (Name, Id) VALUES (?, ?)', [req.query.song, req.session.user.result.id], function (err, result, fields) 
    {
      if (err) 
        writeResult(req, res, {'error' : err});
      else
      {
        con.query("SELECT Sid AS songId, Id AS userId, Name AS songName FROM Songs WHERE Id = ? AND Sid = (SELECT max(Sid) FROM Songs) ORDER BY Sid", [req.session.user.result.id], function (err, result){
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
    });
  }

function listSongs(req, res){
  isLogged(req, res);

  con.query("SELECT Sid AS songId, Id AS userId, Name AS songName FROM Songs WHERE Id = ? ORDER BY Sid", [req.session.user.result.id], function (err, result){
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

function remove(req, res)
{
  isLogged(req,res);
  
  if (req.query.song == undefined){
    writeResult(req, res, {'error' : "add requires you to enter a song"});}
  
    con.query('DELETE FROM Songs WHERE (Name = ?) AND (Id =?)', [req.query.song, req.session.user.result.id], function (err, result, fields) 
    {
      if (err) 
        writeResult(req, res, {'error' : err});
      else
      {
        listSongs(req, res);
      }
  });
}

function clear(req, res)
{
  isLogged(req,res);

  con.query('DELETE FROM Songs WHERE Id =?', [req.session.user.result.id], function (err, result, fields) 
  {
    if (err) 
      writeResult(req, res, {'error' : err});
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
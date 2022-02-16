const express = require('express');
const app = express();

const session = require('express-session'); 
app.use(session({ secret: 'happy jungle', 
                  resave: false, 
                  saveUninitialized: false, 
                  cookie: { maxAge: 6000000 }}))

try{
  app.get('/', favorites);                  
  app.get('/sort', sort);
  app.get('/add', add);
  app.get('/remove', remove);
  app.get('/clear', clear);
  app.listen(3000,  process.env.IP, startHandler())
}
catch (e){

  let error = {'error': e.message};
  res.write(JSON.stringify(error));
  res.end('');
}

function startHandler(){

  console.log('Server listening on port ' + 3000)
}

function favorites(req, res){

  if (req.session.favorites == undefined){
      req.session.favorites = [];
  }
  end(req, res);
}

function sort(req, res){

  if (req.session.favorites == undefined ){
    throw Error("no songs on your playlist");
  }
  req.session.favorites = req.session.favorites.sort();
  end(req, res);
}

function add(req, res){

  if (req.session.favorites == undefined ){
    req.session.favorites = [];
  }
  if(req.query.song != undefined && req.session.favorites != undefined){
    req.session.favorites.push(req.query.song);
  }
  else if(req.query.song == undefined){
    throw Error("enter a song to add to your list");
  }
  end(req, res);
}

function remove(req, res){

  if (req.session.favorites == undefined ){
    throw Error("no songs on your playlist");
  }else if(req.query.song == undefined){
    throw Error("you must include a song to remove");
  }
  let song = req.query.song;
  for (let i = 0; i < (req.session.favorites).length; i++){
    if(req.session.favorites[i] == song){
      (req.session.favorites).splice(i, 1);
    }
  }
  end(req, res);
}

function clear(req, res){

  req.session.favorites = [];
  end(req, res);
}

function end(req, res){

  let result = {'songs' : req.session.favorites}
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(result));
  res.end('');
}
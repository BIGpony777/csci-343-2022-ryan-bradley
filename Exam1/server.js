let http = require('http');
let server = http.createServer(requestHandler);
server.listen(3000, process.env.IP, startHandler);

function startHandler(){

  let addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
}

function requestHandler(req, res){
    
  try{
    let url = require('url');
    let url_parts = url.parse(req.url, true);
    let query = url_parts.query;
    let result = {};
    res.writeHead(200, {'Content-Type': 'application/json'});
    switch(query['cmd']){
      case(undefined):
        throw Error("A command must be specified");
      break;

      case('calcDistance'):
        result = calcDistance(query); 
      break;
      
      case('calcCost'):
      result = calcCost(query);
      break;
    }
    res.write(result);           
  }

  catch (e){

    let error = {'error': e.message};
    res.write(JSON.stringify(error));
    res.end('');
  }
}

function calcDistance(query){

  if (query['budget'] == undefined || query['mpg'] == undefined || query['fuelCost'] == undefined){
    throw Error('You need a budget, mpg, and fuelCost');
  }else if(query['budget'] < 0 || query['mpg'] <= 0 || query['fuelCost'] < 0){
    throw Error('Your values cannot be negative, and mpg must be greater than 0');
  }else if(isNaN(query['budget']) || isNaN(query['mpg']) || isNaN(query['fuelCost'])){
    throw Error('Your values have to be numbers')
  }else{
    let budget = parseFloat(query['budget']);
    let mpg = parseFloat(query['mpg']);
    let fuelCost = parseFloat(query['fuelCost']);
    let fuel = budget/fuelCost;
    let distance = fuel*mpg;
    let result = {'distance': distance}
    return JSON.stringify(result);
  }
}

function calcCost(query){

  if (query['distance'] == undefined || query['mpg'] == undefined || query['fuelCost'] == undefined){
    throw Error('You need a distance, mpg, and fuelCost');
  }else if(query['distance'] < 0 || query['mpg'] <= 0 || query['fuelCost'] < 0){
    throw Error('Your values cannot be negative, and mpg must be greater than 0');
  }else if(isNaN(query['distance']) || isNaN(query['mpg']) || isNaN(query['fuelCost'])){
    throw Error('Your values have to be numbers')
  }else{
    let distance = parseFloat(query['distance']);
    let mpg = parseFloat(query['mpg']);
    let fuelCost = parseFloat(query['fuelCost']);
    let gallons = distance/mpg;
    let cost = fuelCost * gallons;

    let result = {'cost': cost}
    return JSON.stringify(result);
  }
}
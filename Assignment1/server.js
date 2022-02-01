let http = require('http');
let server = http.createServer(requestHandler);
server.listen(process.env.PORT, process.env.IP, startHandler);

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
    switch(query['cmd']){
      case(undefined):
      throw Error("A command must be specified");
      break;

      case('dotted'):
      setHTML(res);
      result = dotted(query);
      break;

      case('numCheck'):
      setHTML(res);
      result = numCheck(query);
      break;

      case('gradeStats'):
      setJSON(res);
      result = gradeStats(query); 
      break;
      
      case('calculateRectangleProperties'):
      setJSON(res);
      result = calculateRectangleProperties(query);
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

function dotted(query){

  if(query['word1'] ==undefined || query['word2']==undefined){
    throw Error('Expecting two words');   
  }
  else if( query['word1'].length + query['word2'].length> 30){
    throw Error('Words should be less than 30 characters in total');
  }
  else{
    let size = query['word1'].length + query['word2'].length;
    let result= '';
    result += '<p> ';
    result += query['word1'];
    for(let i=0; i<30 - size; i++){
      result += '.';
    }
    result += ' ' + query['word2'];
    result +=' </p>';
    return result;
  }
}

function numCheck(query){

  if(query['start'] ==undefined || query['end']==undefined ||query['start']>99||query['end']>99||query['start']>query['end']){
    throw Error('Expecting a start and end number less than 99, where start is less than end');   
    }
  else{
    let start = query['start'];
    let end = JSON.stringify(parseInt(query['end'])+1);
    let result = ' ';
    result += '<p>'      
    for(let i =start; i<end; i++){
      if (i % 3 == 0 && i % 5 == 0){
        result += 'ThFi';
  }else if(i % 3 == 0){
    result += 'Th';
  }else if(i % 5 == 0){
    result += 'Fi';
  }else{
    result += (JSON.stringify(i));
  } 
    result += ' <br>';
  }
    result += ' </p>';
    return result;
  } 
} 

function gradeStats(query){

  if (query['grade'] == undefined || query['grade'].length<2){
    throw Error('You need to input at least two grades');
  }else{
    let size = query['grade'].length;
    let min = parseInt(query['grade'][0]);
    let max = parseInt(query['grade'][0]);
    let total = 0;
    for (let i = 0;i < size;i++){
      total = total + parseInt(query['grade'][i]);
      if(min > parseInt(query['grade'][i])){
        min = parseInt(query['grade'][i]);
      }
      if(max < parseInt(query['grade'][i])){
        max = parseInt(query['grade'][i]);
      }
    }
    let result = {'Average':total/size,'Minimum': min ,'Maximum': max};
    return JSON.stringify(result);
  }
}

function calculateRectangleProperties(query){

  if (query['length']==undefined||query['width']==undefined){
    throw Error('You need a length and width');
  }else{
    let length = parseInt(query['length']);
    let width = parseInt(query['width']);
    let result = {'area': length * width,'perimeter': length + length + width + width}
    return JSON.stringify(result);
  }
}

function setJSON(res){

  res.writeHead(200, {'Content-Type': 'application/json'});
}

function setHTML(res){

  res.writeHead(200, {'Content-Type': 'text/html'});
}

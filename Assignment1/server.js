var http = require('http');
var server = http.createServer(requestHandler);
server.listen(process.env.PORT, process.env.IP, startHandler);

function startHandler(){

    var addr = server.address();
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

                case('dotted'):
                    result = dotted(query, res);
                break;

                case('numCheck'):
                result = numCheck(query, res);
                break;

                case('gradeStats'):
                result = gradeStats(query, res);
                res.write(JSON.stringify(result));
                break;

                case('calculateRectangleProperties'):
                result = calculateRectangleProperties(query, res);
                res.write(JSON.stringify(result));
                break;
               
            }
}
catch (e){
    let error = {'error': e.message};
    res.write(JSON.stringify(error));
    res.end('');
}
}

function dotted(query, res){

    res.writeHead(200, {'Content-Type': 'text/html'});
    
    
if(query['word1'] ==undefined || query['word2']==undefined){
throw Error('Expecting two words');   
}
else if( query['word1'].length + query['word2'].length> 30){
throw Error('Words should be less than 30 characters in total');
}
else{
    let size = query['word1'].length + query['word2'].length;
    res.write('<p>');
    res.write(query['word1']);
   for(let i=0; i<30 - size; i++){
    res.write('.');
   }

   res.write(query['word2']);
   res.write('</p>');
}

}
function numCheck(query, res){

    res.writeHead(200, {'Content-Type': 'text/html'});
    if(query['start'] ==undefined || query['end']==undefined){
      throw Error('Expecting a start and end number');   
    }
    else{
        let start = query['start'];
        let end = query['end'];

        res.write('<p>');
       for(let i =start; i<end; i++){
            let output = '';
          if (i % 3 === 0) { output += 'Th' };
          if (i % 5 === 0) { output += 'Fi' };
          if (output === '') { output = JSON.stringify(i) };
          res.write(output);
          res.write('<br>');
       }

       res.write('</p>');
    }
   
}
function gradeStats(query, res){

    res.writeHead(200, {'Content-Type': 'application/json'});
    if (query['grade']==undefined){
        throw Error('You need to input at least one grade');
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
        return result;
    }

}
function calculateRectangleProperties(query, res){

    res.writeHead(200, {'Content-Type': 'application/json'});
    if (query['length']==undefined||query['width']==undefined){
        throw Error('You need a length and width');
    }else{
        let length = parseInt(query['length']);
        let width = parseInt(query['width']);
        let result = {'area': length * width,'perimeter': length + length + width + width}
        return result;
    }
}
var http = require('http');
var mime = require('mime');
var logger = require('./lib/log.js');
var serverPort = 3000;



var server =  http.createServer(function(req,res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('Server is running');
	res.end();
});

server.listen(serverPort, function(){
    var d = new Date();
    logger.info('Server is running at port ' + serverPort);
});

var game = require('./lib/game.js');
game.listen(server);
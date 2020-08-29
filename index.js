/**
 * primary file for the api
 *
 */

//  dependency
var http = require("http");
var https = require("https");
var url = require("url");
var {StringDecoder} = require('string_decoder');
var config  = require('./config')
var fs = require('fs');

var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res)
});

httpServer.listen(config.httpPort, function () {
  console.log(`the sever is listening in ${config.httpPort} in ${config.envName}`);
});

var httpsServerOptions = {
  'key' : fs.readFileSync('./https/server.key'),
  'cert' :fs.readFileSync('./https/server.cert'),
}

var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res)
});

httpsServer.listen(config.httpsPort, function () {
  console.log(`the sever is listening in ${config.httpsPort} in ${config.envName}`);
});



var unifiedServer  =  function (req, res){
  var parsedUrl = url.parse(req.url,true)
  var path = parsedUrl.pathname
  var trimmedPath = path.replace(/^\/+|\/+$/g,'')
  var method = req.method.toLowerCase()
  var queryStringObject = parsedUrl.query
  var headers = req.headers

  var decoder = new StringDecoder('utf-8')

  var buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data)
  })
  req.on('end', function(){
    buffer += decoder.end()
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    var data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    }
    chosenHandler(data, function(statusCode, payload){
       statusCode = typeof(statusCode) === 'number' ? statusCode : 200
       payload = typeof(payload) == 'object' ? payload : {}
       payloadString = JSON.stringify(payload)

       res.setHeader('Content-Type', 'application/json')
       res.writeHead(statusCode)
       res.end(payloadString)
       console.log(`we r returning the ${payloadString} , ${statusCode}`)
    })


  })
}


//fine the handler
handlers = {}

handlers.sample = function(data, callback){
  callback(406, {'name': 'sample handler'})
}

handlers.notFound = function(data, callback){
  callback(404)
}
// defining the router
var router = {
  'sample': handlers.sample
}
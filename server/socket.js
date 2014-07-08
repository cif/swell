// socket.io setup
// handles socket server traffic
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com


(function(){
  
  var path = require('path');
  var io = require('socket.io');
  var server, app, config; 
  var render = require('./render');
  var setup = function(_server, _app, _config){
 
    // scope varaiables
    server = _server;
    app = _app;
    config = _config;
    
    // start listening
    socket = io.listen(server, config.server.socket_io);
    
  };
  
  // an interface that allows events to emit from the router and responder
  var emit = function(event, data){
    
    
  }; //end emit()
  
  exports.emit = emit;
  exports.setup = setup;
  
})();

// swell server. 
// express connect base with socket io. optional routes can be set with swell.json
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var path = require('path');
  var http = require('http');  
  var express = require('express');  
  var io = require('socket.io');
  var config, swell, app, server, socket, router, nwatch;
  
  require('./inflector');  // contains string prototype methods for inflection 
  
  var start = function(options, watching){
    
    // config
    config = options;
    
    // initialize express server
    app = express();
    server = http.createServer(app); 
    
    // start the socket server
    socket = io.listen(server, config.server.socket_io);
    
    // set up the static routes
    app.use('/js', express.static(path.resolve(config.base + 'public/js')));
    app.use('/img', express.static(path.resolve(config.base + 'public/images')));
    app.use('/public', express.static(path.resolve(config.base + 'public')));
    
    // require the server side of swell, the wrapper method is used for watching and catching syntax errors
    get_swell();
    
    // initialize the router
    router = require(config.base + 'service/router');
    router.setup(app, swell, socket, config);
    
    // middleware sets up sessions, any other required plugins for rendering, auth etc.
    middle = require(config.base + 'service/middleware');
    middle.setup(express, app, swell, socket, config);
    
    // start the party
    server.listen(config.server.port);
    console.log('[swell] server listening on port ' + config.server.port);
    
    // watch if we are developing
    if(watching){
      nwatch = require('node-watch');
      nwatch([config.base + 'service/swell.js'], get_swell);
    }
    
    
  };  // end start()
  
  var watch = function(){
    
    // when watching, delete the require cache and re-require the re-compiled swell services
    swell = require(path.resolve(config.base + 'service/swell'));
    
  };  // end watch()
  
  var get_swell = function(){
    
    try {
      
      delete require.cache[path.resolve(config.base + 'service/swell.js')]
      swell = require(path.resolve(config.base + 'service/swell'));
      if(router) router.update(swell);
      
    } catch (e) {
      
      console.log('[swell-server] Caught error in service/swell.js');
      console.log(e);
      console.trace();
      
    }
    
    
  }; // end get_swell();
  
  exports.start = start;
  
})()
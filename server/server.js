// swell server. 
// express connect base with socket io. optional routes can be set with swell.json
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var path = require('path');
  var http = require('http');  
  var express = require('express');  
  var config, swell, app, server, socket, router, nwatch;
  
  require('./inflector');  // contains string prototype methods for inflection 
  
  var start = function(options, watching){
    
    // config
    config = options;
    config.watching = watching;
    
    // initialize express server
    app = express();
    server = http.createServer(app); 
    
    // start the socket server
    socket = require(config.base + 'server/socket');
    socket.setup(server, app, config);
    
    // middleware sets up sessions, any other required plugins for rendering, auth etc.
    middle = require(config.base + 'server/middleware');
    middle.setup(express, app, socket, config);
    
    // initialize the router
    router = require(config.base + 'server/router');
    router.setup(app, socket, config);
    
    // require the server side of swell, 
    // the wrapper method is used for watching and catching syntax errors
    get_swell();
    
    // start the party
    server.listen(config.server.port);
    console.log('[swell] server listening on port ' + config.server.port);
    
    // watch if we are developing
    if(watching){
      nwatch = require('node-watch');
      nwatch([config.base + 'server/swell.js'], get_swell);
    }
    
  };  // end start()
  
  var watch = function(){
    
    // when watching, delete the require cache and re-require the re-compiled swell services
    swell = require(path.resolve(config.base + 'server/swell'));
    
  };  // end watch()
  
  var get_swell = function(){
    
    try {
      
      delete require.cache[path.resolve(config.base + 'server/swell.js')];
      swell = require(path.resolve(config.base + 'server/swell'));
      if(router) router.update(swell);
      
    } catch (e) {
      
      console.log('[swell-server] Caught error in server/swell.js:');
      console.log(e);
      console.trace();
      
    }
    
    
  }; // end get_swell();
  
  exports.start = start;
  
})();
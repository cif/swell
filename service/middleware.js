// swell middleware. 
// a convenient place to setup express middleware
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com


(function(){
  
  var express, app, service, config, socket;  
  var render = require('./render');
  var setup = function(_express, _app, _swell, _socket, _config){
 
    // scope varaiables
    express = _express;
    app = _app;
    service = _swell;
    socket = _socket;
    config = _config;
    
    // cookies and sessions
    app.use(express.cookieParser(config.server.cookie_hash || 'default-hash'));
    app.use(express.session({secret: config.server.cookie_secret || 'default-secret'}));
    
    // dust views configuration
    render.setup(express, app, swell, socket, config);
    
    // basics
    app.use(express.urlencoded());
    app.use(express.json());
    
    
  };
  
  exports.setup = setup;
  
})()

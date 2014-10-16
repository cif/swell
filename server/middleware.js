// swell middleware. 
// a convenient place to setup express middleware
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var path = require('path');
  var express, app, config, socket;  
  var render = require('./render');
  var connect = require('connect');
  var setup = function(_express, _app, _socket, _config){
 
    // scope varaiables
    express = _express;
    app     = _app;
    socket  = _socket;
    config  = _config;
    
    // set up the static routes
    app.use('/js', express.static(path.resolve(config.base + 'public/js')));
    app.use('/img', express.static(path.resolve(config.base + 'public/img')));
    app.use('/svg', express.static(path.resolve(config.base + 'public/svg')));
    app.use('/public', express.static(path.resolve(config.base + 'public')));
    app.get('/favicon.ico', function(req, res){ res.sendFile(path.resolve(config.base + 'public/favicon.ico')); });
    
    // cookies and sessions
    app.use(connect.cookieParser(config.server.cookie_secret));
    app.use(connect.session({secret: config.server.cookie_secret}));
    
    // basics
    app.use(connect.urlencoded());
    app.use(connect.json());
    app.use(connect.compress());
    
    // custom midedleware handlers. Example:
    /* 
     app.get('/middleware', function(req, res){
      res.end('Hello world');
     });
    */
    
    // timeout, not sure this is working as indended... test ALL your responses!
    app.use(connect.timeout(config.server.timeout));
    
    // dust views configuration
    render.setup(express, app, socket, config);
    
  };
  
  
  exports.setup = setup;
  
})();
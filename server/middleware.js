// swell middleware. 
// a convenient place to setup express middleware
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var path = require('path');
  var express, app, config, socket;  
  var render = require('./render');
  var setup = function(_express, _app, _socket, _config){
 
    // scope varaiables
    express = _express;
    app = _app;
    socket = _socket;
    config = _config;
    
    // set up the static routes
    app.use('/js', express.static(path.resolve(config.base + 'public/js')));
    app.use('/img', express.static(path.resolve(config.base + 'public/img')));
    app.use('/public', express.static(path.resolve(config.base + 'public')));
    app.get('/favicon.ico', function(req, res){ res.sendfile(path.resolve(config.base + 'public/favicon.ico')); });
    
    // cookies and sessions
    app.use(express.cookieParser(config.server.cookie_hash || 'default-hash'));
    app.use(express.session({secret: config.server.cookie_secret || 'default-secret'}));
    
    // dust views configuration
    render.setup(express, app, socket, config);
    
    // basics
    app.use(express.urlencoded());
    app.use(express.json());
    
    // custom midedleware handlers. Example:
    /* 
     app.get('/a_middleware_example', function(req, res){
      res.send('Hello world');
     });
    */
    
    // timeout, not sure this is working correctly, test ALL your responses!
    app.use(express.timeout(config.server.timeout));
    
    
    
  };
  
  
  exports.setup = setup;
  
})();
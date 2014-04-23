// swell rendering engine. 
// sends response from the router back to the client based on data props
             
// 2014-04-20
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var dust = require('dustjs-linkedin');
  var dustjs = require('adaro'); // used for rendering view with dust
  var setup = function(_express, _app, _swell, _socket, _config){
 
    // scope varaiables
    express = _express;
    app = _app;
    service = _swell;
    socket = _socket;
    config = _config;
    
    app.engine('dust', dustjs.dust({
      views:  config.base + config.server.views,
      layout: "layouts/app",
      cache:true
    }));
    app.set('view engine', 'dust');
    
  }; // end setup()
  
  var out = function(err, data, emit, res){
    
    
    
    if(data.view){
      
      // render the template with dust
      res.render('index', data, function(err, data){
        
        if(err){  // send and log the error
          
          res.set('Content-Type','text/plain');
          res.status(500);
          res.send(err.toString());
          console.trace();
          
          
        } else {  // send the html
          
          res.set('Content-Type','text/html');
          res.status(200);
          res.send(data);
          
        }
        
      });
      
    } else {  // the final assumption is that we are sending raw json data
      
      res.set('Content-Type','application/json');
      res.status(200);
      res.send(data);
      
    }
    
  }; // end out();
  
  exports.out = out;
  exports.setup = setup;
  
})()
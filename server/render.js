// swell rendering engine. 
// sends response from the router back to the client based on data props
             
// 2014-04-20
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var fs = require('fs');
  var dust = require('dustjs-linkedin');
  var dustjs = require('adaro'); // used for rendering view with dust
  var showdown = require('showdown');
  var converter = new showdown.converter(); // allows for markdown within dust templates
  var setup = function(_express, _app, _socket, _config){
  
    // scope varaiables
    express = _express;
    app = _app;
    socket = _socket;
    config = _config;
    
    dustjs.onLoad = preprocess;
    app.engine('dust', dustjs.dust({
      views:  config.base + config.server.views,
      layout: config.server.layout,
      cache: !config.watching
    }));
    app.set('view engine', 'dust');
    
    // server side view helpers
    dustjs.helpers.cache_buster = function(chunk, context, bodies, params) { return chunk.write(Math.round(Math.random() * 1000000)); };
    dustjs.helpers.svg = function(chunk, context, bodies, params) { return chunk.write(fs.readFileSync(config.base + '/public/svg/' + params.file + '.svg')); };
    
  }; // end setup()
  
  
  var preprocess = function(name, context, callback){
    
    // the preprocessor method allows for markdown to be 
    // converted to HTML before sending the dust template 
    // off to be compiled and rendered / mashed up
    var file = config.base + config.server.views + '/' + name + '.dust';
    var tmpl;
    if(name === config.server.layout){   // dont markdown things in the main layout
      tmpl = fs.readFileSync(file,'utf8');
    } else {
      tmpl = converter.makeHtml(fs.readFileSync(file,'utf8'));
    } 
    callback(null, tmpl);
    
    //console.log(name, context, callback);
    
  }; // end preprocess()
  
  
  var out = function(err, data, emit, res, callback){
    
    //  if an error comes back
    //  send it to the browser with 500 status
    if(err){
      
      res.set('Content-Type','text/plain');
      res.status(500);
      res.send(err.toString());
      console.log(err.toString());
      console.trace();
      if(callback) callback.apply(null, data);
    
    
    //  if data.denied comes back
    //  send it to the browser with 403 status  
    } else if(data.denied){
      
      res.set('Content-Type','text/plain');
      res.status(403);
      res.send('403 Unauthorized.');
      if(callback) callback.apply(null, data);
      
    } else if(data.view){
      
      // add configuration variables to view context
      data.config = config;
      
      // render the template with dust
      res.render(data.view, data, function(err, out){
        
        if(err){  // send and log the error
          
          res.set('Content-Type','text/plain');
          res.status(500);
          res.send(err.toString());
          console.log(err.toString());
          console.trace();
          if(callback) callback.apply(null, data);
          
        } else {  
          
          // send the html or xml if specified by the view
          if(data.xml)
            res.header('Content-Type','text/xml');
          else
            res.header('Content-Type','text/html');  
          res.status(200);
          res.send(out);
          if(callback) callback.apply(null, data);
          
        }
        
      });
      
    } else {  // just send raw json data
      
      res.header('Content-Type','application/json');
      res.status(200);
      res.send(data);
      if(callback) callback.apply(null, data);
      
    }
    
  }; // end out();
  
  exports.out = out;
  exports.setup = setup;
  
})();
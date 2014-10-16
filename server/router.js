// swell router. 
// maps routes found in the configuration or default using req uri parts
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com


(function(){
  
 var app, service, config, socket
 var controllers = {};
 var render = require('./render');
 
 var setup = function(_app, _socket, _config){
  
   app    = _app;
   socket = _socket;
   config = _config;
   
   // setup routes specified by routes in config
   for(routed in config.server.routes){

     app.all(routed, route);
     app.options(routed, route);
     
   }

   // all other requests attempt to map req uri
   app.all('*', uri);
    
 }; // end setup()
 
 var route = function(req, res){
   
   // match the reqest url to a route
   var url = req.url;
   if(url.indexOf('?') >= 0) url = url.substring(0, url.indexOf('?'));  // dont match any query sring parameters
   for(route in config.server.routes){

     // replace the string arguments with wildcards for matching the method we are trying to call.
     // TODO: support splats. routing isn't that common these days, naming conventions work fine.
     regex_string = '^' + route.replace(/\:(.*)/g,'(.*)') + '$'
     wild = new RegExp(regex_string);
     if(url.match(wild)){
      
       var matched = config.server.routes[route];
       parts = matched.split('.');
       execute(req, res, parts[0], parts[1]);
       return true;
       
     }
   
   }
   
   // failed to match route
   res.set('Content-Type','text/plain');
   res.status(500);
   res.send('[swell] server executed a route but failed to match the configuration list! Note: splats are not yet supported.')
   
   
 }; //end route()
 
 var uri = function(req, res){
   
   // split the reuqest based on uri
   var uri_parts = req.url.split('/');
       uri_parts.shift();

   // call responder name and the method to call using inflection 
   // default to index or request type
   var method = uri_parts[1] ? uri_parts[1] : 'index';
   execute(req, res, uri_parts[0].camelize(), method, req.method.toLowerCase());
   
 }; // end uri()
 
 
 var execute = function(req, res, responder, method, call_by_type){  // executes the matched function
   
   // ensure responder and method exist
   if(controllers[responder]){
     
     if(controllers[responder][method] || (call_by_type && controllers[responder][call_by_type])){
       
       // parse any additional uri beyond responder/method
       var uri_args = req.url.split('/');  
           uri_args.shift();
           uri_args.shift();
      
       // assign to the request object     
       req.uri_params = uri_args;
       
       // expose res behind the scenes, shortcut cookies
       controllers[responder].res = res;
       controllers[responder].__cookies = req.signedCookies;
       
       // default to type GET, PUT, POST, DELETE etc.
       if(!controllers[responder][method]){ 
         method = call_by_type.toLowerCase();  
       }
       
       // call before on the reponder, send back denied if false
       if(!controllers[responder].before(req)){
         render.out(null, {denied: true}, null, res);
         controllers[responder].after();
       }
     
       // finally, get ready to call the method
       var method_args = [req, function(err, data){
         
         // rendering engine requires data is an object
         var data = data || {};
         
         // render it
         render.out(err, data, res);
         
         // see if there is any data to emit through sockets
         if(data.emit){
    
           if(!data.emit.space) data.emit.space = '/';
           socket.emit(req, data.emit.space, data.emit.event, data);
    
         }
         
         // call after() when render has completed
         controllers[responder].after(err, res);
         
       }];
       
       // call the controller method
       controllers[responder][method].apply(null, method_args);
       
       
     } else {
       
       render.out(new Error('[swell-router] missing expected responder class method: ' + responder + '.' + method), null, res);
     
     }
     
     
   } else {
     
     render.out(new Error('[swell-router] missing expected responder class: ' + responder), null, res);
     
   }
   
 }; // end execute()
 
 
 var update = function(swell){   // refreshes the service property
   
   service = swell;
   
   // instantiate all the responders in advance
   // dont need to do this each request, obviously
   for(obj in service.responders){
     controllers[obj] = new service.responders[obj](config);
   }
   
     
 }; // end update()
 
 exports.setup = setup;
 exports.update = update; 
  
})()
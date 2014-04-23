// swell router. 
// maps routes found in the configuration or default using req uri parts
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com


(function(){
  
 var app, service, config, socket;  
 var render = require('./render'); 
 var setup = function(_app, _swell, _socket, _config){
  
   app = _app;
   service = _swell;
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
   url = req.url;
   if(url.indexOf('?') >= 0) url = url.substring(0, url.indexOf('?')); // dont match any query sring parameters
   for(route in config.server.routes){

     // replace the string arguments with wildcards for matching the method we are trying to call.
     // TODO:  support splats
     regex_string = '^' + route.replace(/\:(.*)/g,'(.*)') + '$'
     wild = new RegExp(regex_string);
     if(url.match(wild)){
      
       matched = config.server.routes[route];
       parts = matched.split('.');
       execute(req, res, parts[0], parts[1]);
       
     }
   
   }
   
 }; //end route()
 
 var uri = function(req, res){
   
   console.log(req);
   res.send('hi from uri');
   
 }; // end uri()
 
 var parse = function(req){   // parses request data from multiple methods into single object 
   
   var data = {};
   
   // add any post body data
   for(obj in req.body){ data[obj] = req.body[obj]; }

   // extend query parameters but dont override post data
   for(obj in req.query){
     if(!data.hasOwnProperty(obj)){
       data[obj] = req.query[obj];
     }
   }
   return data;
 };  //end parse()
 
 
 var execute = function(req, res, responder, method, arguments){  // executes the matched function
   
   console.log(responder, method);
   var args = arguments || [];
   
   // ensure responder and method exist
   if(service.responders[responder]){
     
     var control = new service.responders[responder](config);
     
     if(control[method]){
       
       // get parsed data
       req.data = parse(req);
       
       // call before on the reponder
       if(!control.before(req)){
         send(null, {unauthorized: true}, null, res);
       }
       
       // adjust the arguments and call the responder
       args.unshift(req);
       args.push(function(err, data, emit){
         var data = data || {};
         render.out(err, data, emit, res);
       });
       control[method].apply(null, args);
       
       
     } else {
       
       send('[swell-router] missing expected responder method: ' + responder + '.' + method);
     
     }
     
     
   } else {
     
     send('[swell-router] missing expected responder: ' + responder);
     
   }
   
 }; // end execute()
 
 
 var update = function(swell){   // refreshes the service property
   
   service = swell;
     
 }; // end update()
 
 exports.setup = setup;
 exports.update = update; 
  
})()
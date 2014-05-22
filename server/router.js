// swell router. 
// maps routes found in the configuration or default using req uri parts
             
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com


(function(){
  
 var app, service, config, socket;  
 var render = require('./render'); 
 var formidable = require('formidable'); // used in place of express's soon to be deprecated bodyParser() middleware
 var setup = function(_app, _socket, _config){
  
   app = _app;
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
   if(url.indexOf('?') >= 0) url = url.substring(0, url.indexOf('?')); // dont match any query sring parameters
   for(route in config.server.routes){

     // replace the string arguments with wildcards for matching the method we are trying to call.
     // TODO: really should support splats, but routing isn't that common anyway
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
   res.send('[swell] server executed a route, but failed to match! Note: splats yet to be unsupported')
   
   
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
   if(service.responders[responder]){
     
     var control = new service.responders[responder](config);
     
     if(control[method] || (call_by_type && control[call_by_type])){
       
       // parse any incoming form data
       var form = new formidable.IncomingForm();
       
       form.parse(req, function(err, fields, files) {
         
         if(err) render.out(new Error('[swell-router] failed to parse request body: ' + err.getMessage()), false, false, res);
         
         // get parsed data
         req.data = {}
         for(key in fields){
           req.data[key] = fields[key];
         }
         
         // extend query parameters but dont override post data
         for(obj in req.query){
           if(!req.data.hasOwnProperty(obj)){
             req.data[obj] = req.query[obj];
           }
         }
         
         if(!control[method]){ 
           
           method = call_by_type.toLowerCase();  // default to type GET, PUT, POST, DELETE etc.
           uri_parts = req.url.split('/');       // assume any second argument is an object identifier
           if(uri_parts[2]) req.data.id = uri_parts[2];
           
         }
         
         // call before on the reponder
         if(!control.before(req)){
           render.out(null, {unauthorized: true}, null, res, control.after);
         }
       
         // adjust the arguments and call the responder
         var args = [req, function(err, data, emit){
           var data = data || {};
           render.out(err, data, emit, res, control.after);
         }];
         control[method].apply(null, args);
       
       });
       
       
     } else {
       
       render.out(new Error('[swell-router] missing expected responder class method: ' + responder + '.' + method), false, false, res);
     
     }
     
     
   } else {
     
     render.out(new Error('[swell-router] missing expected responder class: ' + responder), false, false, res);
     
   }
   
 }; // end execute()
 
 
 var update = function(swell){   // refreshes the service property
   
   service = swell;
     
 }; // end update()
 
 exports.setup = setup;
 exports.update = update; 
  
})()
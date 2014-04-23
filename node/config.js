// config manager for swell. 
// reads and writes values 
// syntax:  --add <what e.g. resource> 
//          --config <config.key> "<value>"
//          --remove <config.key>
             
// 2014-04-08
// github.com/cif/swell
// email@benipsen.com

(function(){  
  
 var fs = require('fs');
 var colors = {red: '\u001b[31m', green: '\u001b[32m', yellow: '\u001b[33m', reset: '\u001b[0m'};
 var parse = function(data){
   var obj = false;
   try {
     
     obj = JSON.parse(data);         
   
   } catch (e) {  // catch syntax parsing erors errors
   
     console.log(colors.red + '[swell] Error parsing configuration file! Check for syntax errors: ' + "\n" + err + colors.reset + "\n");
   
   }
   return obj;
 }
 var assign = function(obj, prop, value) {
    
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        assign(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
                 prop,
               value);
    } else
        obj[prop[0]] = value;
 
 }; // end assign()

 var set = function(file, key, value, callback){
   
   if(!value){
     console.log(colors.red + '[swell] Error the --config command expects two values ' + colors.reset + "\n");
     callback(new Error('Swell: A value must be passed to --config command line option'));
     return false;
   }
   
   fs.readFile(file, function(err, data){  // read in the configuration file for manipulation
     
     if(err){ 
       console.log(colors.red + '[swell] Error reading configuration file "'+ file +'": ' + err + colors.reset + "\n");
       callback(err);
     }
     
     // parse config    
     var config = parse(data);
     
     // assign the value to the right key
     assign(config, key, value);
   
     fs.writeFile(file, JSON.stringify(config, null, 2), function(err, data){
         
       if(err){
         console.log(colors.red + '[swell] Error writing configuration file "'+ file +'". Check file permissions: ' + "\n" + err + colors.reset + "\n");
         callback(err);
       } else 
         callback(false, key, value);
      
       
     }); // end fs.writeFile()
       
   }); // end fs.readFile()
   
 };  // end set()
 
 var destroy = function(obj, prop) {
    
    if (typeof prop === "string")
        prop = prop.split(".");

    if (prop.length > 1) {
        var e = prop.shift();
        destroy(obj[e] =
                 Object.prototype.toString.call(obj[e]) === "[object Object]"
                 ? obj[e]
                 : {},
               prop);
    } else 
      delete obj[prop[0]];
 
 }; // end remove()
 
 
 var remove = function(file, key, callback){
   
   fs.readFile(file, function(err, data){  // read in the configuration file for manipulation
     
     if(err){ 
       console.log(colors.red + '[swell] Error reading configuration file "'+ file +'": ' + err + colors.reset + "\n");
       callback(err);
     }
     
     config = parse(data);
     
     // assign the value to the right key
     destroy(config, key);
   
     fs.writeFile(file, JSON.stringify(config, null, 2), function(err, data){
         
       if(err){
         console.log(colors.red + '[swell] Error writing configuration file "'+ file +'". Check file permissions: ' + "\n" + err + colors.reset + "\n");
         callback(err);
       } else 
         callback(false, key);
      
       
     }); // end fs.writeFile()

   }); // end fs.readFile()
   
 };  // end remove()


 // expose methods
 exports.set    = set;
 exports.remove = remove;

 
})();

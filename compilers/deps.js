// deps 'compiler' just concats the contents
// 2014-04-16
// github.com/cif/swell
// email@benipsen.com

// swell notes: 
//   compilers are anything that manipulates a file to generate output
//   they simply implement the following methods to build single files: 
//     .header([namespaces])  
//     .compile(file,[namespace]) and then callback(output)
     

(function(){
  
  var fs = require('fs');
  var compile = function(file, namespace, callback){
    
    try{
      
      var data = fs.readFileSync(file, 'utf8');
      callback(null, data);
      
    } catch (e) {
      
      callback(e);  // catch errors
    
    }
    
  };
  
  var header = function(namespaces){
    
   return '';
    
  };
  
  var footer = function(namespaces){
    
    return '';
    
  };
  
  exports.heading = header;
  exports.footer  = footer;
  exports.compile = compile;


})();
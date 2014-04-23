// dust templates compiler
// 2014-04-09
// github.com/cif/swell
// email@benipsen.com

// swell notes: 
//   compilers are anything that manipulates a file to generate output
//   they simply implement the following methods to build single files: 
//     .header([namespaces])  
//     .compile(file,[namespace]) and then callback(output)
     

(function(){
  
  var fs = require('fs');
  var dust = require('dustjs-linkedin');
  var compile = function(file, namespace, callback){
    
    try{
      
      var name = namespace + '.' + file.replace(/\.dust/,'').substr(file.lastIndexOf('/') + 1, file.length);
      var data = fs.readFileSync(file, 'utf8');
      var compiled = dust.compile(data, name);
      
      callback(null, compiled);
      
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
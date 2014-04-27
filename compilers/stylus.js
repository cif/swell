// stylus compiler
// 2014-04-09
// github.com/cif/swell
// email@benipsen.com

// swell notes: 
//   compilers are anything that manipulates a file to generate output
//   they simply implement the following methods: 
//     .header([namespaces])  
//     .compile(file,[namespace]) and then callback(output)
     

(function(){
  
  var fs = require('fs');
  var stylus = require('stylus');
  
  var compile = function(file, namespace, callback){
    
    try{
      
      var data = fs.readFileSync(file, 'utf8');
      var path = file.substr(0, file.lastIndexOf('/'));
      stylus.render (data, {filename: file}, function(err, css){
        callback(err, css);
      });
      
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
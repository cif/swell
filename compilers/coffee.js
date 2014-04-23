// coffeescript compiler
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
  var coffeescript = require('coffee-script');
  var moment = require('moment');
  var compile = function(file, namespace, callback){
    
    try{
      
      var data = fs.readFileSync(file, 'utf8');
      var compiled = coffeescript.compile(data, {bare:true})
    
      // crop off var Classname; line
      compiled = compiled.substr(compiled.indexOf('\n\n'), compiled.length);

      // trim so we can rescope objects based on the directory structure
      compiled = compiled.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      
      // add namespace to front of objects
      if(namespace && namespace > '') compiled = namespace.replace(/\//,'') + '.' + compiled;
      
      callback(null, compiled);
      
    } catch (e) {
      
      callback(e);  // catch errors
    
    }
    
  }
  
  var header = function(namespaces){
    
    var out = [];
        out.push('// last compiled: ' + moment().format('YYYY-MM-DD HH:MM:SS'));
        out.push('// exports is only used by the compiled node service.');
        out.push('// please excuse the implicit declaration used (for now).');
        
    for(var n = 0; n < namespaces.length; n++)  // namespace objects 
      out.push(namespaces[n].replace(/\//,'') + ' = {};');
    
    out.push('');
    out.push('__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },');
    out.push('__hasProp = {}.hasOwnProperty,');
    out.push('__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };');
    out.push('');
    
    return out.join("\n");
    
  }
  
  var footer = function(namespaces){
    
    var out = [];
    for(var n = 0; n < namespaces.length; n++)  // namespace objects 
      out.push('exports.' + namespaces[n].replace(/\//,'') + ' = ' + namespaces[n].replace(/\//,'') + ';');
    return out.join("\n");
    
  }
  
  exports.heading = header;
  exports.footer  = footer;
  exports.compile = compile;
  


})();
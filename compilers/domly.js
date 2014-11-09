// domly templates compiler
// 2014-04-09
// github.com/cif/swell
// email@benipsen.com

(function(){
  
  var fs = require('fs');
  var dom = require('domly');
  var showdown = require('showdown');
  var converter = new showdown.converter();
  var compile = function(file, namespace, callback){
    
    try{
      
      if(namespace === '')
        space = '';
      else
        space = namespace + '.';
        
      var name = namespace + '.' + file.replace(/\.dom/,'').substr(file.lastIndexOf('/') + 1, file.length);
      fs.readFile(file, 'utf8', function(err, data){
        
        try{
          var html = converter.makeHtml(data);
          var template = dom.precompile(html, {
            stripWhitespace: true // Strip whitespace for better performance
            //debug:true
          });
          var out = 'dom.' + name + ' = '+template.toString()+';'
          callback(null, out);
        
        } catch (e) {
      
          callback(e);  // catch errors
    
        }
         
      });
      
      
    } catch (e) {
      
      callback(e);  // catch errors
    
    }
    
  };
  
  var header = function(namespaces){
    
    var out = [];
        //out.push('// last compiled: ' + moment().format('YYYY-MM-DD HH:MM:SS'));
        out.push('var dom = {}');
        
    for(var n = 0; n < namespaces.length; n++){  // namespace objects 
      //var _var = namespaces[n].split('.').length > 1 ? '    ' : 'var ';
      out.push('dom.' + namespaces[n].replace(/\//,'') + ' = {};');
    }
    
    return out.join("\n");
    
  };
  
  var footer = function(namespaces){
    
    return '';
    
  };
  
  exports.heading = header;
  exports.footer  = footer;
  exports.compile = compile;
  


})();
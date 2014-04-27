// swell watchter (server). 
// still struggling with why i have to replicate the coffeescript watcher : /     
// 2014-04-09
// github.com/cif/swell
// email@benipsen.com

(function(){  
  
 var fs = require('fs') 
 var nodewatch = require('node-watch');
 var compilers = require('require-all')(__dirname + '/../compilers');
 var colors = {red: '\u001b[31m', green: '\u001b[32m', yellow: '\u001b[33m', reset: '\u001b[0m'};
 
 // the instance is the only thing in exports/
 // its methods and properties take care of everything
 var instance = function(base, config){
    this.base = base;
    this.config = config;
    this.changed = function(filename){
      
      console.log(colors.yellow + '[swell-' + _this.config.compiler +'] ' + filename + ' changed recompiling to ' + _this.config.output + colors.reset);
      _this.build_and_compile();
      
    };  // end this.changed()
    
    this.write = function(output, namespaces){  // write the final output file
      
      output.unshift(_this.compiler.heading(namespaces, _this.config));
      output.push(_this.compiler.footer(namespaces, _this.config));
      fs.writeFileSync(_this.config.output, output.join("\n"), 'utf8');
      console.log(colors.green + '[swell-' + _this.config.compiler +'] recompiled output to ' + _this.config.output + colors.reset);
      
    } // end this.write()
    
    this.compile = function(files){
      
      var output = [];
      var namespaces = [];
      var pending = files.length;
      
      // sort the files to ensure the order went right, as readdir is async. 
      files.sort();
      
      for(var f = 0; f < files.length; f++){
        
        var parts = files[f].split(':');
            parts.shift();
        
        var file_path = _this.base + parts[2];
        
        var file_parts = parts[2].split('/');
            file_parts.pop();
        
        if(parts[0] > '') 
            file_parts.unshift(parts[0]);
            file_parts = file_parts.join('/');
            file_parts = file_parts.replace(parts[1],'')
        
        // trim slashes off the ends
        if( file_parts.substr(0,1) == '/' )
            file_parts = file_parts.substr(1, file_parts.length);
        if( file_parts.substr(-1) == '/' )
            file_parts = file_parts.substr(0, file_parts.length-1);
            
        var namespace = file_parts.replace(/\//,'.');
        // push namespaces
        if(namespace > '' && namespaces.indexOf(namespace) < 0)
          namespaces.push(namespace);
          
        // get output from the compiler  
        _this.compiler.compile(file_path, namespace, function(err, data){
          
          if(err){
              console.log(colors.red + '[swell-' + _this.config.compiler +'] error compiling ' + file_path + ': ' + "\n" + err + colors.reset);
          }
          output.push(data);
          if(!--pending) _this.write(output, namespaces);
          
        }, _this.config);
        
      }
      
    }  // end this.compile()
    
    this.recurse = function(dir, namespace, callback){  // builds a list of the
      
      var results = []
    
      // read the directory    
      fs.readdir(_this.base + dir, function(err, list) {
        
        
        if (err) throw err;
        var pending = list.length;
        if (!pending) return callback(null, results);
    
        // walk it
        list.forEach( function(file) {
      
          var file = dir + '/' + file;
        
          // determine if file or directory
          fs.stat(file, function(err, stat) {
      
            if (stat && stat.isDirectory()) {
                // recurse
                _this.recurse(file, namespace, function(err, res) {
                  results = results.concat(res);
                  if (!--pending) callback(null, results);
              });
      
            } else {
              
              // validate extensions
              var is_valid_ext = false;
              for(var v = 0; v < _this.config.extensions.length; v++)
                if(file.indexOf(_this.config.extensions) > 0)
                  is_valid_ext = true;
               
              // push as file
              if(is_valid_ext)
                results.push(namespace + ':' + file);    
              if (!--pending) callback(null, results);
      
            }
      
          });
        });
      });
      
    } // end this.recurse()
    
    this.build_and_compile = function(){  // builds a flat list of folders recursively
      
      var files = [];
      var pending = this.folders.length;
      
      for(var f = 0; f < this.folders.length; f++){
        var namespace = this.names ? f + ':' + this.names[f] + ':' + this.folders[f] : '::' + this.folders[f];
        this.recurse(this.folders[f], namespace, function(err, results){
          files = files.concat(results);
          if(!--pending) _this.compile(files);
          
        });
          
      }
      
    } // end this.build_and_compile()
    
    this.watch = function(){
      
      // set the compiler routine
      this.compiler = compilers[this.config.compiler];
      
      // round up the folders string or array
      this.names = false;
      if(typeof(this.config.folders) === 'object'){
        this.names   = [];
        this.folders = [];
        for(var f = 0; f < this.config.folders.length; f++)
          for(named in this.config.folders[f]){
            this.folders.push(this.config.folders[f][named]);
            this.names.push(named);
          }
      
      } else 
        this.folders = [this.config.folders];
      
      nodewatch(this.folders, this.changed);
      console.log(colors.yellow + '[swell-' + _this.config.compiler +'] watching ' + this.folders.join(',') + ' for changes ' + colors.reset); 
      
      // call build to get things started
      this.build_and_compile();
      return this;
      
    }; // end this.watch()
    
    var _this = this;  // everyone's favorite 'scoper' : P
    return this;
    
 }; // end watch() instance   

 // expose the 'constructor'
 exports.instance = instance;

})(); 
 
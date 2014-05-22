
// cl interface for swell
// 2014-04-07
// github.com/cif/swell
// email@benipsen.com

// parse command line options
var opts = require('./cli').nom;
// console.log(opts);
  
// establish an application base path using the default or specified configuration
var path   = require('path'); 
var spec   = opts.file ? opts.file : 'swell.json';

// create a new application
if(opts.new){ }

// read in the configuration file
var config;
try {  
  
  config = JSON.parse(require('fs').readFileSync(process.cwd() + '/' + spec));  
  config.base = path.dirname(path.resolve(spec)) + '/';
  
} catch (e) {
  
  console.log('[swell] Configuration file "'+spec+'" not found or contains syntax errors!'+"\n\n");  
  console.log(e);
  
}

// set config variable
if(opts.config){
  require('./config').set(process.cwd() + '/' + spec, opts.config, opts[0], function(err, key, value){
    if(err) throw err;
    console.log('[swell] configuration variable "' + key + '" set to "' + value + '"' + "\n");
  });  
}

// remove config variable
else if(opts.remove){
  require('./config').remove(process.cwd() + '/' + spec, opts.remove, function(err, key){
    if(err) throw err;
    console.log('[swell] configuration variable "' + key + '" has been deleted' + "\n");
  });  
}

// shortcut for resource and route additions
else if(opts.add){
  if(opts.add === 'route'){
    var key = 'server.routes.' + opts[0];
    var value = opts[1];
    require('./config').set(process.cwd() + '/' + spec, key, value, function(err, key, value){
      if(err) throw err;
      console.log('[swell] configuration variable "' + key + '" set to "' + value + '"' + "\n");
    });   
  }
}

// watch file and or and run express
else if(opts.watch || opts.server){
  
  if(opts.watch){
    
    var watch  = require('./watch');
    
    // client side coffeescript
    if(config.client){  
      var coffee = watch.instance(config.base, config.client).watch();
    }
    
    // templates
    if(config.templates){  
      var templates = watch.instance(config.base, config.templates).watch();
    }
    
    // styles
    if(config.style){  
      var style = watch.instance(config.base, config.style).watch();
    }
    
    // core server class watcher
    if(opts.server){  
      var server = watch.instance(config.base, config.server.coffee).watch();
    }
    
    // dependencies
    if(config.deps){  
      var deps = watch.instance(config.base, config.deps).watch();
    }
    
  }
  
  if(opts.server){
    
    // start the server
    var server = require(config.base + 'server/server');
        server.start(config, opts.watch);
    
  }
  
  
}

else {
  
  // we haven't done anything so...
  console.log('To view swell command options type "swell -help" or "swell -h"' + "\n\n");

}



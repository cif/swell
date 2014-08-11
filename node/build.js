// builds a new app from swell 

             
// 2014-04-08
// github.com/cif/swell
// email@benipsen.com

(function(){  
  
  var fs = require('fs');
  var cmd = require('child_process').exec;
  var color = {
    red : '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    reset: '\u001b[0m'
  }
  
  exports.copy = function(new_app_name){
    
    try {
    
      console.log(color.yellow + '[swell] building new app "'+new_app_name+'"' + color.reset);
      
      // make the new directory
      var dir =  './' + new_app_name;
      fs.mkdirSync(dir)
      
      // copy primary application directories
      cmd('cp -R ' + __dirname + '/../client/' + ' ' + dir + '/client/');
      cmd('cp -R ' + __dirname + '/../collections/' + ' ' + dir + '/collections/');
      cmd('cp -R ' + __dirname + '/../models/' + ' ' + dir + '/models/');
      cmd('cp -R ' + __dirname + '/../public/' + ' ' + dir + '/public/');
      cmd('cp -R ' + __dirname + '/../responders/' + ' ' + dir + '/responders/');
      cmd('cp -R ' + __dirname + '/../server/' + ' ' + dir + '/server/');
      cmd('cp -R ' + __dirname + '/../swell/' + ' ' + dir + '/swell/');
      cmd('cp -R ' + __dirname + '/../views/' + ' ' + dir + '/views/');
      cmd('cp -R ' + __dirname + '/../swell.json' + ' ' + dir + '/swell.json');
      
      console.log(color.green + '[swell] your new app "'+new_app_name+'" is ready' + color.reset);
      
    } catch (e){
      
      console.log(color.red + '[swell] error creating new app!' + color.reset);
      console.log(e.message);
    
    }
    
  }
  
})();
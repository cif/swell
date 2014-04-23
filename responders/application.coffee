
# swell default application responder            
# 2014-04-16
# github.com/cif/swell
# email@benipsen.com

moment = require 'moment'

class Application extends swell.Responder

  constructor: (@config) ->
    
  index: (request, callback) ->
    
    console.log moment
    console.log 'index caled', request.data
    callback null, dope:'fucck yea bitch!'
      
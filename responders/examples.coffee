
class Examples extends swell.Responder
  
  moment = require('moment')
  collection: collections.Examples
  expose_rest: true
  
  app: (req, callback) =>
    callback null, view: 'index', layout: 'layouts/app'
  
  
  cookies: (req, callback) =>
    
    # set cookie example
    expire = moment().add('days', 30).diff(moment(), 'seconds')
    @cookie 'remember', 'the meaning of life', maxAge: expire
    
    # get cookie example
    console.log @cookie 'remember'
    
    # destroy cookie example
    @cookie 'destroy', -1
    
    callback null, 'This is a cookie test method response.'
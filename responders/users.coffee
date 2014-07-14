
class Users extends swell.Responder
  
  collection: collections.Users
  expose_rest: true
  
  before: (req) =>
    return true
    
  
  authenticate: (req, callback) =>
    
    callback 'This is a custom error!'
      
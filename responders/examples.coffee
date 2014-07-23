
class Examples extends swell.Responder
  
  collection: collections.Examples
  expose_rest: true
  
  app: (req, callback) =>
    callback null, view: 'index', layout: 'layouts/app'
  
  
  

class Examples extends swell.Responder
  
  collection: collections.Examples
  expose_rest: true
  
  colored: (request, callback) =>
    new @collection @config, (err, @collection) =>
      @collection.query color:request.data.color, callback
  
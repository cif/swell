
class Examples extends swell.Responder
  
  collection: collections.Examples
  expose_rest: true
  
  colors: (request, callback) =>
    new @collection @config, (err, @collection) =>
      @collection.where color:request.data.color, callback
  
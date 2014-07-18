
class Examples extends swell.Responder
  
  collection: collections.Examples
  expose_rest: true
  
  color: (req, callback) =>
    new @collection @config, (err, @collection) =>
      @collection.where color:request.data.color, callback
  
  testing: (req, callback) =>
    console.log req.uri_params
    callback null, 'hi and stuff'
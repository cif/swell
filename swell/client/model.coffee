#
#  client side implementation of swell.Model
#  instances inherit Backbone.Model methods and properties: http://backbonejs.org/#Model
#

class Model extends Backbone.Model
  
  # generic validation 
  validate: (attrs) =>
    return @sanitize(attrs) if @fields
  
  # field based validation
  sanitize: (attrs) =>
    return undefined
    
  # initialize, sets default callback instances
  initialize: =>
    @response_callback =
      success: (data) =>
        console.info 'swell.Model sync returned: ', @attributes
        @callback null, data
      error: (error) =>
        console.error 'swell.Model sync error: ' + error.responseText
        @callback error.responseText
    
    @init.apply(@, arguments)
    this
  
  # shorter init override for subclassing
  init: =>
    this
    
  # common CRUD methods 
  # simplified via more standard callback (err, result) handlers
  pull: (@callback, options) =>
    options = _.extend @response_callback, options
    @fetch options
        
  push: (@callback, options) =>
    options = _.extend @response_callback, options
    @save null, options
  
  delete: (@callback, options) =>
    options = _.extend @response_callback, options
    @destroy options
  
  # allows models to be posted to custom url
  # default request method will be a POST request
  call: (url, @callback, options, method='POST') =>
    options = _.extend @response_callback, options
    options.url = url
    options.type = method
    $.ajax options
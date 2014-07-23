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
        console.info '[swell] ' + moment().format('HH:mm:ss') + 'Model.' + @operation + ' returned: ', @attributes
        @callback null, data
      error: (error) =>
        console.error '[swell] ' + moment().format('HH:mm:ss') + 'Model.' + @operation + ' error: ' + error.responseText
        @callback error.responseText
    
    @init.apply(@, arguments)
    this
  
  # shorter init override for subclassing
  init: =>
    this
    
  # common CRUD methods that require ajax, only 
  # simplified via more standard callback (err, result) handlers
  pull: (@callback, options) =>
    options = _.extend @response_callback, options
    @operation = 'pull'
    @fetch options
        
  push: (@callback, options) =>
    options = _.extend @response_callback, options
    @operation = 'push'
    @save null, options
  
  delete: (@callback, options) =>
    options = _.extend @response_callback, options
    @operation = 'delete'
    @destroy options
  
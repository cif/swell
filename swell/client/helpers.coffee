# View helpers class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

# IMPORTANT: This filename is prefixed with an _ so that it gets compiled before any other views

class Helpers
  
  constructor: ->
    
    # extend dust.helpers so methods here are available in dust templates
    _.extend(dust.helpers, @)
    
    # default handlers for ajax 'shortcut' (see also Model.call)
    @response_callback =
      success: (data) =>
        console.info 'Helpers.ajax returned: ', data
        @callback null, data
      error: (error) =>
        console.error 'Helpers.ajax error: ' + error.responseText
        @callback error.responseText
  
        
  test_dust_helper: (chunk, ctx, bodies, params) =>
    chunk.write 'my custom helper works!'
    
  # ajax shortcut 
  ajax: (url, @callback, options, method='POST') =>
    options = _.extend @response_callback, options
    options.url = url
    options.type = method
    $.ajax options
  
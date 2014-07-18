# View helpers class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

# IMPORTANT: This filename is prefixed with an _ so that it gets compiled before any other views

class Helpers extends swell.Helpers
  
  init: =>
    
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
  
  # define your custom helpers here      
  # example_dust_helper: (chunk, ctx, bodies, params) =>
    # do stuff ... 
    # chunk.write 'my custom helper works!'
  
  
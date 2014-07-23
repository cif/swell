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
        console.info '[swell] ' + moment().format('HH:mm:ss') + ' Helpers.ajax returned: ', data
        @callback null, data
      error: (error) =>
        console.error '[swell] ' + moment().format('HH:mm:ss') + ' Helpers.ajax error: ' + error.responseText
        @callback error.responseText
  
  
  
  # ------------------------- misc view helpers -------------------------------
  
  # renders loader markup into a selector (see client/style/loader.styl)
  loader: (selector) ->
    loader = '<div class="loader"><em class="one"></em><em class="two"></em><em class="three"></em><em class="four"></em></div>'
    $(selector).html loader
  
  
    
  # ------------------------- dust related helpers -------------------------------
    
  # allows easier to model field properties
  prop: (chunk, context, bodies, params) ->
    console.log params
    return chunk.write '' if !params.key or !params.obj or !params.obj[params.key]
    if params.obj[params.key][params.field]
      chunk.write params.obj[params.key][params.field]
    else if typeof chunk.write params.obj[params.key] is 'string'
      chunk.write params.obj[params.key]
    else
      chunk.write ''  
  
  
  
  # dust rendering shortcut, takes selector, template, optional markdown
  render: (selector, template, context, callback) ->
    dust.render template, context, (err, out) ->
      $(selector).html out  
      callback() if callback
        
  # ajax shortcut 
  ajax: (url, @callback, options, method='POST') =>
    options = _.extend @response_callback, options
    options.url = url
    options.type = method
    options.dataType = 'json'
    options.contentType = 'application/json'
    options.emulateHTTP = false
    options.processData = false
    options.emulateJSON = false
    options.validate = true
    $.ajax options
  
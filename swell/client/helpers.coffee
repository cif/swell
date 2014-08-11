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
  
  # dust rendering shortcut, takes selector, template, optional markdown
  render: (selector, template, context, callback) ->
    dust.render template, context, (err, out) ->
      $(selector).html out  
      callback() if callback
      
      
  # ------------------------- form elements ---------------------------------
  checkbox: (chunk, context, bodies, params) =>
    out  = '<input type="checkbox"'
    obj = false
    for key, val of params
      obj = val if typeof val is 'object'
    for key, val of params
      if typeof val is 'string'
        _val = if typeof obj[val] is 'undefined' then val else obj[val]
        out += ' ' + key + '="'+_val+'"'
        out += ' checked="'+_val+'"' if key is 'name' and obj[val]
    out += '/>'  
    chunk.write out
  
  
  # ------------------------- dust helpers -------------------------------
  # looks like the runtime doesn't include any of the default 
  # helpers here: https://github.com/linkedin/dustjs/wiki/Dust-Tutorial#Helpers
  # i've opted to simply write the ones needed
  
  # eq's key paramater can be omitted and will
  # check for a non faley values via: value=is_this_true
  eq: (chunk, context, bodies, params) ->
    if typeof params.key is 'undefined' and !@falsey(params.value)
      bodies.block(chunk, context)
    else if typeof params.key != 'undefined' and params.key is params.value
      bodies.block(chunk, context)
    else if bodies.else
      bodies.else(chunk, context)
    else
      chunk.write ''
      
  # allows easier to model field properties
  prop: (chunk, context, bodies, params) ->
    return chunk.write '' if !params.key or !params.obj or !params.obj[params.key]
    if params.obj[params.key][params.field]
      chunk.write params.obj[params.key][params.field]
    else if typeof chunk.write params.obj[params.key] is 'string'
      chunk.write params.obj[params.key]
    else
      chunk.write ''    
  
  #todo: ? shortcut for checking props
  #ifprop: (chunk, context, bodies, params) ->
  #  console.log arguments
  #  chunk.write ''
    
  # falsey helper, returns depending on whether 
  # things are 0, empty string, empty array etc.
  falsey: (val) =>
    falsey = false
    falsey = !val if typeof val is 'boolean'
    falsey = true if typeof val is 'undefined'
    falsey = true if typeof val is 'string' and val <= ''
    falsey = true if typeof val is 'number' and val is 0
    return falsey
        
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
  
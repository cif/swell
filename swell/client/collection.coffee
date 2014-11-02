
# Collection contains a simple sort_order comparison by default. Everything else is Backbone.Collection defaults.

class Collection extends Backbone.Collection
  
  # sychronize is true by default which will use
  # socket.io to listen for changes from the server
  sychronize: true
  
  # comparator example, the default comparison by default a sort_order field.
  comparator: (model) ->
    if @sort_by
      return +model.get(@sort_by)
    else
      return 0  
  
  # initialize (constructor) will begin listening
  # for changes from the server, and broadcast
  initialize: (options) =>

    # if synchronize is set to true, then
    # listen for events from the server on @store,
    # pass along to @update
    synchro.on @store, @update if @sychronize
    
    # default callbacks for Backbone methods
    @response_callback =
      success: (data) =>
        console.info '[swell] ' + moment().format('HH:mm:ss') + ' Collection.' + @operation + ' returned: ', data
        @callback null, data
      error: (error) =>
        console.error '[swell] ' + moment().format('HH:mm:ss') + ' Collection.' + @operation + ' error: ' + error.responseText
        @callback error.responseText
  
    # call subclass init and return this
    @init.apply(@, arguments)
    this
  
  # shorter init override for subclassing
  init: =>
    this
  
  # this is the method handles socket.io updates from the server.
  # data.res will hold an array of models to update, add or remove
  # data.type is an event passed from the server and triggered
  update: (data) =>
    if data.type and data.type is 'remove'
      @remove data.res if data.res
    else
      @add data.res, merge:true if data.res             
    @trigger data.type, @ if data.type
  
  
  # a few unique swell.Collection client side 
  # methods, line up with node.js callback standards
  #  no need to define success: and error: each call
  
  # grab is basically a shortcut to @models
  # but will fetch if models[] is zero length
  grab: (callback) =>
    if @models.length is 0
      @pull (err, res) =>
        callback err if err
        if res.length is 0 then callback(null, false) else callback(null, @models)
    else
      console.log 'wtf?', @models
      callback(null, @models)
  
  # snag, is just like get but will issue a pull
  # request automatically if the collection is empty 
  snag: (id, callback) =>
    if @models.length is 0
      @pull (err, res) =>
        callback @get(id)
    else
      callback @get(id)
      
  # pull, gets the latest collection from the server
  # it's a fetch is silent by default
  pull: (@callback, options) =>
    options = _.extend @response_callback, options
    options.silent = true if typeof options.silent is 'undefined'
    @operation = 'pull'
    @fetch options
  
  # sorted is typically called from sorted events
  # fired by list views, takes {id:sort} pairs
  sorted: (ordered) =>
    # update the server via ajax helper method
    # the broadcast will reach here too, calling twice seems reduntant ?
    handler = (err, res) ->
      console.error '[swell] ' + moment().format('HH:mm:ss') + ' error sorting a collection: ' + err.responseText if err
    helpers.ajax @url + 'sort', handler, data: JSON.stringify(sorted: ordered), 'POST'
  
  
  # default search method will search models for attributes 
  # matching string or array second argument
  search: (query, fields, case_sensitive) =>  
    results = []
    for model in @models
      if typeof fields is 'array'
        console.log 'TODO!'
      else
        search = model.get(fields).toString()
        search = search.toLowerCase() if !case_sensitive
        search = query.toLowerCase() if !case_sensitive
        results.push model if search.indexOf(query) > -1
    
    return results      
    
    
  
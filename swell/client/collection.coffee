
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
      return 1  
  
  # initialize (constructor) will begin listening
  # for changes from the server, and broadcast
  initialize: (options) =>

    # if synchronize is set to true, then
    # listen for events from the server on @store
    synchro.on @store, @update
    
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
  # data.res should hold an array of potential models to update
  update: (data) =>
    return false if @models.length is 0  # ignore updates if the collection hasn't been pulled yet
    return console.error '[swell] ' + moment().format('HH:mm:ss') + ' Collection.update recieved empty or bad data from the server:', arguments if !data or !data.res
    for attr in data.res
      @add attr, merge:true
    @trigger 'updated', @
  
  # a few unique swell.Collection client side 
  # methods, line up with node.js callback standards
  #  no need to define success: and error: each call
  
  # grab is basically a shortcut to @models
  # but will fetch if models has zero length
  grab: (callback) =>
    if @models.length is 0
      @pull (err, res) =>
        callback(null, @models)
    else
      callback(null, @models)
  
  # snag, is basicaslly like get but will issue a pull
  # request automatically if the collection is empty then
  # return the model
  snag: (id, callback) =>
    if @models.length is 0
      @pull (err, res) =>
        callback @get(id)
    else
      callback @get(id)
      
  # pull, gets the latest batch from the server with node
  pull: (@callback, options) =>
    options = _.extend @response_callback, options
    @operation = 'pull'
    @fetch options
  
  # sorted usually gets called from sorted events
  # fired by list views, takes {id:sort} pairs
  sorted: (ordered) =>
    
    # update the server via our @call method. 
    # the broadcast will reach here too, calling twice seems reduntant ?
    handler = (err, res) ->
      console.error '[swell] ' + moment('HH:mm:ss') + ' error sorting a collection: ' + err.responseText if err
    helpers.ajax @url + 'sort', handler, data: JSON.stringify(sorted: ordered), 'POST'
  
  
  
    


    
    
  
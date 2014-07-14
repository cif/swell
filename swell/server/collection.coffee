# swell.Collection (server)
# responsible for maintaining a list of models. broadcasts changes to connected clients
# 2014-04-09
# github.com/cif/swell
# email@benipsen.com


class Collection
  
  # default database key
  key: 'id'
  
  # default sort order
  sort: 'sort_order'
  
  # constructor connects to the data source specified 
  # and calls back to the responder
  constructor: (config, callback) ->
    
    # read data source from the config
    if @data = config.server.resources[@resource]
    
      # set up the engine as appropriate
      @db = new swell.Mongo @ if @data.engine is 'mongo'
      @db = new swell.Mysql @ if @data.engine is 'mysql'
    
      # callbacks 
      # mysql needs to issue a USE query before calling back
      if @data.engine is 'mysql'
        @db.use (err, res) =>
          callback(err) if err
          callback(null, @)
      else if @db
        callback(null, @)
      else 
        callback('[swell] could not connect to data source "'+@resource+'" :' + JSON.stringify(@data))
    
    else
      callback('[swell] your collection is attempting to locate an unspecified data resource "' + @resource + '". Define it in your configuration.')
      
    
  # fetch method returns the entire collection of models
  # if @list is specified only those fields are returned
  fetch: (callback) =>
    @db.find {}, (err, res) =>
      return callback(err) if err
      callback null, @pare(res)
  
  # query allows for find options
  where: (options, callback) =>
    @db.find options, callback
  
  # retrieve a single record by id
  get: (id, callback) =>
    @db.get @key, id, callback
    
  # add saves a new model
  add: (data, callback) =>
    
    # make sure ther is a model validating the request
    return callback '[swell] a model must be specified to use REST features' if typeof @model != 'function'
    
    # instantiate a model instance
    @model = new @model data
    
    # clean / validate the data, throw an error if invalid data
    cleaned = @model.validate(data)
    console.log typeof cleaned
    return callback('[swell] validation error: ' + cleaned) if typeof cleaned != 'undefined'
    @db.insert @model.attributes, callback
  
  # update updates an existing model
  update: (data, callback) =>
    @db.update @key, data, callback
    
  # deletes a model from the database  
  remove: (data, callback) ->
    @db.destroy @key, data, callback
      
  # removes items for list view (smaller transmit)
  pare: (res) =>
    for doc in res
      for prop, val of doc
        if @list and @list.indexOf(prop.toString()) < 0
          delete doc[prop]
    res          
    
  # default comparator, used for sorting
  comparator: (model) =>
    return if @sort_by then model.get(@sort_by) else 0

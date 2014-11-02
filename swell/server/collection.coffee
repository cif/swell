# swell.Collection (server)
# responsible for maintaining a list of models. broadcasts changes to connected clients
# 2014-04-09
# github.com/cif/swell
# email@benipsen.com


class Collection
  
  # default database key
  key: '_id'
  
  # default sort order
  sort: 'sort_order'
  
  # constructor connects to the data source specified 
  # and calls back to the responder
  constructor: (config) ->
    
    # initialize the model class if one is specified
    @model = new @model @ if @model
    
    # read data source from the config
    if @data = config.server.resources[@resource]
    
      # set up the engine as appropriate
      @db = new swell.Mongo @ if @data.engine is 'mongo'
      @db = new swell.Mysql @ if @data.engine is 'mysql'

    else
      console.log('[swell-server] a collection is attempting to locate an unspecified data resource "' + @resource + '".')
      
    
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
    callback null, []
    @db.get @key, id, callback
    
  # add saves a new model
  add: (data, callback) =>
    # make sure there is a model validating the request
    return callback '[swell] a model must be specified to use REST features' if !@model
    
    # clean / validate the data, throw an error if invalid data
    cleaned = @model.sanitize(data)
    
    return callback('[swell] data sanitization error: ' + @model.invalid) if !cleaned
    @db.insert cleaned, callback
  
  # update updates an existing model
  update: (data, callback) =>
    
    # make sure there is a model validating the request
    return callback '[swell] a model must be specified to use REST features' if !@model
    
    # clean / validate the data, throw an error if invalid data
    cleaned = @model.sanitize(data)
    return callback('[swell] data sanitization error: ' + @model.invalid) if !cleaned
    
    @db.update data[@model.key], cleaned, (err, res) ->
      callback err if err
      callback null, cleaned
    
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
  
    

# swell.Responder
# takes swell.json configuration object as constructor and applys to subclass initialize method
# handles automatic REST exposure (if specified on subclass)
# 2014-04-09
# github.com/cif/swell
# email@benipsen.com

class Responder
  
  fs = require 'fs'
  path = require 'path'
  
  # automatic REST exposure must be explicitly turned on 
  # you know, security and stuff
  expose_rest: false
  
  constructor: (@config) ->
    @initialize.apply(@, arguments)
    @collection = new @collection(@config) if typeof @collection is 'function'
    this
  
  # this is the one you should override if you need to do things
  initialize: (@config) ->
    this
  
  # returning false from a before method 
  # results in a 401 (Unauthorized) response
  before: (req) =>
    true
  
  # useful for any cleanup required, return
  # values do not alter the request or response
  after: (req) =>
    true
    
  # core implementations of REST crud
  # methods are mapped from request type
  get: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    if req.data.id
      @collection.get req.data.id, callback
    else  
      @collection.fetch callback
      
  post: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    @collection.add req.data, (err, res) =>
      return callback err if err
      data = 
        type: 'sort'
        res: [res]
        emit:
          event: @collection.store
          space: @config.server.socket_io.namespace
        
      callback null, data
    
  put: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    @collection.update req.data, callback
    
  delete: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    @collection.remove req.data, callback
  
  # sort handles requests for sort order 
  # updates from swell.List instances
  sort: (req, callback) =>
    # make sure we have a model and key
    return callback('[swell] sort was called on a responder that does not have a collection, store, or model or the model is missing a key: attribute') if !@collection.model or !@collection.model.key
    results = []
    for key, obj of req.data.sorted
      update = {}
      update[@collection.model.key] = key
      sort = if @collection.sort_by then @collection.sort_by else 'sort_order' # the default key for sorting is sort_order
      update[sort] = obj
      results.push update
        
      @collection.update(update, false)
  
    # because this could be a lot of query operations, 
    # we're calling back early and assuming it worked
    data = 
      type: 'sort'
      res: results
      emit:
        event: @collection.store
        space: @config.server.socket_io.namespace
        
    callback null, data 
      
  
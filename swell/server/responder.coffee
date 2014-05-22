# swell.Responder
# takes swell.json configuration object as constructor and applys to subclass init method
# contains a bit of magic sauce allowing automatic REST exposure of a specified collection
# 2014-04-09
# github.com/cif/swell
# email@benipsen.com

class Responder
  
  fs = require 'fs'
  path = require 'path'
  
  # by default, REST exposure is set to false
  expose: false
  
  constructor: (@config) ->
    @init.apply(@, arguments)  
    this
  
  init: (@config) ->
    this
    
  before: (request) =>
    true
    
  after: (request) =>
    true
    
  # generic implementations of rest crud
  # methods are mapped from request type
  get: (request, callback) =>
    callback(null, unauthorized:true) if !@expose_rest
    callback('[swell] A collection must specified to use REST features') if !@collection
    
    # initialize the store and call a simple find
    new @collection @config, (err, @collection) =>
      if err
        callback(err) 
        return false
      if request.data.id
        @collection.get request.data.id, callback
      else  
        @collection.fetch callback
        
  post: (request, callback) =>
    callback(null, unauthorized:true) if !@expose_rest
    new @collection @config, (err, @collection) =>
      @collection.add request.data, callback
    
  put: (request, callback) =>
    callback(null, unauthorized:true) if !@expose_rest
    new @collection @config, (err, @collection) =>
      @collection.update request.data, callback
    
  delete: (request, callback) =>
    callback(null, unauthorized:true) if !@expose_rest
    new @collection @config, (err, @collection) =>
      @collection.remove request.data, callback
  
      
  # misc responder helper methods
  # so far cookie is the only one
  cookie: (req, key, value, options={}) =>
    
  
  
  
  
  
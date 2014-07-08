# swell.Responder
# takes swell.json configuration object as constructor and applys to subclass initialize method
# handles automatic REST exposure (if specified on subclass)
# 2014-04-09
# github.com/cif/swell
# email@benipsen.com

class Responder
  
  fs = require 'fs'
  path = require 'path'
  
  # REST exposure must be explicitly turned on. security and stuff.
  expose_rest: false
  
  constructor: (@config) ->
    @initialize.apply(@, arguments)  
    this
  
  # this is the one you should override
  initialize: (@config) ->
    this
  
  # returning false within a before method 
  # results in a 401 (Unauthorized) response  
  before: (request) =>
    true
  
  # useful for any cleanup required, return
  # values to not alter the request
  after: (request) =>
    true
    
  # core implementations of REST crud
  # methods are mapped from request type
  get: (request, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      return callback(err) if err
      if request.data.id
        @collection.get request.data.id, callback
      else  
        @collection.fetch callback
        
  post: (request, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      @collection.add request.data, callback
    
  put: (request, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      @collection.update request.data, callback
    
  delete: (request, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      @collection.remove request.data, callback
  
  
  
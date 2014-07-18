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
    new @collection @config, (err, @collection) =>
      return callback(err) if err
      if req.data.id
        @collection.get req.data.id, callback
      else  
        @collection.fetch callback
        
  post: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      return callback(err) if err
      @collection.add req.data, callback
    
  put: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      return callback(err) if err
      @collection.update req.data, callback
    
  delete: (req, callback) =>
    return callback(null, unauthorized:true) if !@expose_rest
    return callback('[swell] A collection must specified to use REST features') if !@collection
    new @collection @config, (err, @collection) =>
      return callback(err) if err
      @collection.remove req.data, callback
  
  
  
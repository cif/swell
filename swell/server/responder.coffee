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
  
  init: ->
    
  before: (request) =>
    true
    
  after: (request) =>
    @finish()
    true
    
  # wraps up any last details
  finish: =>  
  
  # generic implementations of get, post, put and delete
  # the request methods are 
  get: (request, callback) =>
    # make sure we can do this
    callback(null, unauthorized:true) if !@expose_rest
    callback('[swell] A collection must specified to use REST features') if !@collection
    
    # initialize the store and call a simple find
    new @collection @config, (err, @collection) =>
      callback(err) if err
      if request.data.id
        @collection.get(request.data.id, callback)
      else  
        @collection.fetch(callback)
        
      # callback(null, wtf:'woot!')
      
    # callback(null, hi:'there')
      
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
    
  
  
  
  
  
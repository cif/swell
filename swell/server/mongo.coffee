# Mongo
# simple inteface with mongo DB
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Mongo
  
  mongo = require 'mongojs'
  
  # database connection and collection as args
  constructor: (@collection) ->
    @db = mongo.connect 'mongodb://'+@collection.data.host+':27017/' + @collection.data.db, [@collection.store]
    this
      
  # find records
  find: (options, callback) =>
   @db[@collection.store].find(options).sort @collection.sort_by, callback
    
  # get a single record by id  
  get: (id, callback) =>
    @db[@collection.store].findOne _id:mongo.ObjectId(id), callback
    
  # insert new records
  insert: (object, callback) =>
    @db[@collection.store].save object, callback
  
  # update existing records
  update: (object,callback) =>
    @db[@collection.store].save object, callback
  
  # delete a record
  destroy: (object, callback) =>
    @db[@collection.store].remove _id:mongo.ObjectId(object.id), callback
    
  # increment / decrement
  bump: (store, field, value, key, id, callback) =>
    
  close_connection: =>
    @connection.end()
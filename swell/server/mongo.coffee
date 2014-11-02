# Mongo
# simple inteface with mongo DB
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Mongo
  
  mongo = require 'mongojs'
  
  # database connection and collection as args
  constructor: (@collection) ->
    try
      @db = mongo.connect 'mongodb://'+@collection.data.host+':27017/' + @collection.data.db, [@collection.store]
    catch e
      console.log '[swell-mongo] connection error:', e.getMessage()
    this
  
  # insert new records
  insert: (object, callback) =>
    @db[@collection.store].save object, callback
      
  # find records
  find: (options, callback) =>
    delete options.id if options.id
    @db[@collection.store].find(options).sort @collection.sort_by, callback
    
  # get a single record by id  
  get: (id, callback) =>
    @db[@collection.store].findOne _id:mongo.ObjectId(id), callback
    
  # update existing records
  # note that id is the first argument for mysql 
  # defaults but object._id should be defined
  update: (id, object, callback) =>
    update = $set:{}
    for prop, val of object
      update.$set[prop] = val if prop != '_id'
    @db[@collection.store].update _id:mongo.ObjectId(object._id), update, callback
  
  # delete a record, same is true for _id
  destroy: (id, object, callback) =>
    @db[@collection.store].remove _id:mongo.ObjectId(object.id), callback
    
  
  
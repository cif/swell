
class Mysql
  
  mysql = require 'mysql'
  moment = require 'moment'
  
  # connection and database as args
  constructor: (@collection) ->
    @db = mysql.createConnection(host: @collection.data.host, user: @collection.data.user, password:@collection.data.password)
    @db.connect()
    this
    
  # find records
  use: (callback) ->
    @db.query 'USE ' + @collection.data.db, callback
    
  find: (options, callback) =>
    # begin the query
    fields = if options.fields then options.fields else '*'
    query = 'SELECT ' + fields + ' FROM ' + @collection.store
    
    if options.join
      direction = options.join.direction or 'LEFT'
      query += ' ' + direction + ' JOIN (' + options.join.table + ') '
      query += 'ON ' + options.join.on
    
    # parse through the where option formats
    if options.where
      if typeof options.where is 'string'
        query += ' WHERE ' + options.where
      else
        conditions = []
        for field, value of options.where
           if value instanceof Object
             for operand, val of value
              conditions.push field + ' ' + operand + ' ' + @db.escape(val)
           else
            conditions.push field + '=' + @db.escape(value)
    
        query += ' WHERE ' + conditions.join(' AND ')
    
    if options.order
      query += ' ORDER BY ' + options.order
    else if @collection.sort_by
      query += ' ORDER BY ' + @collection.sort_by
    
    if options.limit
      query += ' LIMIT ' + options.limit  
    
    @db.query query, (err, rows, fields) =>
      if err and callback
        callback err
      else
        results = []
        if rows.length is 0
          callback null, false  
        else
          for row in rows
            for prop,value of row
              row[prop] = value
            results.push row
          if callback
            callback null, results
    
  # get a single record by id  
  get: (id, callback) =>
    
    @db.query 'SELECT * FROM ' + @collection.store + ' WHERE ' + key + ' = ' + @db.escape(id), (err, rows, fields) =>
      if err
        callback err
      
      if rows and rows.length > 0
        res = rows[0]
        for prop,value of res
          res[prop] = value
        callback null, res
      else
        callback null, false  
    
  # insert new records
  insert: (object, callback) =>
    
    # @collection.store the object
    @db.query 'INSERT INTO ' + @collection.store + ' SET ?', object, (err, res) ->
      if err
        callback err
      else if callback
        res.id = object.id
        callback null, res
  
  # update existing records
  update: (object, callback) =>
    
    # udpate
    @db.query 'UPDATE ' + @collection.store + ' SET ? WHERE ' + key + ' = ' + @db.escape(id), object, callback
       
  
  # delete a record
  destroy: (id,  callback) =>
    @db.query 'DELETE FROM ' + @collection.store + ' WHERE ' + key + ' = ' + @db.escape(id), callback
  

  # increment / decrement
  bump: (field, value, id, callback) =>
    @db.query 'UPDATE ' + @collection.store + ' SET '+field+'='+field+'+'+value+' WHERE ' + key + ' = ' + @db.escape(id), callback

  # raw query. 'nuff said.  # make sure you esacape your query values before using this function!!
  query: (query, callback) =>
    results = []
    @db.query query, (err, rows, fields) ->
      if err
        callback err
      else
        if rows.length is 0
          callback false  
        else
          for row in rows
            for prop,value of row
              row[prop] = @objectify(value)
            results.push row
          if callback
            callback null, results
    
  
  # NOT IN USE JUST YET ...
  # stringify() - turns anything that isn't a string, number or valid data type into JSON
  # this can happen if you have a valid key (field name) who's value is an object or array (common ORM pitfall)
  stringify: (object) =>
    for prop,value of object
      if typeof value != 'string'
        object[prop] = JSON.stringify(value)
    object
  
  # objectify() - the inverse of stringify. 
  objectify: (string_or_object) =>
    if typeof string_or_object != 'string'
      return string_or_object
    if (/^[\],:{}\s]*$/.test(string_or_object.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
        string_or_object = JSON.parse(string_or_object)
    string_or_object  
    
  # gets the fields out of a table @collection.store to prevent undefined column errors when "oversaving" objects  
  describe: (callback) =>
    @db.query 'DESC ' + @collection.store, (err, rows, fields) ->
      if err
        callback err
      else
        valid = []
        for row in rows
          valid.push
            name: row.Field
            type: row.Type
        if callback
          callback null, valid
  
  # generates unique ids
  s4: =>
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
        .toUpperCase()      
  uuid: =>
    @s4() + @s4() + '-' + @s4() + '-' + @s4() + '-' + @s4() + '-' + @s4() + @s4() + @s4()
  
  close_connection: =>
    @db.end()

class Mysql
  
  mysql = require 'mysql'
  moment = require 'moment'
  
  # connection and database as args
  constructor: (@collection) ->
    @pool = mysql.createPool(host: @collection.data.host, user: @collection.data.user, password:@collection.data.password)
    this
    
  find: (options, callback) =>
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        # begin the query
        fields = if options.fields then options.fields else '*'
        query =  'SELECT ' + fields + ' FROM ' + @collection.store
    
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
                  conditions.push field + ' ' + operand + ' ' + conn.escape(val)
               else
                conditions.push field + '=' + conn.escape(value)
    
            query += ' WHERE ' + conditions.join(' AND ')
    
        if options.order
          query += ' ORDER BY ' + options.order
        else if @collection.sort_by
          query += ' ORDER BY ' + @collection.sort_by
    
        if options.limit
          query += ' LIMIT ' + options.limit  
    
        conn.query query, (err, rows, fields) =>
          conn.release()  # release your connections from the pool... very important!
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
  get: (key, id, callback) =>
    conn.query 'SELECT * FROM ' + @collection.store + ' WHERE ' + key + ' = ' + conn.escape(id), (err, rows, fields) =>
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
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        object[@collection.model.key] = @uuid()
        query = conn.query 'INSERT INTO ' + @collection.store + ' SET ?', object, (err, res) ->
          if err
            console.log '[swell-mysql] query caused error:', query.sql
            callback err
          else if callback
            callback null, object
  
  # update existing records
  update: (id, object, callback) =>
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        # udpate
        query = conn.query 'UPDATE ' + @collection.store + ' SET ? WHERE ' + @collection.model.key + ' = ' + conn.escape(id), object, (err, res) =>
          conn.release()
          if err
            console.log '[swell-mysql] query caused error:', query.sql
            return callback err
          callback(err, res) if callback
        
  
  # delete a record
  destroy: (id,  callback) =>
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        conn.query 'DELETE FROM ' + @collection.store + ' WHERE ' + @collection.model.key + ' = ' + conn.escape(id), (err, res) =>
          conn.release()
          if err
            console.log '[swell-mysql] query caused error:', query.sql
            return callback err
  

  # increment / decrement
  bump: (field, value, id, callback) =>
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        conn.query 'UPDATE ' + @collection.store + ' SET '+field+'='+field+'+'+value+' WHERE ' + @collection.model.key + ' = ' + conn.escape(id), (err, res) =>
          conn.release()
          if err
            console.log '[swell-mysql] query caused error:', query.sql
            return callback err
    
  # raw query. 'nuff said.  # make sure you esacape your query values before using this function!!
  query: (query, callback) =>
    @pool.getConnection (err, conn) =>
      return callback(err) if err
      conn.query 'USE ' + @collection.data.db, (err, rows) =>
        return callback(err) if err
        results = []
        conn.query query, (err, rows, fields) ->
          conn.release()
          if err
            console.log '[swell-mysql] query caused error:', query.sql
            callback err
          else
            if rows.length is 0
              callback false  
            else
              for row in rows
              #  for prop,value of row
              #    row[prop] = @objectify(value)
                results.push row
              callback null, results if callback
    
  
  # generates unique s4 ids
  s4: =>
    Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
        .toUpperCase()      
  uuid: =>
    @s4() + @s4() + '-' + @s4() + '-' + @s4() + '-' + @s4() + '-' + @s4() + @s4() + @s4()
  
  close_connection: =>
    conn.end()
// last compiled: 2014-11-04 15:11:44

var swell = {};
var models = {};
var collections = {};
var responders = {};

__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

swell.Collection = (function() {

  Collection.prototype.key = '_id';

  Collection.prototype.sort = 'sort_order';

  function Collection(config) {
    this.pare = __bind(this.pare, this);
    this.update = __bind(this.update, this);
    this.add = __bind(this.add, this);
    this.get = __bind(this.get, this);
    this.where = __bind(this.where, this);
    this.fetch = __bind(this.fetch, this);    if (this.model) this.model = new this.model(this);
    if (this.data = config.server.resources[this.resource]) {
      if (this.data.engine === 'mongo') this.db = new swell.Mongo(this);
      if (this.data.engine === 'mysql') this.db = new swell.Mysql(this);
    } else {
      console.log('[swell-server] a collection is attempting to locate an unspecified data resource "' + this.resource + '".');
    }
  }

  Collection.prototype.fetch = function(callback) {
    var _this = this;
    return this.db.find({}, function(err, res) {
      if (err) return callback(err);
      return callback(null, _this.pare(res));
    });
  };

  Collection.prototype.where = function(options, callback) {
    return this.db.find(options, callback);
  };

  Collection.prototype.get = function(id, callback) {
    callback(null, []);
    return this.db.get(this.key, id, callback);
  };

  Collection.prototype.add = function(data, callback) {
    var cleaned;
    if (!this.model) {
      return callback('[swell] a model must be specified to use REST features');
    }
    cleaned = this.model.sanitize(data);
    if (!cleaned) {
      return callback('[swell] data sanitization error: ' + this.model.invalid);
    }
    return this.db.insert(cleaned, callback);
  };

  Collection.prototype.update = function(data, callback) {
    var cleaned;
    if (!this.model) {
      return callback('[swell] a model must be specified to use REST features');
    }
    cleaned = this.model.sanitize(data);
    if (!cleaned) {
      return callback('[swell] data sanitization error: ' + this.model.invalid);
    }
    return this.db.update(data[this.model.key], cleaned, function(err, res) {
      if (err) callback(err);
      return callback(null, cleaned);
    });
  };

  Collection.prototype.remove = function(data, callback) {
    return this.db.destroy(this.key, data, callback);
  };

  Collection.prototype.pare = function(res) {
    var doc, prop, val, _i, _len;
    for (_i = 0, _len = res.length; _i < _len; _i++) {
      doc = res[_i];
      for (prop in doc) {
        val = doc[prop];
        if (this.list && this.list.indexOf(prop.toString()) < 0) delete doc[prop];
      }
    }
    return res;
  };

  return Collection;

})();
swell.Model = (function() {

  Model.prototype.key = '_id';

  Model.prototype.attributes = {};

  function Model(attributes) {
    this.attributes = attributes;
    this.validate_field = __bind(this.validate_field, this);
    this.sanitize = __bind(this.sanitize, this);
    this.__extend(this.attributes || {}, this.defaults);
    this;
  }

  Model.prototype.sanitize = function(object) {
    var key, value;
    for (key in object) {
      value = object[key];
      if (!this.fields[key] && key !== this.idAttribute) delete object[key];
    }
    return object;
  };

  Model.prototype.validate_field = function(attr, validator) {
    var value;
    return value = this.attributes[attr];
  };

  /* data manipulation methods.
  
  # create()
  # props - additional properties to save along with currently stored attributes
  # callback (err, res) handles results
  create: (props, callback) =>
    @_create(props, callback)
    
  # find()
  # options - object which contains information about the query
  # callback (err, res) to handle the result
  find: (options, callback) =>
    @_find(options, callback)
  
  # find_only()
  # same as find, but wont look for related models specified by ORM options
  find_only: (options, callback) =>
    options.only = true
    @_find(options, callback)
  
  # first() returns the first result from a query
  # options - object which contains information about the query
  # callback (err, res) to handle the result
  first: (options, callback) =>
    @_find options, (err, res) =>
      if err
        callback err
      else if res
        @set res[0]
        callback null, res[0]
      else
        callback null, false
        
  # read()
  # id - the id to get
  # callback (err, res) handles results
  read: (id, callback) =>
    @_read(id, false, callback)
  
  # read_only()
  # bypasses any orm rules set for this object
  read_only: (id, callback) =>
    @_read(id, true, callback)
          
  # save()
  # props - additional properties to save along with currently stored attributes
  # callback (err, res) handles results  
  save: (props, callback) =>
    @_save(props, callback)
    
  # destroy()
  # id (optional) 
  # callback recives events  
  destroy: (id, callback) =>  
    @_destroy(id, callback)
  
  #  
  # _methods serve as the actual implementations
  # this way primary functions are easily overridable and only copy a line  
  
  _create:(props, callback) =>
    
    # assume we are starting over from scratch if props are passed in
    @attributes = @extend(@attributes, props) if props
    
    # delete the id attribute to ensure a new instance 
    delete @attributes[@key]
      
    # check to see if we should validate
    if !props or !props.silent
      validate = @validate props
      if typeof validate is 'undefined'
        @__save callback
      else if callback
        callback new Error 'Unable to save model: ' + validate
    else
      @__save callback
  
  
  _find: (options, callback) =>
    @responder.database.find options, @store, (err, res) =>
      if err
        callback err
      else if !options.only
        @find_related_models(res, callback)      
      else
        callback null, res
        
  _read: (id, only, callback) =>
    @responder.database.get id, @key, @store, (err, res) =>
      if err
        callback err
      else if res
        @set res
        if !only
          @find_related_models res, callback
        else  
          callback null, @attributes
      else
          callback null, false
          
  _save:( props, callback ) =>
    # extend any additional properties passed to save
    if props
      @attributes = @extend(@attributes, props)
    
    # check to see if we should validate
    if !props or !props.silent
      validate = @validate props
      if typeof validate is 'undefined'
        @__save callback
      else if callback
        callback new Error 'Unable to save model: ' + validate
    else
      @__save callback
    
  __save: (callback) =>
    @clean (err, cleaned) =>
      callback err if err
      if @get(@key)
        # assume if key is present we are updating
        if !cleaned.updated_on and @stamp_update
          cleaned.updated_on = @datetime()
        @responder.database.update cleaned, @key, @store, (err, res) =>
          if err
            callback err
          else
            callback null, cleaned
            
      else
        # automatic created_on storage
        if !cleaned.created_on and @stamp_create
          cleaned.created_on = @datetime()
        
        @responder.database.insert cleaned, @key, @store, (err, res) =>
          if err and callback
            callback err
          else if callback
            @set 'id', res.id
            callback null, cleaned
  
  _destroy: (id, callback) =>
    @responder.database.destroy id, @key, @store, (err, res) =>
        if err
          callback err
        else
          callback null, @attributes
  
  
  
  # data integrity methods.
  
  # standard validatation available client and server side - if validate is overriden... ?
  # return value of undefined a la Backbone.js means it passed.
  validate: (attrs) =>
    return @validate_fields(attrs) if @fields
      
  # validate_fields method will use the fields and any valid:'RULES' specified 
  validate_fields: (attrs) ->
    for field, options of @fields
      if options and options.valid
        rule = options.valid
        for key, value of attrs
          if field is key
            if rule is 'not_empty' and value is ''
              return field + ' must not have an empty value.'
            if rule is 'valid_email'
              valid_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
              if !value.match(valid_email)
                return field + ' must be a valid email address.'
            
    # completed         
    return undefined
                
  # clean() scrubs any invalid attributes present prior to saving 
  # useful for stuctured storage, unused by nosql/document stores
  clean: (callback) =>
    # if the responder engine is mysql based, get fields out of the store 
    if !@fields and @responder.database and @responder.database.isSql
      @responder.database.describe @store, (err, fields) =>
        if err
          throw new Error 'database storage object ' + @store + ' does not exist!'
        else
          @fields = fields
          @_clean callback
    else
      @_clean callback
  
  _clean: (callback) =>
    if @fields
      cleaned = {}
      for prop, val of @attributes
          for column, options of @fields
            if options and options.name
              column = options.name
            if column and prop.toString() is column
              cleaned[prop] = val
              break
              
      callback null, cleaned
    
    else
      callback null, @attributes
  
  
  # manipulation shortcuts
  increment: (field, callback) =>
    @responder.database.bump @store, field, 1, @key, @attributes[@key], callback
  
  decrement: (field, callback) =>
    @responder.database.bump @store, field, -1, @key, @attributes[@key], callback
  
  bump: (field, value, callback) =>
    @responder.database.bump @store, field, value, @key, @attributes[@key], callback
  
  
  # object relationship modeling methods  
  
  # find_related_models()
  # orm bridge, handles relationships and delegates finding to
  find_related_models: (results, callback) =>
    
    # since we'll be executing lots of queries in dynamic loop structures, 
    # we use async to queue up all the results before sending to callback
    @async = @responder.require 'async'
    
    calls = []
    calls.push (callback) ->
      callback null, results
      
    if results and @has_one
      calls.push (results, callback) =>
       @find_related results, @parse_relations(@has_one), true, callback
      
    if results and @has_many
      calls.push (results, callback) =>  
        @find_related results, @parse_relations(@has_many), false, callback
        
    if @belongs_to
      calls.push (results, callback) =>  
        @find_related results, @parse_relations(@belongs_to, true), true, callback
    
    if @has_mutual
      calls.push (results, callback) =>  
        @find_related results, @parse_relations(@has_mutual, false, true), false, callback
    
    @async.waterfall calls, callback
  
  # constructs an object based on name conventions or actual options specified
  parse_relations: (related, belongs, joined) =>
    
    # parse relationships depending on how they are specified 
    # (string, arr, object are all acceptable)
    relationships = []
    if typeof related is 'string'
      relations = related.split(',')
    else if typeof related is 'object'
      relations = []
      for prop, value of related
        obj = {}
        obj[prop] = value
        relations.push obj
    else
      relations = related
    
    # examine each relationship and get the parts we need.
    for ship in relations
      
      if typeof ship is 'object'
        linking = ship
        ship = Object.keys(ship)[0]
        linking = linking[ship] or {}
      else
        linking = {}
      
      # use inflections to get default values
      singular =  @store.singularize().toLowerCase()
      plural = ship.pluralize().toLowerCase()
        
      if joined 
        foreign = ship.singularize().toLowerCase() + '_' + @key
        local = @key
        linking.link_table = @store + '_' + ship.pluralize().toLowerCase() if ! linking.link_table
        linking.local_link = singular + '_' + @key 
      else
        local = if belongs then ship.singularize().toLowerCase() + '_' + @key else @key
        foreign = if belongs then @key else singular + '_' + @key
      
      # cleanup any un-filled in variables with the defaults
      linking.link = ship if !linking.link
      linking.model = ship.singularize().camelize() if !linking.model
      linking.table = ship.pluralize() if !linking.table
      linking.local_key = local if !linking.local_key
      linking.foreign_key = foreign if !linking.foreign_key
        
      relationships.push linking
    
    # return the array of relationships we need to get
    relationships    
  
  
  # executes a has_ relationship 
  find_related: (results, relations, first, callback) =>
    
    find_related = (related, cb) =>
      
      if models[related.model]
        model  = new models[related.model] @responder, { store: related.table }
      else
        model = new Flint.Model @responder, { store: related.table }
        
      # collect the keys we're looking for since we'll be using a single query to get related objects the hash them out.
      if results.length and results.length > 0
        keys = []
        for res in results
          keys.push res[related.local_key]
      else    
        keys = [results[related.local_key]]
      
      if related.link_table
        # join for mutual relationships
        query =
          where: related.link_table + '.' + related.local_link + ' IN("'+keys.join('","')+'")'
          join:
            table: related.link_table
            on: related.table + '.' + model.key + '=' + related.link_table + '.' + related.foreign_key
      
      else
        # standard query
        query =
          where: related.foreign_key + ' IN("'+keys.join('","')+'")'
          
      if related.fields
        query.fields = related.fields
      if related.order
        query.order = related.order
      if related.limit
        query.limit = related.limit
        
      model.find query, (err, orm) =>
        cb null, 
          results: orm
          related: related
    
    
    # async map calls the function we just defined using each relation in relations as an argument.      
    @async.map relations, find_related, (err, mapped) =>
      
      # map the results by looping and comparing keys 
      # faster than lots of queries
      for map in mapped
        if !map 
          continue
        if map.results
          
          # for joined queryes have to switch
          if map.related.link_table
            map.related.foreign_key = map.related.local_link
          
          if results.length and results.length > 0
            for res in results
              res[map.related.link] = [] if ! first
              for orm in map.results
                if orm[map.related.foreign_key] is res[map.related.local_key]
                  if !first
                    res[map.related.link].push orm
                  else
                    res[map.related.link] = orm
              # set the link to false if nothing turned up      
              if !res[map.related.link] or res[map.related.link].length is 0
                res[map.related.link] = false
          else
            results[map.related.link] = map.results
        
        else
          for res in results
            res[map.related.link] = false
      
      callback null, results
  
  
  
  # utilities
  */

  Model.prototype.__extend = function(obj, source) {
    var prop, value;
    for (prop in source) {
      value = source[prop];
      if (!obj.hasOwnProperty(prop)) obj[prop] = value;
    }
    return obj;
  };

  return Model;

})();
swell.Mongo = (function() {
  var mongo;

  mongo = require('mongojs');

  function Mongo(collection) {
    this.collection = collection;
    this.destroy = __bind(this.destroy, this);
    this.update = __bind(this.update, this);
    this.get = __bind(this.get, this);
    this.find = __bind(this.find, this);
    this.insert = __bind(this.insert, this);
    try {
      this.db = mongo.connect('mongodb://' + this.collection.data.host + ':27017/' + this.collection.data.db, [this.collection.store]);
    } catch (e) {
      console.log('[swell-mongo] connection error:', e.getMessage());
    }
    this;
  }

  Mongo.prototype.insert = function(object, callback) {
    return this.db[this.collection.store].save(object, callback);
  };

  Mongo.prototype.find = function(options, callback) {
    if (options.id) delete options.id;
    return this.db[this.collection.store].find(options).sort(this.collection.sort_by, callback);
  };

  Mongo.prototype.get = function(id, callback) {
    return this.db[this.collection.store].findOne({
      _id: mongo.ObjectId(id)
    }, callback);
  };

  Mongo.prototype.update = function(id, object, callback) {
    var prop, update, val;
    update = {
      $set: {}
    };
    for (prop in object) {
      val = object[prop];
      if (prop !== '_id') update.$set[prop] = val;
    }
    return this.db[this.collection.store].update({
      _id: mongo.ObjectId(object._id)
    }, update, callback);
  };

  Mongo.prototype.destroy = function(id, object, callback) {
    return this.db[this.collection.store].remove({
      _id: mongo.ObjectId(object.id)
    }, callback);
  };

  return Mongo;

})();
swell.Mysql = (function() {
  var moment, mysql;

  mysql = require('mysql');

  moment = require('moment');

  function Mysql(collection) {
    this.collection = collection;
    this.close_connection = __bind(this.close_connection, this);
    this.uuid = __bind(this.uuid, this);
    this.s4 = __bind(this.s4, this);
    this.query = __bind(this.query, this);
    this.bump = __bind(this.bump, this);
    this.destroy = __bind(this.destroy, this);
    this.update = __bind(this.update, this);
    this.insert = __bind(this.insert, this);
    this.get = __bind(this.get, this);
    this.find = __bind(this.find, this);
    this.pool = mysql.createPool({
      host: this.collection.data.host,
      user: this.collection.data.user,
      password: this.collection.data.password
    });
    this;
  }

  Mysql.prototype.find = function(options, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        var conditions, direction, field, fields, operand, query, val, value, _ref;
        if (err) return callback(err);
        fields = options.fields ? options.fields : '*';
        query = 'SELECT ' + fields + ' FROM ' + _this.collection.store;
        if (options.join) {
          direction = options.join.direction || 'LEFT';
          query += ' ' + direction + ' JOIN (' + options.join.table + ') ';
          query += 'ON ' + options.join.on;
        }
        if (options.where) {
          if (typeof options.where === 'string') {
            query += ' WHERE ' + options.where;
          } else {
            conditions = [];
            _ref = options.where;
            for (field in _ref) {
              value = _ref[field];
              if (value instanceof Object) {
                for (operand in value) {
                  val = value[operand];
                  conditions.push(field + ' ' + operand + ' ' + conn.escape(val));
                }
              } else {
                conditions.push(field + '=' + conn.escape(value));
              }
            }
            query += ' WHERE ' + conditions.join(' AND ');
          }
        }
        if (options.order) {
          query += ' ORDER BY ' + options.order;
        } else if (_this.collection.sort_by) {
          query += ' ORDER BY ' + _this.collection.sort_by;
        }
        if (options.limit) query += ' LIMIT ' + options.limit;
        return conn.query(query, function(err, rows, fields) {
          var prop, results, row, value, _i, _len;
          conn.release();
          if (err && callback) {
            return callback(err);
          } else {
            results = [];
            if (rows.length === 0) {
              return callback(null, false);
            } else {
              for (_i = 0, _len = rows.length; _i < _len; _i++) {
                row = rows[_i];
                for (prop in row) {
                  value = row[prop];
                  row[prop] = value;
                }
                results.push(row);
              }
              if (callback) return callback(null, results);
            }
          }
        });
      });
    });
  };

  Mysql.prototype.get = function(key, id, callback) {
    var _this = this;
    return conn.query('SELECT * FROM ' + this.collection.store + ' WHERE ' + key + ' = ' + conn.escape(id), function(err, rows, fields) {
      var prop, res, value;
      if (err) callback(err);
      if (rows && rows.length > 0) {
        res = rows[0];
        for (prop in res) {
          value = res[prop];
          res[prop] = value;
        }
        return callback(null, res);
      } else {
        return callback(null, false);
      }
    });
  };

  Mysql.prototype.insert = function(object, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        var query;
        if (err) return callback(err);
        object[_this.collection.model.key] = _this.uuid();
        return query = conn.query('INSERT INTO ' + _this.collection.store + ' SET ?', object, function(err, res) {
          if (err) {
            console.log('[swell-mysql] query caused error:', query.sql);
            return callback(err);
          } else if (callback) {
            return callback(null, object);
          }
        });
      });
    });
  };

  Mysql.prototype.update = function(id, object, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        var query;
        if (err) return callback(err);
        return query = conn.query('UPDATE ' + _this.collection.store + ' SET ? WHERE ' + _this.collection.model.key + ' = ' + conn.escape(id), object, function(err, res) {
          conn.release();
          if (err) {
            console.log('[swell-mysql] query caused error:', query.sql);
            return callback(err);
          }
          if (callback) return callback(err, res);
        });
      });
    });
  };

  Mysql.prototype.destroy = function(id, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        if (err) return callback(err);
        return conn.query('DELETE FROM ' + _this.collection.store + ' WHERE ' + _this.collection.model.key + ' = ' + conn.escape(id), function(err, res) {
          conn.release();
          if (err) {
            console.log('[swell-mysql] query caused error:', query.sql);
            return callback(err);
          }
        });
      });
    });
  };

  Mysql.prototype.bump = function(field, value, id, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        if (err) return callback(err);
        return conn.query('UPDATE ' + _this.collection.store + ' SET ' + field + '=' + field + '+' + value + ' WHERE ' + _this.collection.model.key + ' = ' + conn.escape(id), function(err, res) {
          conn.release();
          if (err) {
            console.log('[swell-mysql] query caused error:', query.sql);
            return callback(err);
          }
        });
      });
    });
  };

  Mysql.prototype.query = function(query, callback) {
    var _this = this;
    return this.pool.getConnection(function(err, conn) {
      if (err) return callback(err);
      return conn.query('USE ' + _this.collection.data.db, function(err, rows) {
        var results;
        if (err) return callback(err);
        results = [];
        return conn.query(query, function(err, rows, fields) {
          var row, _i, _len;
          conn.release();
          if (err) {
            console.log('[swell-mysql] query caused error:', query.sql);
            return callback(err);
          } else {
            if (rows.length === 0) {
              return callback(false);
            } else {
              for (_i = 0, _len = rows.length; _i < _len; _i++) {
                row = rows[_i];
                results.push(row);
              }
              if (callback) return callback(null, results);
            }
          }
        });
      });
    });
  };

  Mysql.prototype.s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
  };

  Mysql.prototype.uuid = function() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
  };

  Mysql.prototype.close_connection = function() {
    return conn.end();
  };

  return Mysql;

})();
swell.Responder = (function() {
  var fs, path;

  fs = require('fs');

  path = require('path');

  Responder.prototype.expose_rest = false;

  function Responder(config) {
    this.config = config;
    this.sort = __bind(this.sort, this);
    this.cookie = __bind(this.cookie, this);
    this["delete"] = __bind(this["delete"], this);
    this.put = __bind(this.put, this);
    this.post = __bind(this.post, this);
    this.get = __bind(this.get, this);
    this.after = __bind(this.after, this);
    this.before = __bind(this.before, this);
    this.initialize.apply(this, arguments);
    if (typeof this.collection === 'function') {
      this.collection = new this.collection(this.config);
    }
    this;
  }

  Responder.prototype.initialize = function(config) {
    this.config = config;
    return this;
  };

  Responder.prototype.before = function(req) {
    return true;
  };

  Responder.prototype.after = function(req) {
    return true;
  };

  Responder.prototype.get = function(req, callback) {
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    if (req.body.id) {
      return this.collection.get(req.body.id, callback);
    } else {
      return this.collection.fetch(callback);
    }
  };

  Responder.prototype.post = function(req, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return this.collection.add(req.body, function(err, res) {
      var data;
      if (err) return callback(err);
      data = {
        type: 'add',
        res: [res],
        emit: {
          event: _this.collection.store,
          space: _this.config.server.socket_io.namespace
        }
      };
      return callback(null, data);
    });
  };

  Responder.prototype.put = function(req, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return this.collection.update(req.body, function(err, res) {
      var data;
      if (err) return callback(err);
      data = {
        type: 'saved',
        res: [res],
        emit: {
          event: _this.collection.store,
          space: _this.config.server.socket_io.namespace
        }
      };
      return callback(null, data);
    });
  };

  Responder.prototype["delete"] = function(req, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return this.collection.remove(req.body, function(err, res) {
      var data;
      if (err) return callback(err);
      data = {
        type: 'removed',
        res: [res],
        emit: {
          event: _this.collection.store,
          space: _this.config.server.socket_io.namespace
        }
      };
      return callback(null, data);
    });
  };

  Responder.prototype.cookie = function(name, value, options) {
    if (options == null) options = {};
    if (typeof value === 'undefined') {
      if (this.__cookies[name]) {
        return this.__cookies[name];
      } else {
        return false;
      }
    }
    if (value === -1) {
      return this.res.clearCookie(name);
    } else {
      if (!options.signed) options.signed = true;
      return this.res.cookie(name, value, options);
    }
    return false;
  };

  Responder.prototype.sort = function(req, callback) {
    var data, key, obj, results, sort, update, _ref;
    if (!this.collection.model || !this.collection.model.key) {
      return callback('[swell] sort was called on a responder that does not have a collection, store, or model or the model is missing a key: attribute');
    }
    results = [];
    _ref = req.body.sorted;
    for (key in _ref) {
      obj = _ref[key];
      update = {};
      update[this.collection.model.key] = key;
      sort = this.collection.sort_by ? this.collection.sort_by : 'sort_order';
      update[sort] = obj;
      results.push(update);
      this.collection.update(update, function() {});
    }
    data = {
      type: 'sort',
      res: results,
      emit: {
        event: this.collection.store,
        space: this.config.server.socket_io.namespace
      }
    };
    return callback(null, data);
  };

  return Responder;

})();
models.Example = (function() {

  __extends(Example, swell.Model);

  function Example() {
    Example.__super__.constructor.apply(this, arguments);
  }

  Example.prototype.idAttribute = '_id';

  Example.prototype.fields = {
    name: {
      type: 'string',
      label: 'Full Name',
      sortable: true,
      not_empty: true,
      not: 'bad',
      message: 'Custom description validation message'
    },
    color: {
      type: 'string',
      label: 'Color',
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/,
      message: 'Colors must be in hex format'
    },
    length: {
      type: 'number',
      label: 'Length (in.)',
      round: 2,
      sortable: true
    },
    last_seen: {
      label: 'Last Seen',
      type: 'date',
      past: false,
      sortable: true
    },
    price: {
      label: 'MSRP',
      type: 'currency',
      sortable: true,
      format: '$,'
    },
    email: {
      type: 'email'
    },
    sort_order: {
      type: 'number',
      length: 2
    }
  };

  Example.prototype.defaults = {
    name: 'Swell Example Model',
    color: 'cc0000',
    length: '12',
    sort_order: 5000
  };

  return Example;

})();
models.User = (function() {

  __extends(User, swell.Model);

  function User() {
    User.__super__.constructor.apply(this, arguments);
  }

  return User;

})();
collections.Accounts = (function() {

  __extends(Accounts, swell.Collection);

  function Accounts() {
    Accounts.__super__.constructor.apply(this, arguments);
  }

  Accounts.prototype.resource = 'mysql-flybook';

  Accounts.prototype.expose_rest = true;

  return Accounts;

})();
collections.Examples = (function() {

  __extends(Examples, swell.Collection);

  function Examples() {
    Examples.__super__.constructor.apply(this, arguments);
  }

  Examples.prototype.model = models.Example;

  Examples.prototype.url = '/examples/';

  Examples.prototype.resource = 'mongo-example';

  Examples.prototype.store = 'examples';

  Examples.prototype.sort_by = 'sort_order';

  Examples.prototype.list = ['_id', 'name', 'color', 'length', 'price', 'last_seen', 'active'];

  return Examples;

})();
collections.Statements = (function() {

  __extends(Statements, swell.Collection);

  function Statements() {
    this.grouped_dates = __bind(this.grouped_dates, this);
    Statements.__super__.constructor.apply(this, arguments);
  }

  Statements.prototype.resource = 'mysql-flybook';

  Statements.prototype.store = 'statements';

  Statements.prototype.grouped_dates = function() {};

  return Statements;

})();
collections.Users = (function() {

  __extends(Users, swell.Collection);

  function Users() {
    Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.resource = 'mysql-flybook';

  Users.prototype.store = 'users';

  Users.prototype.list = ['id', 'name', 'username', 'email'];

  return Users;

})();
responders.Examples = (function() {
  var moment;

  __extends(Examples, swell.Responder);

  function Examples() {
    this.cookies = __bind(this.cookies, this);
    this.app = __bind(this.app, this);
    Examples.__super__.constructor.apply(this, arguments);
  }

  moment = require('moment');

  Examples.prototype.collection = collections.Examples;

  Examples.prototype.expose_rest = true;

  Examples.prototype.app = function(req, callback) {
    return callback(null, {
      view: 'index',
      layout: 'layouts/app'
    });
  };

  Examples.prototype.cookies = function(req, callback) {
    var expire;
    expire = moment().add('days', 30).diff(moment(), 'seconds');
    this.cookie('remember', 'the meaning of life', {
      maxAge: expire
    });
    console.log(this.cookie('remember'));
    this.cookie('destroy', -1);
    return callback(null, 'This is a cookie test method response.');
  };

  return Examples;

})();
responders.Pages = (function() {

  __extends(Pages, swell.Responder);

  function Pages() {
    this.page = __bind(this.page, this);
    this.index = __bind(this.index, this);
    this.init = __bind(this.init, this);
    Pages.__super__.constructor.apply(this, arguments);
  }

  Pages.prototype.init = function(config) {
    this.config = config;
  };

  Pages.prototype.index = function(req, callback) {
    var data;
    data = {
      view: 'index',
      layout: 'layouts/page'
    };
    return callback(null, data);
  };

  Pages.prototype.page = function(req, callback) {
    var data;
    data = {
      view: 'docs/' + req.params.view.replace(/\./g, '/'),
      layout: 'layouts/page'
    };
    return callback(null, data);
  };

  return Pages;

})();
exports.swell = swell;
exports.models = models;
exports.collections = collections;
exports.responders = responders;
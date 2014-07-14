// last compiled: 2014-07-14 15:07:77

var swell = {};
var models = {};
var collections = {};
var responders = {};

__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

swell.Collection = (function() {

  Collection.prototype.key = 'id';

  Collection.prototype.sort = 'sort_order';

  function Collection(config, callback) {
    this.comparator = __bind(this.comparator, this);
    this.pare = __bind(this.pare, this);
    this.update = __bind(this.update, this);
    this.add = __bind(this.add, this);
    this.get = __bind(this.get, this);
    this.where = __bind(this.where, this);
    this.fetch = __bind(this.fetch, this);
    var _this = this;
    if (this.data = config.server.resources[this.resource]) {
      if (this.data.engine === 'mongo') this.db = new swell.Mongo(this);
      if (this.data.engine === 'mysql') this.db = new swell.Mysql(this);
      if (this.data.engine === 'mysql') {
        this.db.use(function(err, res) {
          if (err) callback(err);
          return callback(null, _this);
        });
      } else if (this.db) {
        callback(null, this);
      } else {
        callback('[swell] could not connect to data source "' + this.resource + '" :' + JSON.stringify(this.data));
      }
    } else {
      callback('[swell] your collection is attempting to locate an unspecified data resource "' + this.resource + '". Define it in your configuration.');
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
    return this.db.get(this.key, id, callback);
  };

  Collection.prototype.add = function(data, callback) {
    var cleaned;
    if (typeof this.model !== 'function') {
      return callback('[swell] a model must be specified to use REST features');
    }
    this.model = new this.model(data);
    cleaned = this.model.validate(data);
    console.log(typeof cleaned);
    if (typeof cleaned !== 'undefined') {
      return callback('[swell] validation error: ' + cleaned);
    }
    return this.db.insert(this.model.attributes, callback);
  };

  Collection.prototype.update = function(data, callback) {
    return this.db.update(this.key, data, callback);
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

  Collection.prototype.comparator = function(model) {
    if (this.sort_by) {
      return model.get(this.sort_by);
    } else {
      return 0;
    }
  };

  return Collection;

})();
swell.Model = (function() {

  Model.prototype.key = 'id';

  Model.prototype.attributes = {};

  function Model(attributes) {
    this.attributes = attributes;
    this.validate_field = __bind(this.validate_field, this);
    this.clean = __bind(this.clean, this);
    this.validate = __bind(this.validate, this);
    this.set = __bind(this.set, this);
    this.get = __bind(this.get, this);
    this.__extend(this.attributes || {}, this.defaults);
    this;
  }

  Model.prototype.get = function(prop) {
    return this.attributes[prop];
  };

  Model.prototype.set = function(prop, value) {
    var i, k;
    if (prop instanceof Object) {
      for (k in prop) {
        i = prop[k];
        this.attributes[k] = i;
      }
    } else {
      this.attributes[prop] = value;
    }
    return this.attributes;
  };

  Model.prototype.validate = function(attrs, allow_objects) {
    var key, valid, value, _ref;
    if (allow_objects == null) allow_objects = true;
    this.clean();
    _ref = this.attributes;
    for (key in _ref) {
      value = _ref[key];
      valid = this.validate_field(key, this.fields[key]);
    }
  };

  Model.prototype.clean = function() {
    var key, value, _ref;
    _ref = this.attributes;
    for (key in _ref) {
      value = _ref[key];
      if (!this.fields[key] && key !== this.idAttribute) {
        delete this.attributes[key];
      }
    }
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
    this.valid_id = __bind(this.valid_id, this);
    this.bump = __bind(this.bump, this);
    this.destroy = __bind(this.destroy, this);
    this.update = __bind(this.update, this);
    this.insert = __bind(this.insert, this);
    this.get = __bind(this.get, this);
    this.find = __bind(this.find, this);
    try {
      this.db = mongo.connect('mongodb://' + this.collection.data.host + ':27017/' + this.collection.data.db, [this.collection.store]);
    } catch (e) {
      console.log('caugh');
    }
    this;
  }

  Mongo.prototype.find = function(options, callback) {
    if (options.id) delete options.id;
    return this.db[this.collection.store].find(options).sort(this.collection.sort_by, callback);
  };

  Mongo.prototype.get = function(id, callback) {
    if (!this.valid_id(id)) {
      callback('[swell-mongo] bad object id argument: ' + id);
    }
    return this.db[this.collection.store].findOne({
      _id: mongo.ObjectId(id)
    }, callback);
  };

  Mongo.prototype.insert = function(object, callback) {
    return this.db[this.collection.store].save(object, callback);
  };

  Mongo.prototype.update = function(object, callback) {
    return this.db[this.collection.store].save(object, callback);
  };

  Mongo.prototype.destroy = function(object, callback) {
    if (!this.valid_id(id)) {
      callback('[swell-mongo] bad object id argument: ' + id);
    }
    return this.db[this.collection.store].remove({
      _id: mongo.ObjectId(object.id)
    }, callback);
  };

  Mongo.prototype.bump = function(store, field, value, key, id, callback) {};

  Mongo.prototype.valid_id = function(id) {
    return id.match('^[0-9a-fA-F]{24}$');
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
    this.describe = __bind(this.describe, this);
    this.objectify = __bind(this.objectify, this);
    this.stringify = __bind(this.stringify, this);
    this.query = __bind(this.query, this);
    this.bump = __bind(this.bump, this);
    this.destroy = __bind(this.destroy, this);
    this.update = __bind(this.update, this);
    this.insert = __bind(this.insert, this);
    this.get = __bind(this.get, this);
    this.find = __bind(this.find, this);
    this.db = mysql.createConnection({
      host: this.collection.data.host,
      user: this.collection.data.user,
      password: this.collection.data.password
    });
    this.db.connect();
    this;
  }

  Mysql.prototype.use = function(callback) {
    return this.db.query('USE ' + this.collection.data.db, callback);
  };

  Mysql.prototype.find = function(options, callback) {
    var conditions, direction, field, fields, operand, query, val, value, _ref;
    var _this = this;
    fields = options.fields ? options.fields : '*';
    query = 'SELECT ' + fields + ' FROM ' + this.collection.store;
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
              conditions.push(field + ' ' + operand + ' ' + this.db.escape(val));
            }
          } else {
            conditions.push(field + '=' + this.db.escape(value));
          }
        }
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    if (options.order) {
      query += ' ORDER BY ' + options.order;
    } else if (this.collection.sort_by) {
      query += ' ORDER BY ' + this.collection.sort_by;
    }
    if (options.limit) query += ' LIMIT ' + options.limit;
    return this.db.query(query, function(err, rows, fields) {
      var prop, results, row, value, _i, _len;
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
  };

  Mysql.prototype.get = function(key, id, callback) {
    var _this = this;
    return this.db.query('SELECT * FROM ' + this.collection.store + ' WHERE ' + key + ' = ' + this.db.escape(id), function(err, rows, fields) {
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
    return this.db.query('INSERT INTO ' + this.collection.store + ' SET ?', object, function(err, res) {
      if (err) {
        return callback(err);
      } else if (callback) {
        res.id = object.id;
        return callback(null, res);
      }
    });
  };

  Mysql.prototype.update = function(key, object, callback) {
    return this.db.query('UPDATE ' + this.collection.store + ' SET ? WHERE ' + key + ' = ' + this.db.escape(id), object, callback);
  };

  Mysql.prototype.destroy = function(key, id, callback) {
    return this.db.query('DELETE FROM ' + this.collection.store + ' WHERE ' + key + ' = ' + this.db.escape(id), callback);
  };

  Mysql.prototype.bump = function(key, field, value, id, callback) {
    return this.db.query('UPDATE ' + this.collection.store + ' SET ' + field + '=' + field + '+' + value + ' WHERE ' + key + ' = ' + this.db.escape(id), callback);
  };

  Mysql.prototype.query = function(query, callback) {
    var results;
    results = [];
    return this.db.query(query, function(err, rows, fields) {
      var row, _i, _len;
      if (err) {
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
  };

  Mysql.prototype.stringify = function(object) {
    var prop, value;
    for (prop in object) {
      value = object[prop];
      if (typeof value !== 'string') object[prop] = JSON.stringify(value);
    }
    return object;
  };

  Mysql.prototype.objectify = function(string_or_object) {
    if (typeof string_or_object !== 'string') return string_or_object;
    if (/^[\],:{}\s]*$/.test(string_or_object.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
      string_or_object = JSON.parse(string_or_object);
    }
    return string_or_object;
  };

  Mysql.prototype.describe = function(callback) {
    return this.db.query('DESC ' + this.collection.store, function(err, rows, fields) {
      var row, valid, _i, _len;
      if (err) {
        return callback(err);
      } else {
        valid = [];
        for (_i = 0, _len = rows.length; _i < _len; _i++) {
          row = rows[_i];
          valid.push({
            name: row.Field,
            type: row.Type
          });
        }
        if (callback) return callback(null, valid);
      }
    });
  };

  Mysql.prototype.s4 = function() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
  };

  Mysql.prototype.uuid = function() {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4() + this.s4() + this.s4();
  };

  Mysql.prototype.close_connection = function() {
    return this.db.end();
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
    this["delete"] = __bind(this["delete"], this);
    this.put = __bind(this.put, this);
    this.post = __bind(this.post, this);
    this.get = __bind(this.get, this);
    this.after = __bind(this.after, this);
    this.before = __bind(this.before, this);
    this.initialize.apply(this, arguments);
    this;
  }

  Responder.prototype.initialize = function(config) {
    this.config = config;
    return this;
  };

  Responder.prototype.before = function(request) {
    return true;
  };

  Responder.prototype.after = function(request) {
    return true;
  };

  Responder.prototype.get = function(request, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      if (err) return callback(err);
      if (request.data.id) {
        return _this.collection.get(request.data.id, callback);
      } else {
        return _this.collection.fetch(callback);
      }
    });
  };

  Responder.prototype.post = function(request, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      if (err) return callback(err);
      return _this.collection.add(request.data, callback);
    });
  };

  Responder.prototype.put = function(request, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      if (err) return callback(err);
      return _this.collection.update(request.data, callback);
    });
  };

  Responder.prototype["delete"] = function(request, callback) {
    var _this = this;
    if (!this.expose_rest) {
      return callback(null, {
        unauthorized: true
      });
    }
    if (!this.collection) {
      return callback('[swell] A collection must specified to use REST features');
    }
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      if (err) return callback(err);
      return _this.collection.remove(request.data, callback);
    });
  };

  return Responder;

})();
models.Book = (function() {

  __extends(Book, swell.Model);

  function Book() {
    Book.__super__.constructor.apply(this, arguments);
  }

  Book.prototype.has_many = [collections.Chapters];

  Book.prototype.fields = {
    title: {
      type: 'string'
    }
  };

  return Book;

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
      not_empty: true,
      not: 'bad',
      message: 'Custom description validation message'
    },
    color: {
      type: 'string',
      maxlength: 6
    },
    sort_order: {
      type: 'number',
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/,
      length: 2
    },
    start_date: {
      type: 'datetime',
      future: false
    }
  };

  Example.prototype.defaults = {
    name: 'New Example',
    color: 'cc0000'
  };

  return Example;

})();
models.User = (function() {

  __extends(User, swell.Model);

  function User() {
    User.__super__.constructor.apply(this, arguments);
  }

  User.prototype.key = 'id';

  return User;

})();
collections.Accounts = (function() {

  __extends(Accounts, swell.Collection);

  function Accounts() {
    Accounts.__super__.constructor.apply(this, arguments);
  }

  Accounts.prototype.resource = 'mysql';

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

  Examples.prototype.resource = 'mongo-example-bad';

  Examples.prototype.store = 'examples';

  Examples.prototype.sort_by = 'sort_order';

  Examples.prototype.list = ['_id', 'name', 'color'];

  return Examples;

})();
collections.Statements = (function() {

  __extends(Statements, swell.Collection);

  function Statements() {
    this.grouped_dates = __bind(this.grouped_dates, this);
    Statements.__super__.constructor.apply(this, arguments);
  }

  Statements.prototype.resource = 'mysql';

  Statements.prototype.store = 'statements';

  Statements.prototype.grouped_dates = function() {};

  return Statements;

})();
collections.Users = (function() {

  __extends(Users, swell.Collection);

  function Users() {
    Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.resource = 'mysql';

  Users.prototype.store = 'users';

  Users.prototype.list = ['id', 'name', 'username', 'email'];

  return Users;

})();
responders.Examples = (function() {

  __extends(Examples, swell.Responder);

  function Examples() {
    this.colors = __bind(this.colors, this);
    Examples.__super__.constructor.apply(this, arguments);
  }

  Examples.prototype.collection = collections.Examples;

  Examples.prototype.expose_rest = true;

  Examples.prototype.colors = function(request, callback) {
    var _this = this;
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      return _this.collection.where({
        color: request.data.color
      }, callback);
    });
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
    return callback(null, {
      view: 'index'
    });
  };

  Pages.prototype.page = function(req, callback) {
    return callback(null, {
      view: req.params.view
    });
  };

  return Pages;

})();
responders.Statements = (function() {
  var async, fs;

  __extends(Statements, swell.Responder);

  function Statements() {
    this.annual = __bind(this.annual, this);
    Statements.__super__.constructor.apply(this, arguments);
  }

  fs = require('fs');

  async = require('async');

  Statements.prototype.expose_rest = true;

  Statements.prototype.collection = collections.Statements;

  Statements.prototype.annual = function(req, callback) {
    var _this = this;
    return new this.collection(this.config, function(err, collection) {
      _this.collection = collection;
      return _this.collection.db.query('SELECT YEAR(date) as year, MONTHNAME(date) as month, SUM(total) as total, SUM(reservation_fees) as res_fees, SUM(service_fees) as serv_fees FROM statements GROUP BY YEAR(date), MONTH(date)', function(err, res) {
        if (err) callback(err);
        return callback(null, res);
      });
    });
  };

  return Statements;

})();
responders.Users = (function() {

  __extends(Users, swell.Responder);

  function Users() {
    this.authenticate = __bind(this.authenticate, this);
    this.before = __bind(this.before, this);
    Users.__super__.constructor.apply(this, arguments);
  }

  Users.prototype.collection = collections.Users;

  Users.prototype.expose_rest = true;

  Users.prototype.before = function(req) {
    return true;
  };

  Users.prototype.authenticate = function(req, callback) {
    return callback('This is a custom error!');
  };

  return Users;

})();
exports.swell = swell;
exports.models = models;
exports.collections = collections;
exports.responders = responders;
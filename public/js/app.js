// last compiled: 2014-07-23 11:07:96

var swell = {};
var models = {};
var collections = {};
var routers = {};
var views = {};
    views.examples = {};
    views.reports = {};

__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

swell.Collection = (function() {

  __extends(Collection, Backbone.Collection);

  function Collection() {
    this.sorted = __bind(this.sorted, this);
    this.pull = __bind(this.pull, this);
    this.snag = __bind(this.snag, this);
    this.grab = __bind(this.grab, this);
    this.update = __bind(this.update, this);
    this.init = __bind(this.init, this);
    this.initialize = __bind(this.initialize, this);
    Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.sychronize = true;

  Collection.prototype.comparator = function(model) {
    if (this.sort_by) {
      return +model.get(this.sort_by);
    } else {
      return 1;
    }
  };

  Collection.prototype.initialize = function(options) {
    var _this = this;
    synchro.on(this.store, this.update);
    this.response_callback = {
      success: function(data) {
        console.info('[swell] ' + moment().format('HH:mm:ss') + ' Collection.' + _this.operation + ' returned: ', data);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('[swell] ' + moment().format('HH:mm:ss') + ' Collection.' + _this.operation + ' error: ' + error.responseText);
        return _this.callback(error.responseText);
      }
    };
    this.init.apply(this, arguments);
    return this;
  };

  Collection.prototype.init = function() {
    return this;
  };

  Collection.prototype.update = function(data) {
    var attr, _i, _len, _ref;
    if (this.models.length === 0) return false;
    if (!data || !data.res) {
      return console.error('[swell] ' + moment().format('HH:mm:ss') + ' Collection.update recieved empty or bad data from the server:', arguments);
    }
    _ref = data.res;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attr = _ref[_i];
      this.add(attr, {
        merge: true
      });
    }
    return this.trigger('updated', this);
  };

  Collection.prototype.grab = function(callback) {
    var _this = this;
    if (this.models.length === 0) {
      return this.pull(function(err, res) {
        return callback(null, _this.models);
      });
    } else {
      return callback(null, this.models);
    }
  };

  Collection.prototype.snag = function(id, callback) {
    var _this = this;
    if (this.models.length === 0) {
      return this.pull(function(err, res) {
        return callback(_this.get(id));
      });
    } else {
      return callback(this.get(id));
    }
  };

  Collection.prototype.pull = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    this.operation = 'pull';
    return this.fetch(options);
  };

  Collection.prototype.sorted = function(ordered) {
    var handler;
    handler = function(err, res) {
      if (err) {
        return console.error('[swell] ' + moment('HH:mm:ss') + ' error sorting a collection: ' + err.responseText);
      }
    };
    return helpers.ajax(this.url + 'sort', handler, {
      data: JSON.stringify({
        sorted: ordered
      })
    }, 'POST');
  };

  return Collection;

})();
swell.Form = (function() {

  __extends(Form, Backbone.View);

  function Form() {
    this["delete"] = __bind(this["delete"], this);
    this.cancel = __bind(this.cancel, this);
    this.done = __bind(this.done, this);
    this.init = __bind(this.init, this);
    Form.__super__.constructor.apply(this, arguments);
  }

  Form.prototype._events = {
    'change input,textarea,select': 'changed',
    'click .done': 'done',
    'click .save': 'save',
    'click .delete': 'delete',
    'click .cancel': 'cancel',
    'click label': 'label_click',
    'submit form': 'nosubmit'
  };

  Form.prototype.initialize = function() {
    this.events = _.extend({}, this._events, this.events);
    this.init.apply(this, arguments);
    return this;
  };

  Form.prototype.init = function() {};

  Form.prototype.render = function(template, data, model) {
    var _this = this;
    this.template = template;
    this.data = data != null ? data : {};
    if (model == null) model = false;
    if (model) {
      this.model = model;
      this.data.model = this.model;
      this.data = _.extend({}, this.data, this.model.attributes);
    }
    this.before(function() {
      $(_this.el).html(tmpl[_this.template](_this.data));
      return _this.after();
    });
    return this;
  };

  Form.prototype.before = function(callback) {
    return callback();
  };

  Form.prototype.after = function() {};

  Form.prototype.changed = function(e) {
    var attribute, input, value;
    e.stopPropagation();
    input = $(e.target);
    value = input.val();
    if (input.attr('type') === 'checkbox') {
      if (input.is(':checked')) {
        value = input.val();
      } else {
        value = 0;
      }
    }
    if (input.hasClass('num')) {
      value = value.toString().replace(/[A-Za-z$-,]/g, '');
    }
    if (!_.isUndefined(value && !_.isUndefined(this.model))) {
      attribute = input.attr('name');
      this.model.set(attribute, value.toString(), {
        silent: !this.valid_changes
      });
      this.trigger('changed', this.model, attribute, value);
      return this.trigger('changed:' + attribute, this.model, value);
    }
  };

  Form.prototype.save = function() {
    return this.collection.add(this.model);
  };

  Form.prototype.done = function(silent) {
    if (silent == null) silent = false;
    if (!(silent && !_.isObject(silent))) this.trigger('saved', this.model);
    return this.cancel();
  };

  Form.prototype.cancel = function(silent) {
    if (silent == null) silent = false;
    if (!(silent && !_.isObject(silent))) this.trigger('canceled', this.model);
    return $(this.el).empty();
  };

  Form.prototype["delete"] = function() {
    this.done(true);
    return this.collection.remove(this.model);
  };

  Form.prototype.label_click = function(e) {
    var input;
    e.stopPropagation();
    input = $(e.target);
    if (input.prev().get(0).tagName === 'INPUT') input.prev().click();
    if (input.next().get(0).tagName === 'INPUT') return input.next().click();
  };

  Form.prototype.nosubmit = function() {
    return false;
  };

  return Form;

})();
swell.Helpers = (function() {

  function Helpers() {
    this.ajax = __bind(this.ajax, this);
    var _this = this;
    _.extend(dust.helpers, this);
    this.response_callback = {
      success: function(data) {
        console.info('[swell] ' + moment().format('HH:mm:ss') + ' Helpers.ajax returned: ', data);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('[swell] ' + moment().format('HH:mm:ss') + ' Helpers.ajax error: ' + error.responseText);
        return _this.callback(error.responseText);
      }
    };
  }

  Helpers.prototype.loader = function(selector) {
    var loader;
    loader = '<div class="loader"><em class="one"></em><em class="two"></em><em class="three"></em><em class="four"></em></div>';
    return $(selector).html(loader);
  };

  Helpers.prototype.prop = function(chunk, context, bodies, params) {
    console.log(params);
    if (!params.key || !params.obj || !params.obj[params.key]) {
      return chunk.write('');
    }
    if (params.obj[params.key][params.field]) {
      return chunk.write(params.obj[params.key][params.field]);
    } else if (typeof chunk.write(params.obj[params.key] === 'string')) {
      return chunk.write(params.obj[params.key]);
    } else {
      return chunk.write('');
    }
  };

  Helpers.prototype.render = function(selector, template, context, callback) {
    return dust.render(template, context, function(err, out) {
      $(selector).html(out);
      if (callback) return callback();
    });
  };

  Helpers.prototype.ajax = function(url, callback, options, method) {
    this.callback = callback;
    if (method == null) method = 'POST';
    options = _.extend(this.response_callback, options);
    options.url = url;
    options.type = method;
    options.dataType = 'json';
    options.contentType = 'application/json';
    options.emulateHTTP = false;
    options.processData = false;
    options.emulateJSON = false;
    options.validate = true;
    return $.ajax(options);
  };

  return Helpers;

})();
swell.List = (function() {

  __extends(List, Backbone.View);

  function List() {
    this.quicksort = __bind(this.quicksort, this);
    this.swap = __bind(this.swap, this);
    this.compare = __bind(this.compare, this);
    this.partition = __bind(this.partition, this);
    this.sort = __bind(this.sort, this);
    this.sorted = __bind(this.sorted, this);
    this.render = __bind(this.render, this);
    List.__super__.constructor.apply(this, arguments);
  }

  List.prototype.events = {};

  List.prototype.__events = {
    'click tr,li': 'clicked',
    'click th.sortable': 'sort'
  };

  List.prototype.initialize = function(options) {
    _.extend(this, options);
    this.events = _.extend({}, this.__events, this.events);
    this.init.apply(this, arguments);
    return this;
  };

  List.prototype.init = function(options) {};

  List.prototype.render = function(template, context, callback) {
    var _this = this;
    _.extend(context, this);
    return helpers.render(this.el, template, context, function(err, res) {
      if (callback) callback(err, res);
      return $(_this.el + ' ol').sortable({
        update: _this.sortable ? _this.sorted : void 0
      });
    });
  };

  List.prototype.clicked = function(e) {
    var id;
    while (!(e.target.tagName === 'TR' || e.target.tagName === 'LI')) {
      e.target = e.target.parentNode;
    }
    id = $(e.target).attr('id');
    return this.trigger('clicked', id);
  };

  List.prototype.sorted = function(e) {
    var ordered;
    ordered = {};
    $(this.el + ' ol li').each(function(index) {
      var id;
      id = $(this).attr('id');
      return ordered[id] = index;
    });
    return this.trigger('sorted', ordered);
  };

  List.prototype.sort = function(e) {
    var arrow, heading, index, items, table_root, tr, trs, _i, _j, _len, _len2, _results;
    table_root = e.target;
    while (table_root.tagName !== 'TABLE') {
      table_root = table_root.parentNode;
    }
    index = $('tr th').index(e.target);
    heading = e.target;
    this.sort_data_type = $(e.target).attr('data-type');
    if (!this.sorting_dir) this.sorting_dir = 1;
    if (heading === this.heading) this.sorting_dir *= -1;
    this.heading = e.target;
    $('tr th').css('font-weight', '300');
    $('tr th span').remove();
    arrow = this.sorting_dir === -1 ? '<span>&uarr;&nbsp;</span>' : '<span>&darr;&nbsp;</span>';
    $(e.target).css('font-weight', 'bold');
    $(e.target).html(arrow + $(e.target).html());
    this.sort_index = index;
    trs = table_root.getElementsByTagName('tr');
    items = [];
    tr = 1;
    while (tr < trs.length) {
      items.push(trs[tr]);
      tr++;
    }
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      tr = items[_i];
      $(tr).remove();
    }
    this.quicksort(items, 0, items.length);
    _results = [];
    for (_j = 0, _len2 = items.length; _j < _len2; _j++) {
      tr = items[_j];
      _results.push($(table_root).append(tr));
    }
    return _results;
  };

  List.prototype.partition = function(items, begin, end, pivot) {
    var i, pivot_val, store, _ref;
    pivot_val = items[pivot];
    this.swap(items, pivot, end - 1);
    store = begin;
    for (i = begin, _ref = end - 1; begin <= _ref ? i < _ref : i > _ref; begin <= _ref ? i++ : i--) {
      if (this.compare(items[i], pivot_val)) {
        this.swap(items, store, i);
        store++;
      }
    }
    this.swap(items, end - 1, store);
    return store;
  };

  List.prototype.compare = function(a, b, type) {
    if (type == null) type = false;
    a = $(a.getElementsByTagName('td')[this.sort_index]).html();
    b = $(b.getElementsByTagName('td')[this.sort_index]).html();
    if (this.sort_data_type) {
      if (this.sort_data_type === 'date') {
        if (a.indexOf('-') > 0) a = a.substring(0, a.indexOf(' -'));
        if (b.indexOf('-') > 0) b = b.substring(0, b.indexOf(' -'));
        a = moment(a);
        b = moment(b);
        if (isNaN(a.toDate().getTime())) a = moment(0);
        if (isNaN(b.toDate().getTime())) b = moment(0);
      }
      if (this.sort_data_type === 'number') {
        a = parseFloat(a.replace(/[A-Za-z$,]/g, ''));
        b = parseFloat(b.replace(/[A-Za-z$,]/g, ''));
        if (isNaN(a)) a = 0;
        if (isNaN(b)) b = 0;
      }
    }
    if (this.sorting_dir === 1) {
      return a < b;
    } else {
      return a > b;
    }
  };

  List.prototype.swap = function(array, a, b) {
    var tmp;
    tmp = array[a];
    array[a] = array[b];
    array[b] = tmp;
    return array;
  };

  List.prototype.quicksort = function(items, begin, end) {
    var pivot;
    if ((end - 1) > begin) {
      pivot = begin + Math.floor(Math.random() * (end - begin));
      pivot = this.partition(items, begin, end, pivot);
      this.quicksort(items, begin, pivot);
      return this.quicksort(items, pivot + 1, end);
    }
  };

  return List;

})();
swell.Model = (function() {

  __extends(Model, Backbone.Model);

  function Model() {
    this["delete"] = __bind(this["delete"], this);
    this.push = __bind(this.push, this);
    this.pull = __bind(this.pull, this);
    this.init = __bind(this.init, this);
    this.initialize = __bind(this.initialize, this);
    this.sanitize = __bind(this.sanitize, this);
    this.validate = __bind(this.validate, this);
    Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.validate = function(attrs) {
    if (this.fields) return this.sanitize(attrs);
  };

  Model.prototype.sanitize = function(attrs) {};

  Model.prototype.initialize = function() {
    var _this = this;
    this.response_callback = {
      success: function(data) {
        console.info('[swell] ' + moment().format('HH:mm:ss') + 'Model.' + _this.operation + ' returned: ', _this.attributes);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('[swell] ' + moment().format('HH:mm:ss') + 'Model.' + _this.operation + ' error: ' + error.responseText);
        return _this.callback(error.responseText);
      }
    };
    this.init.apply(this, arguments);
    return this;
  };

  Model.prototype.init = function() {
    return this;
  };

  Model.prototype.pull = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    this.operation = 'pull';
    return this.fetch(options);
  };

  Model.prototype.push = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    this.operation = 'push';
    return this.save(null, options);
  };

  Model.prototype["delete"] = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    this.operation = 'delete';
    return this.destroy(options);
  };

  return Model;

})();
swell.Router = (function() {

  __extends(Router, Backbone.Router);

  function Router() {
    this.delegate = __bind(this.delegate, this);
    this.undelegate = __bind(this.undelegate, this);
    this.unbind = __bind(this.unbind, this);
    this.bind = __bind(this.bind, this);
    this.init = __bind(this.init, this);
    this.initialize = __bind(this.initialize, this);
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.initialize = function(app) {
    var _this = this;
    this.app = app;
    this.app.register(this);
    this.init.apply(this, arguments);
    this.on('all', function(route) {
      if (route === 'route') return;
      _this.app.undelegate(route);
      _this.delegate(route);
      if (_this.title) return $('title').text(_this.title);
    });
    return this;
  };

  Router.prototype.init = function() {};

  Router.prototype.bind = function(route) {};

  Router.prototype.unbind = function(route) {};

  Router.prototype.undelegate = function(route) {
    var obj, prop;
    console.info('[swell] ' + moment().format('HH:mm:ss') + ' unbinding ' + route);
    for (prop in this) {
      obj = this[prop];
      if (obj.undelegateEvents) obj.undelegateEvents();
    }
    return this.unbind(route);
  };

  Router.prototype.delegate = function(route) {
    var obj, prop;
    console.info('[swell] ' + moment().format('HH:mm:ss') + ' binding ' + route);
    for (prop in this) {
      obj = this[prop];
      if (obj.delegateEvents) obj.delegateEvents();
    }
    return this.bind(route);
  };

  return Router;

})();
swell.Synchro = (function() {

  function Synchro(options) {
    this.off = __bind(this.off, this);
    this.on = __bind(this.on, this);    this.namespace = options && options.nsp ? options.nsp : '/';
    this.socket = io(this.namespace);
  }

  Synchro.prototype.on = function(event, callback) {
    var _this = this;
    console.info('[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' subscribed');
    return this.socket.on(event, function(data) {
      console.info('[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' recieved', data);
      return callback(data);
    });
  };

  Synchro.prototype.off = function(event) {
    console.info('[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' unsubscribed');
    return this.socket.removeListener(event);
  };

  return Synchro;

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
      label: 'Name',
      not_empty: true,
      not: 'bad',
      message: 'Custom description validation message'
    },
    color: {
      type: 'string',
      label: 'Color',
      maxlength: 6
    },
    length: {
      type: 'number',
      label: 'Length (in.)',
      round: 2
    },
    sort_order: {
      type: 'number',
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/,
      length: 2
    },
    datetime: {
      label: 'Last Seen',
      type: 'datetime',
      past: false,
      format: 'MMM Do YYYY h:ma'
    },
    email: {
      type: 'email'
    }
  };

  Example.prototype.defaults = {
    name: 'This is fucking retarded',
    color: 'cc0000'
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

  Examples.prototype.resource = 'mysql-swell';

  Examples.prototype.store = 'examples';

  Examples.prototype.sort_by = 'sort_order';

  Examples.prototype.list = ['_id', 'name', 'color', 'length', 'datetime'];

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
routers.Application = (function() {

  __extends(Application, Backbone.Router);

  function Application() {
    this.undelegate = __bind(this.undelegate, this);
    this.register = __bind(this.register, this);
    this.main = __bind(this.main, this);
    Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.initialize = function(options) {
    window.helpers = this.helpers = new views.Helpers(options);
    window.synchro = this.synchro = new swell.Synchro(options);
    this.examples = new routers.Examples(this);
    this.reports = new routers.Reports(this);
    Backbone.history.start();
    console.info('[swell] ' + moment().format('HH:mm:ss') + ' app instantiated as window.app ');
    return this;
  };

  Application.prototype.main = function() {};

  Application.prototype.routers = [];

  Application.prototype.register = function(router) {
    return this.routers.push(router);
  };

  Application.prototype.undelegate = function(route) {
    var router, _i, _len, _ref, _results;
    _ref = this.routers;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      router = _ref[_i];
      _results.push(router.undelegate(route));
    }
    return _results;
  };

  return Application;

})();
routers.Examples = (function() {

  __extends(Examples, swell.Router);

  function Examples() {
    this.list = __bind(this.list, this);
    this.router = __bind(this.router, this);
    this.home = __bind(this.home, this);
    this.unbind = __bind(this.unbind, this);
    this.bind = __bind(this.bind, this);
    this.init = __bind(this.init, this);
    Examples.__super__.constructor.apply(this, arguments);
  }

  Examples.prototype.title = 'Swell Client Examples';

  Examples.prototype.routes = {
    'home': 'home',
    'router': 'router',
    'list/search/:query': 'list',
    'list': 'list',
    'form': 'form',
    'edit/:id': 'edit'
  };

  Examples.prototype.init = function(app) {
    this.app = app;
    window.examples = new collections.Examples;
    this.list = new swell.List({
      el: '.simple',
      sortable: true
    });
    return this.grid = new swell.List({
      el: '.grid',
      sortable: false,
      columns: ['name', 'color', 'length', 'datetime'],
      fields: new models.Example().fields
    });
  };

  Examples.prototype.bind = function() {
    var _this = this;
    this.list.on('sorted', examples.sorted);
    return examples.on('updated', function(res) {
      _this.list.render('examples.list_simple', {
        examples: examples.models
      });
      return _this.grid.update;
    });
  };

  Examples.prototype.unbind = function() {
    this.list.off('sorted');
    return examples.off('updated');
  };

  Examples.prototype.home = function() {
    return helpers.render('section[role=main]', 'examples.home', this.app);
  };

  Examples.prototype.router = function() {
    return helpers.render('section[role=main]', 'examples.router', this.app);
  };

  Examples.prototype.list = function(search) {
    var _this = this;
    return helpers.render('section[role=main]', 'examples.list', this.app, function() {
      helpers.loader('.simple,.grid');
      return examples.grab(function(err, models) {
        var display;
        display = search ? _this.collection.search(search, 'name') : models;
        _this.list.render('examples.list_simple', {
          examples: display
        });
        return _this.grid.render('examples.list_grid', {
          examples: display
        });
      });
    });
  };

  return Examples;

})();
routers.Reports = (function() {

  __extends(Reports, swell.Router);

  function Reports() {
    this.bind = __bind(this.bind, this);
    this.reports = __bind(this.reports, this);
    this.init = __bind(this.init, this);
    Reports.__super__.constructor.apply(this, arguments);
  }

  Reports.prototype.routes = {
    'reports': 'reports',
    'reports/:which': 'reports'
  };

  Reports.prototype.init = function() {
    return this.view = new views.reports.ReportsChart(this);
  };

  Reports.prototype.reports = function(which) {
    if (which == null) which = 'reservation_fees';
    return console.log('bind?');
  };

  Reports.prototype.bind = function() {
    return console.log('reports binding!');
  };

  return Reports;

})();
views.Helpers = (function() {

  __extends(Helpers, swell.Helpers);

  function Helpers() {
    this.init = __bind(this.init, this);
    Helpers.__super__.constructor.apply(this, arguments);
  }

  Helpers.prototype.init = function() {
    return _.extend(dust.helpers, this);
  };

  return Helpers;

})();
views.examples.Form = (function() {

  __extends(Form, swell.Form);

  function Form() {
    Form.__super__.constructor.apply(this, arguments);
  }

  return Form;

})();
views.reports.ReportsChart = (function() {

  __extends(ReportsChart, Backbone.View);

  function ReportsChart() {
    this.reservation_fees = __bind(this.reservation_fees, this);
    this.render = __bind(this.render, this);
    this.initialize = __bind(this.initialize, this);
    ReportsChart.__super__.constructor.apply(this, arguments);
  }

  ReportsChart.prototype.el = '.main';

  ReportsChart.prototype.initialize = function(router) {
    this.router = router;
  };

  ReportsChart.prototype.render = function(name) {
    var _this = this;
    return dust.render('reports.chart', {
      name: name
    }, function(err, html) {
      _this.$el.html(html);
      if (name === 'reservation_fees') return _this.reservation_fees(name);
    });
  };

  ReportsChart.prototype.reservation_fees = function(which) {
    var context;
    var _this = this;
    context = document.getElementById('chart').getContext("2d");
    return helpers.ajax('/statements/annual/', function(err, data) {
      var chart, colors, draw, index, month, months, push, set, year, years, _i, _j, _k, _l, _len, _len2, _len3, _len4, _m, _ref, _ref2;
      draw = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: []
      };
      years = {};
      colors = ['red', 'blue', 'green', 'orange'];
      _ref = data.billed;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        month = _ref[_i];
        month.color = colors[_i];
        if (!years[month.year]) years[month.year] = [];
        years[month.year].push(month);
      }
      index = 0;
      for (year in years) {
        months = years[year];
        set = {
          label: year + ' Res Fees',
          strokeColor: colors[index],
          fillColor: colors[index],
          data: []
        };
        for (_j = 0, _len2 = months.length; _j < _len2; _j++) {
          month = months[_j];
          set.data.push(month.res_fees);
        }
        draw.datasets.push(set);
        index++;
      }
      years = {};
      colors = ['green', 'orange', 'purple', 'pink', 'black'];
      _ref2 = data.projected;
      for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
        month = _ref2[_k];
        month.color = colors[_i];
        if (!years[month.year]) years[month.year] = [];
        years[month.year].push(month);
      }
      index = 0;
      for (year in years) {
        months = years[year];
        set = {
          label: year + ' Projected',
          strokeColor: colors[index],
          fillColor: colors[index],
          data: []
        };
        for (_m = 1; _m < 13; _m++) {
          push = 0;
          for (_l = 0, _len4 = months.length; _l < _len4; _l++) {
            month = months[_l];
            if ((month.month + 1) === _m) push = month.res_fees;
          }
          set.data.push(push);
        }
        draw.datasets.push(set);
        index++;
      }
      return chart = new Chart(context).Bar(draw, false);
    });
  };

  return ReportsChart;

})();

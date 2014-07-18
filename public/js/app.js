// last compiled: 2014-07-17 20:07:16

var swell = {};
var models = {};
var collections = {};
var routers = {};
var views = {};
    views.forms = {};
    views.lists = {};
    views.reports = {};

__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

swell.Collection = (function() {

  __extends(Collection, Backbone.Collection);

  function Collection() {
    Collection.__super__.constructor.apply(this, arguments);
  }

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
    this.test_dust_helper = __bind(this.test_dust_helper, this);
    var _this = this;
    _.extend(dust.helpers, this);
    this.response_callback = {
      success: function(data) {
        console.info('Helpers.ajax returned: ', data);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('Helpers.ajax error: ' + error.responseText);
        return _this.callback(error.responseText);
      }
    };
  }

  Helpers.prototype.test_dust_helper = function(chunk, ctx, bodies, params) {
    return chunk.write('my custom helper works!');
  };

  Helpers.prototype.ajax = function(url, callback, options, method) {
    this.callback = callback;
    if (method == null) method = 'POST';
    options = _.extend(this.response_callback, options);
    options.url = url;
    options.type = method;
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
    List.__super__.constructor.apply(this, arguments);
  }

  List.prototype._events = {
    'click tr td,.edit': 'edit',
    'click th.sortable': 'sort',
    'click .delete': 'delete',
    'click .create': 'create',
    'click .view': 'read'
  };

  List.prototype.initialize = function(options) {
    this.events = _.extend({}, this._events, this.events);
    return this;
  };

  List.prototype.render = function(template, data, headings) {
    if (template) this.template = template;
    if (headings) this.headings = headings;
    if (data) this.data = data;
    this.before();
    if (!this.data) {
      this.data = {
        items: this.collection.models
      };
    }
    this.data.headings = this.headings;
    if (this.template) {
      $(this.el).html(tmpl[this.template](this.data));
    } else if (console && console.log) {
      console.log('WARNING Flint.Grid: @template is undefined, unable to render view.');
    }
    this.trigger('rendered', this);
    this.after();
    return this;
  };

  List.prototype.before = function() {};

  List.prototype.after = function() {};

  List.prototype.create = function() {
    return this.trigger('create');
  };

  List.prototype.read = function(e) {
    var id, target;
    target = $(e.target);
    id = target.attr('id');
    while (_.isUndefined(id)) {
      target = target.parent();
      id = target.attr('id');
    }
    return this.trigger('read', id);
  };

  List.prototype.edit = function(e) {
    var id, target;
    target = $(e.target);
    id = target.attr('id');
    while (_.isUndefined(id)) {
      target = target.parent();
      id = target.attr('id');
    }
    return this.trigger('edit', id);
  };

  List.prototype["delete"] = function(e) {
    var id, model, target;
    e.stopPropagation();
    target = $(e.target);
    id = target.attr('id');
    while (_.isUndefined(id)) {
      target = target.parent();
      id = target.attr('id');
    }
    model = this.collection.get(id);
    this.collection.remove(model);
    return false;
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
    this.call = __bind(this.call, this);
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
        console.info('Model.sync returned: ', _this.attributes);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('Model.sync error: ' + error.responseText);
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
    return this.fetch(options);
  };

  Model.prototype.push = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    return this.save(null, options);
  };

  Model.prototype["delete"] = function(callback, options) {
    this.callback = callback;
    options = _.extend(this.response_callback, options);
    return this.destroy(options);
  };

  Model.prototype.call = function(url, callback, options, method) {
    this.callback = callback;
    if (method == null) method = 'POST';
    options = _.extend(this.response_callback, options);
    options.url = url;
    options.type = method;
    options.data = JSON.stringify(this.attributes);
    return $.ajax(options);
  };

  return Model;

})();
swell.Router = (function() {

  __extends(Router, Backbone.Router);

  function Router() {
    this.bind = __bind(this.bind, this);
    this.unbind = __bind(this.unbind, this);
    this.delegate = __bind(this.delegate, this);
    this.init = __bind(this.init, this);
    this.initialize = __bind(this.initialize, this);
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.initialize = function(app) {
    this.app = app;
    this.app.register(this);
    this.init.apply(this, arguments);
    this.on('all', this.delegate);
    return this;
  };

  Router.prototype.init = function() {};

  Router.prototype.delegate = function(route) {
    this.app.undelegate(route);
    return this.bind(route);
  };

  Router.prototype.unbind = function(route) {
    var obj, prop, _results;
    console.log('[swell] unbinding: ' + route + ' ' + moment().format('YYYY-MM-DD HH:mm:ss'));
    _results = [];
    for (prop in this) {
      obj = this[prop];
      if (obj.undelegateEvents) {
        _results.push(obj.undelegateEvents());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Router.prototype.bind = function(route) {
    var obj, prop, _results;
    console.log('[swell] binding: ' + route + ' ' + moment().format('YYYY-MM-DD HH:mm:ss'));
    _results = [];
    for (prop in this) {
      obj = this[prop];
      if (obj.delegateEvents) {
        _results.push(obj.delegateEvents());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Router;

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

  Examples.prototype.resource = 'mysql';

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
routers.Application = (function() {

  __extends(Application, Backbone.Router);

  function Application() {
    this.undelegate = __bind(this.undelegate, this);
    this.register = __bind(this.register, this);
    this.main = __bind(this.main, this);
    Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.initialize = function() {
    window.helpers = this.helpers = new views.Helpers;
    this.user = new models.User;
    this.reports = new routers.Reports(this);
    this.examples = new routers.Examples(this);
    Backbone.history.start();
    console.log('[swell] app instantiated as window.app ' + moment().format('YYYY-MM-DD HH:mm:ss'));
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
      _results.push(router.unbind(route));
    }
    return _results;
  };

  return Application;

})();
routers.Examples = (function() {

  __extends(Examples, swell.Router);

  function Examples() {
    this.test = __bind(this.test, this);
    Examples.__super__.constructor.apply(this, arguments);
  }

  Examples.prototype.routes = {
    'test': 'test'
  };

  Examples.prototype.collection = new collections.Examples;

  Examples.prototype.test = function() {
    var _this = this;
    return this.collection.fetch({
      success: function(data) {
        return console.log(data);
      },
      error: function(nope) {
        return console.log(error);
      }
    });
  };

  return Examples;

})();
routers.Reports = (function() {

  __extends(Reports, swell.Router);

  function Reports() {
    this.reports = __bind(this.reports, this);
    this.init = __bind(this.init, this);
    Reports.__super__.constructor.apply(this, arguments);
  }

  Reports.prototype.routes = {
    'reports': 'reports',
    'reports/:which': 'reports'
  };

  Reports.prototype.collection = new collections.Examples;

  Reports.prototype.init = function() {
    return this.view = new views.reports.ReportsChart(this);
  };

  Reports.prototype.reports = function(which) {
    if (which == null) which = 'reservation_fees';
    return this.view.render(which);
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
    var _this = this;
    _.extend(dust.helpers, this);
    return this.response_callback = {
      success: function(data) {
        console.info('Helpers.ajax returned: ', data);
        return _this.callback(null, data);
      },
      error: function(error) {
        console.error('Helpers.ajax error: ' + error.responseText);
        return _this.callback(error.responseText);
      }
    };
  };

  return Helpers;

})();
views.forms.ExampleForm = (function() {

  __extends(ExampleForm, swell.Form);

  function ExampleForm() {
    ExampleForm.__super__.constructor.apply(this, arguments);
  }

  return ExampleForm;

})();
views.forms.Login = (function() {

  __extends(Login, swell.Form);

  function Login() {
    Login.__super__.constructor.apply(this, arguments);
  }

  return Login;

})();
views.lists.ExampleList = (function() {

  __extends(ExampleList, swell.List);

  function ExampleList() {
    ExampleList.__super__.constructor.apply(this, arguments);
  }

  return ExampleList;

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

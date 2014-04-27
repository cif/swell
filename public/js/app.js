// last compiled: 2014-04-26 21:04:91

var swell = {};
var models = {};
var collections = {};
var routers = {};

__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
__hasProp = {}.hasOwnProperty,
__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

swell.Collection = (function() {

  __extends(Collection, Backbone.Collection);

  function Collection() {
    Collection.__super__.constructor.apply(this, arguments);
  }

  Collection.prototype.comparator = function(model) {
    return +model.get('sort_order');
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
swell.Grid = (function() {

  __extends(Grid, Backbone.View);

  function Grid() {
    this.quicksort = __bind(this.quicksort, this);
    this.swap = __bind(this.swap, this);
    this.compare = __bind(this.compare, this);
    this.partition = __bind(this.partition, this);
    this.sort = __bind(this.sort, this);
    Grid.__super__.constructor.apply(this, arguments);
  }

  Grid.prototype._events = {
    'click tr td,.edit': 'edit',
    'click th.sortable': 'sort',
    'click .delete': 'delete',
    'click .create': 'create',
    'click .view': 'read'
  };

  Grid.prototype.initialize = function(options) {
    this.events = _.extend({}, this._events, this.events);
    return this;
  };

  Grid.prototype.render = function(template, data, headings) {
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

  Grid.prototype.before = function() {};

  Grid.prototype.after = function() {};

  Grid.prototype.create = function() {
    return this.trigger('create');
  };

  Grid.prototype.read = function(e) {
    var id, target;
    target = $(e.target);
    id = target.attr('id');
    while (_.isUndefined(id)) {
      target = target.parent();
      id = target.attr('id');
    }
    return this.trigger('read', id);
  };

  Grid.prototype.edit = function(e) {
    var id, target;
    target = $(e.target);
    id = target.attr('id');
    while (_.isUndefined(id)) {
      target = target.parent();
      id = target.attr('id');
    }
    return this.trigger('edit', id);
  };

  Grid.prototype["delete"] = function(e) {
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

  Grid.prototype.sort = function(e) {
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

  Grid.prototype.partition = function(items, begin, end, pivot) {
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

  Grid.prototype.compare = function(a, b, type) {
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

  Grid.prototype.swap = function(array, a, b) {
    var tmp;
    tmp = array[a];
    array[a] = array[b];
    array[b] = tmp;
    return array;
  };

  Grid.prototype.quicksort = function(items, begin, end) {
    var pivot;
    if ((end - 1) > begin) {
      pivot = begin + Math.floor(Math.random() * (end - begin));
      pivot = this.partition(items, begin, end, pivot);
      this.quicksort(items, begin, pivot);
      return this.quicksort(items, pivot + 1, end);
    }
  };

  return Grid;

})();
swell.Model = (function() {

  __extends(Model, Backbone.Model);

  function Model() {
    this.validate_fields = __bind(this.validate_fields, this);
    this.validate = __bind(this.validate, this);
    Model.__super__.constructor.apply(this, arguments);
  }

  Model.prototype.validate = function(attrs) {
    if (this.fields) return this.validate_fields(attrs);
  };

  Model.prototype.validate_fields = function(attrs) {};

  return Model;

})();
swell.Router = (function() {

  __extends(Router, Backbone.Router);

  function Router() {
    this.undelegate = __bind(this.undelegate, this);
    this.delegate = __bind(this.delegate, this);
    this.initialize = __bind(this.initialize, this);
    Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.initialize = function(app) {
    app.register(this);
    this.init.apply(this, arguments);
    return this;
  };

  Router.prototype.delegate = function() {
    this.undelegate();
    this.bind();
    this.form.delegateEvents();
    this.list.delegateEvents();
    return this.app.controller = this;
  };

  Router.prototype.undelegate = function() {
    this.unbind();
    this.form.undelegateEvents();
    return this.list.undelegateEvents();
  };

  return Router;

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
      length: 7
    },
    sort_order: {
      type: 'number',
      length: 7
    }
  };

  return Example;

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

  Examples.prototype.list = ['_id', 'name'];

  return Examples;

})();
routers.Application = (function() {

  __extends(Application, Backbone.Router);

  function Application() {
    Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.initialize = function() {};

  return Application;

})();

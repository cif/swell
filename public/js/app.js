// last compiled: 2014-04-22 21:04:88
// exports is only used by the compiled node service.
// please excuse the implicit declaration used (for now).
swell = {};
dashboard = {};
dashboard.test = {};

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
swell.Controller = (function() {

  __extends(Controller, Backbone.Router);

  function Controller() {
    this.undelegate = __bind(this.undelegate, this);
    this.delegate = __bind(this.delegate, this);
    this.undo_sort_order = __bind(this.undo_sort_order, this);
    this.sorted = __bind(this.sorted, this);
    this.error = __bind(this.error, this);
    this.update = __bind(this.update, this);
    this.destroy = __bind(this.destroy, this);
    this.undo_delete = __bind(this.undo_delete, this);
    this.deleted = __bind(this.deleted, this);
    this.saved = __bind(this.saved, this);
    this.changed = __bind(this.changed, this);
    this.edit = __bind(this.edit, this);
    this.added = __bind(this.added, this);
    this.create = __bind(this.create, this);
    this.fresh = __bind(this.fresh, this);
    this.grab = __bind(this.grab, this);
    this.__get = __bind(this.__get, this);
    this.get = __bind(this.get, this);
    this.refresh = __bind(this.refresh, this);
    this.fetch = __bind(this.fetch, this);
    this._unbind = __bind(this._unbind, this);
    this.unbind = __bind(this.unbind, this);
    this._bind = __bind(this._bind, this);
    this.bind = __bind(this.bind, this);
    this.init = __bind(this.init, this);
    this.initialize = __bind(this.initialize, this);
    Controller.__super__.constructor.apply(this, arguments);
  }

  Controller.prototype.template_create = false;

  Controller.prototype.template_edit = false;

  Controller.prototype.template_view = false;

  Controller.prototype.template_list = false;

  Controller.prototype.collection = false;

  Controller.prototype.model = false;

  Controller.prototype.list = 'List';

  Controller.prototype.sortable = false;

  Controller.prototype.sorted_url = false;

  Controller.prototype.sort_handle = false;

  Controller.prototype.form = 'Form';

  Controller.prototype.valid_changes = true;

  Controller.prototype._messages = {
    created: '{{name}} has been created.',
    saved: 'Changes to {{name}} have been saved.',
    delete_warn: 'You are about to delete {{name}}, proceed?',
    navigate_warn: 'Did you want to save the changes you just made?',
    sorted: 'You have changed the sort order.'
  };

  Controller.prototype.initialize = function(app) {
    var form, list;
    var _this = this;
    if (!this.messages) this.messages = {};
    _.map(this._messages, function(val, key) {
      if (_.isUndefined(_this.messages[key])) return _this.messages[key] = val;
    });
    list = views[this.list] ? views[this.list] : Flint[this.list];
    if (!list) throw new Error('List class "' + this.list + '" does not exists');
    this.list = new list({}, this.sortable);
    if (this.list_el) this.list.el = this.list_el;
    this.list.sort_handle = this.sort_handle;
    this.list.template = this.template_list;
    if (this.template_help) this.list.template_help = this.template_help;
    this.list.collection = this.collection ? new collections[this.collection] : new Backbone.Collection;
    this.list.collection.model = this.model ? models[this.model] : Backbone.Model;
    form = views[this.form] ? views[this.form] : Flint[this.form];
    if (!form) throw new Error('Form class "' + this.form + '" does not exists');
    this.form = new form({
      el: this.form_el
    });
    this.form.model = new this.list.collection.model;
    this.form.collection = this.list.collection;
    this.form.valid_changes = this.valid_changes;
    this.list.undelegateEvents();
    this.form.undelegateEvents();
    app.register(this);
    this.app = app;
    this.init.apply(this, arguments);
    return this;
  };

  Controller.prototype.init = function() {};

  Controller.prototype.bind = function() {};

  Controller.prototype._bind = function() {
    var _this = this;
    this.bind();
    this.list.on('create', this.create);
    this.list.on('edit', this.edit);
    this.list.on('sort', this.sorted);
    this.list.collection.on('add', this.added);
    this.list.collection.on('remove', this.deleted);
    this.list.collection.on('change', this.changed);
    this.list.collection.on('error', this.error);
    this.form.on('delete', this.deleted);
    this.form.on('saved', this.saved);
    this.form.on('canceled', function() {
      return _this.modelChanged = false;
    });
    this.form.model.on('error', this.error);
    return this.on('saved deleted sorted destroyed delete_undone sort_undone destroy_error', this.update);
  };

  Controller.prototype.unbind = function() {};

  Controller.prototype._unbind = function() {
    this.unbind();
    this.list.off('create edit sort');
    this.list.collection.off('add remove change error');
    this.form.off('delete saved canceled');
    this.form.model.off('error');
    return this.off('saved deleted sorted destroyed delete_undone sort_undone destroy_error');
  };

  Controller.prototype.fetch = function(callback, refresh) {
    var _this = this;
    if (refresh == null) refresh = false;
    if (this.list.collection.length > 0 && !refresh) {
      return callback(this.list.collection);
    } else {
      return this.list.collection.fetch({
        silent: true,
        success: function() {
          if (_this.list.collection.length === 0) return callback(false);
          return callback(_this.list.collection);
        },
        error: function(obj, error) {
          return _this.error(obj, error);
        }
      });
    }
  };

  Controller.prototype.refresh = function(callback) {
    return this.fetch(callback, true);
  };

  Controller.prototype.get = function(id, callback, refresh) {
    var _this = this;
    if (refresh == null) refresh = false;
    if (this.list.collection.length === 0) {
      return this.fetch(function() {
        return callback(_this.grab(id), refresh);
      });
    } else {
      return callback(this.grab(id));
    }
  };

  Controller.prototype.__get = function(id, callback, options) {
    var model;
    var _this = this;
    model = this.list.collection.get(id);
    if (!model) {
      if (callback) return callback(false);
    } else {
      model.id = id;
      return model.fetch({
        silent: true,
        success: function(result) {
          if (callback) return callback(model);
        },
        error: function(obj, error) {
          return _this.error(obj, error);
        }
      });
    }
  };

  Controller.prototype.grab = function(id) {
    var item;
    item = this.list.collection.get(id);
    return item;
  };

  Controller.prototype.fresh = function(id, callback) {
    var model;
    var _this = this;
    model = this.grab(id);
    if (!model) {
      callback(false);
      return;
    }
    return model.fetch({
      silent: true,
      success: function(result) {
        if (callback) return callback(model);
      },
      error: function(obj, error) {
        return _this.error(obj, error);
      }
    });
  };

  Controller.prototype.create = function() {
    this.form.model = new this.list.collection.model({
      sort_order: this.list.collection.length
    });
    this.form.render(this.template_create, {}, this.form.model);
    return this.trigger('create', this);
  };

  Controller.prototype.added = function(model) {
    var _this = this;
    this.trigger('added', model);
    if (!!this.app.notifications) this.app.notifications.notify('Saving...');
    return model.save(model, {
      success: function() {
        var message, _tmpl;
        _tmpl = tmpl_compile(_this.messages.created);
        message = _tmpl(model.attributes);
        if (!(!_this.app.notifications || !_this.messages.created)) {
          _this.app.notifications.notify(message);
        }
        _this.edit(model.id);
        return _this.trigger('returned', model);
      },
      error: function(obj, error) {
        return _this.error(obj, error);
      }
    });
  };

  Controller.prototype.edit = function(id) {
    var model;
    model = this.list.collection.get(id);
    return this.form.render(this.template_edit, {}, model);
  };

  Controller.prototype.changed = function(model) {
    if (!!this.app.sync) this.app.sync.changed(model);
    return this.trigger('changed', model);
  };

  Controller.prototype.saved = function(model) {
    var _this = this;
    this.trigger('saved', model);
    if (!!this.app.notifications) this.app.notifications.notify('Saving...');
    return model.save(null, {
      success: function() {
        var message, _tmpl;
        _tmpl = tmpl_compile(_this.messages.saved);
        message = _tmpl(model.attributes);
        if (!(!_this.app.notifications || !_this.messages.saved)) {
          _this.app.notifications.notify(message);
        }
        return _this.trigger('returned', model);
      }
    });
  };

  Controller.prototype.deleted = function(model, collection, options) {
    var Deletable, message, _tmpl;
    this.trigger('deleted', model);
    if (this.to_delete) this.destroy();
    Deletable = Backbone.Model.extend({
      url: this.list.collection.url
    });
    this.to_delete = new Deletable(model.attributes);
    if (this.app.notifications) {
      _tmpl = tmpl_compile(this.messages.delete_warn);
      message = _tmpl(model.attributes);
      return this.app.notifications.notify(message, this.undo_delete, this.destroy);
    } else {
      return this.destroy();
    }
  };

  Controller.prototype.undo_delete = function() {
    this.list.collection.add(new this.list.collection.model(this.to_delete.attributes), {
      silent: true
    });
    this.to_delete = null;
    return this.trigger('delete_undone', this.to_delete);
  };

  Controller.prototype.destroy = function() {
    var _this = this;
    return this.to_delete.destroy({
      success: function(data, response) {
        if (response && response.error) {
          if (!!_this.app.notifications) {
            _this.app.notifications.error(response.error);
          }
          _this.list.collection.add(_this.to_delete, {
            silent: true
          });
          _this.trigger('destroyed', _this.to_delete);
          return _this.update();
        } else {
          return _this.trigger('destroy_error', _this.to_delete);
        }
      }
    });
  };

  Controller.prototype.update = function() {
    return this.list.render();
  };

  Controller.prototype.error = function(object, error) {
    if (console && console.log) {
      console.log('NOTICE: error triggered on Flint.Controller: ' + error);
    }
    if (!_.isString(error)) error = error.responseText;
    if (!!this.app.notifications) return this.app.notifications.error(error);
  };

  Controller.prototype.sorted = function(serialized) {
    var _this = this;
    this.trigger('sorted');
    return this.app.notifications.notify(this.messages.sorted, this.undo_sort_order, function() {
      return _this.app.sync.ajax(_this.sorted_url, {
        type: 'POST',
        data: {
          json: JSON.stringify(serialized)
        }
      });
    });
  };

  Controller.prototype.undo_sort_order = function() {
    _.each(this.list.collection.models, function(model) {
      return model.set('sort_order', model.get('order_before_sort'), {
        silent: true
      });
    });
    this.list.collection.sort();
    return this.trigger('sort_undone');
  };

  Controller.prototype.delegate = function() {
    this.undelegate();
    this._bind();
    this.form.delegateEvents();
    this.list.delegateEvents();
    return this.app.controller = this;
  };

  Controller.prototype.undelegate = function() {
    this._unbind();
    this.form.undelegateEvents();
    return this.list.undelegateEvents();
  };

  return Controller;

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
Application = (function() {

  function Application() {}

  return Application;

})();
dashboard.Dashboard = (function() {

  __extends(Dashboard, swell.Application);

  function Dashboard() {
    Dashboard.__super__.constructor.apply(this, arguments);
  }

  Dashboard.prototype.radness = 'badness';

  return Dashboard;

})();
dashboard.test.Something = (function() {

  __extends(Something, swell.Form);

  function Something() {
    Something.__super__.constructor.apply(this, arguments);
  }

  return Something;

})();
exports.swell = swell;
exports.dashboard = dashboard;
exports.dashboard.test = dashboard.test;
# swell.List
# provides some baseline functionality for lists and grids
# 2014-07-21
# github.com/cif/swell
# email@benipsen.com

class List extends Backbone.View
  
  # nodes stores references to the dom elements
  # see client side templating in docs
  nodes: {}
    
  events: {}
  # these are common UI events that come with the standard list
  # to make use of them ensure class names are in your template
  __events:
    'click tr,li' : 'clicked'
    'click th.sortable' : 'sort'
  
  # initialize extends the any events found 
  # in the subclass so that they are delegated
  # it also is used to establish the element,
  # so that often it doesn't need to be sub'classed'
  # further, it will setup ui events from properties
  initialize: (options) ->
    _.extend(@, options)    # extend options and events
    @events = _.extend({}, @__events, @events)
    @init.apply(@, arguments)
    @el_str = @el  # not sure why, but view.setElement makes @el a node ref rather than string ?
    this
  
  # these are generally implemented by sub objects    
  init: (options) ->
  
  # these are often bound to events and also implemented on sub objects   
  update: (model) -> console.log @nodes
  add: (model) ->
  remove: (model) ->
        
  # render method takes the template, context 
  # and an optional callback, uses the helper
  render: (template, context, callback) =>
    # extend the context by properties of this object
    _.extend(context, @)
    @setElement(@el_str)
    helpers.render @el_str, template, @nodes, context
    $(@el_str + ' ol').sortable update:@sorted if @sortable  # make sortable if true
      
  # this will bubble up the target parents to tr or the li
  # so it's important that those contain the id of the object
  clicked: (e) ->
    while !(e.target.tagName is 'TR' or e.target.tagName is 'LI') 
      e.target = e.target.parentNode
    id = $(e.target).attr 'id'
    throw new Error '[swell] ' + moment().format('HH:mm:ss') + ' Swell.List clicked() error: id attribute is not defined on the li or tr tag!' if !id
    @trigger 'clicked', id, e
      
  
  # sort handler, loops over elements in the list and builds 
  # small update id:sort pairs for ajax update sends event
  sorted: (e) =>
    ordered = {}
    $(@el_str + ' ol li').each (index) ->
      id = $(this).attr 'id'
      throw new Error '[swell] ' + moment().format('HH:mm:ss') + ' Swell.List sorted() error: id attribute is not defined on the li tag!' if !id
      ordered[id] = index
      
    @trigger 'sorted', ordered, e
  
  
  # grid view sorting by sortable columns th.sortable
  # sorting is done via quicksort method
  sort: (e) =>
    
    # get the table we are sorting
    table_root = e.target
    while table_root.tagName != 'TABLE'
      table_root = table_root.parentNode
      
    # determine the direction and column to sort on   
    index = $('tr th').index(e.target)
    heading = e.target
    if !@sorting_dir 
      @sorting_dir = 1

    if heading is @heading
      @sorting_dir *= -1

    # determine the data type to sort by (if applicable)
    @sort_data_type = 'string'
    @sort_data_type = 'number' if $(e.target).hasClass('number') or $(e.target).hasClass('currency')
    @sort_data_type = 'date' if $(e.target).attr('class').indexOf('date') >= 0
    
    # update the heading itself
    @heading = e.target
    $('tr th').removeClass 'sorted-up sorted-down'
    $('tr th span').remove()
    arrow = if @sorting_dir is -1 then '<span>&uarr;&nbsp;</span>' else '<span>&darr;&nbsp;</span>'
    clas = if @sorting_dir is -1 then 'sorted-up' else 'sorted-down'
    $(e.target).addClass clas
    $(e.target).html arrow + $(e.target).html()
    
    @sort_index = index
    
    # read all the table rows into an array
    trs = table_root.getElementsByTagName('tr')
    items = []
    tr = 1
    while tr < trs.length
      items.push trs[tr]
      tr++
    
    # quicksort rows based on @sort_index
    for tr in items
      $(tr).remove()
    @quicksort(items, 0, items.length)
    for tr in items
      $(table_root).append(tr)
    
    @trigger 'sorted:grid', @heading, @sorting_dir
    
  quicksort: (items, begin, end) =>
    if (end-1) > begin
      pivot = begin + Math.floor(Math.random()*(end-begin))
      pivot = @partition(items, begin, end, pivot)
      @quicksort(items, begin, pivot)
      @quicksort(items, pivot+1, end)
        
  partition: (items, begin, end, pivot) =>
    pivot_val = items[pivot]
    @swap(items, pivot, end-1)
    store = begin
    for i in [begin...(end-1)]
      if @compare(items[i],pivot_val)
        @swap(items, store, i)
        store++
    @swap(items, end-1, store)
    store      
          
  compare: (a, b, type = false) =>
      
    a = $(a.getElementsByTagName('td')[@sort_index]).html()
    b = $(b.getElementsByTagName('td')[@sort_index]).html()
    
    if @sort_data_type
      if @sort_data_type is 'date'
        
        if a.indexOf('-') > 0
          a = a.substring(0, a.indexOf(' -'))
        if b.indexOf('-') > 0
          b = b.substring(0, b.indexOf(' -'))  
        
        a = moment(a)
        b = moment(b)
        if isNaN(a.toDate().getTime())
          a = moment(0)
        if isNaN(b.toDate().getTime())
          b = moment(0)
          
      if @sort_data_type is 'number'
        a = parseFloat a.replace(/[A-Za-z$,]/g, '')
        b = parseFloat b.replace(/[A-Za-z$,]/g, '')
        if isNaN(a)
          a = 0
        if isNaN(b)
          b = 0
        
    if @sorting_dir is 1
      return a < b 
    else
        return a > b
  
  swap: (array, a, b) =>
    tmp = array[a]
    array[a] = array[b]
    array[b] = tmp
    return array
  
 
    
  
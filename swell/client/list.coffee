# swell.List
# provides some baseline functionality for lists and grids
# 2014-07-21
# github.com/cif/swell
# email@benipsen.com

class List extends Backbone.View
  
  events: {}
  
  # these are common UI events that come with the standard list
  # obviously, you should ensure class names are in your template
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
    this
    
  init: (options) ->
    
  # render method takes the template, context 
  # and an optional callback, uses the helper
  render: (template, context, callback) =>
    # extend the context by properties of this object
    _.extend(context, @)
    helpers.render @el, template, context, (err, res) =>
      callback(err, res) if callback
      $(@el + ' ol').sortable update:@sorted if @sortable  # make sortable if true
  
      
  # it will bubble up the target parents to tr or the li
  # so it's important that those contain the id of the object
  clicked: (e) ->
    while !(e.target.tagName is 'TR' or e.target.tagName is 'LI') 
      e.target = e.target.parentNode
    id = $(e.target).attr 'id'
    @trigger 'clicked', id
      
  
  # sort handler, loops over elements in the list and builds 
  # small update id:sort pairs for ajax update sends event
  sorted: (e) =>
    ordered = {}
    $(@el + ' ol li').each (index) ->
      id = $(this).attr 'id'
      ordered[id] = index
    @trigger 'sorted', ordered
  
  
  # grid view sorting by sortable columns - .sortable  
  # sorting is done via simple quicksort impl
  sort: (e) =>
    
    # get the table we are sorting
    table_root = e.target
    while table_root.tagName != 'TABLE'
      table_root = table_root.parentNode
      
    # determine the direction and column to sort on   
    index = $('tr th').index(e.target)
    heading = e.target
    @sort_data_type = $(e.target).attr('data-type')
    if !@sorting_dir 
      @sorting_dir = 1

    if heading is @heading
      @sorting_dir *= -1

    @heading = e.target
    $('tr th').css 'font-weight','300'
    $('tr th span').remove()
    arrow = if @sorting_dir is -1 then '<span>&uarr;&nbsp;</span>' else '<span>&darr;&nbsp;</span>'
    $(e.target).css 'font-weight','bold'
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
  
  quicksort: (items, begin, end) =>
    if (end-1) > begin
      pivot = begin + Math.floor(Math.random()*(end-begin))
      pivot = @partition(items, begin, end, pivot)
      @quicksort(items, begin, pivot)
      @quicksort(items, pivot+1, end)
    
  
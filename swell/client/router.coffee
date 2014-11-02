#  swell.Router contains high level methods which
#  allow easy switching between application parts
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com


class Router extends Backbone.Router
  
  
  # initialize simply sets the application as a property
  # implement init when subclases
  initialize: (@app) =>
    
    # if a collection has been specified as a string, initialize it
    if @collection
      @collection = helpers.string_to_prop @collection
      @collection = new @collection()
      
    # delegate undelegates the rest of the routers registered
    # then calls bind to delegate views of this instance
    # if a title is specified, it updates the document title
    @on 'all', (route) =>
      return if route is 'route'
      @app.undelegate(route)
      @delegate(route)
      $('title').text @title if @title
    
    @app.register(@)
    @init.apply(@, arguments)
    this
  
  # function can be used to carry out any additional
  # initialization required on controller classes
  init: =>
  
  # bind and unbind are called from delegate and undelegate
  # these can be overridden in your routers for control over
  # event binding via on() and off()
  bind: (route) =>
  unbind: (route) =>  
  
  # bind and unbind are used to manage event delegation
  # default behavior it to check all props for instances 
  # of Backbone.View and delegate / undelegate events
  undelegate: (route) =>
    console.info '[swell] ' + moment().format('HH:mm:ss') + ' unbinding ' + route
    for prop, obj of @
      obj.undelegateEvents() if obj.undelegateEvents
    @unbind(route)  
  
  delegate: (route) =>
    console.info '[swell] ' + moment().format('HH:mm:ss') + ' binding ' + route
    for prop, obj of @
      obj.delegateEvents() if obj.delegateEvents
    @bind(route)  
      
#  swell.Router contains high level methods which
#  allow easy switching between application parts
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com


class Router extends Backbone.Router
  
  
  # initialize simply sets the application as a property
  # implement init when subclases
  initialize: (@app) =>
    @app.register(@)
    @init.apply(@, arguments)
    @on 'all', @delegate
    this
  
  # function can be used to carry out any additional
  # initialization required on controller classes
  init: =>
  
  delegate: (route) =>
    @app.undelegate(route)
    @bind(route)
      
  # bind and unbind are used to manage event delegation
  # default behavior it to check all props for instances 
  # of Backbone.View and delegate / undelegate events
  unbind: (route) =>
    console.log '[swell] unbinding: ' + route + ' ' + moment().format('YYYY-MM-DD HH:mm:ss')
    for prop, obj of @
      obj.undelegateEvents() if obj.undelegateEvents
  
  bind: (route) =>
    console.log '[swell] binding: ' + route + ' ' + moment().format('YYYY-MM-DD HH:mm:ss')
    for prop, obj of @
      obj.delegateEvents() if obj.delegateEvents
  
      
#  swell.Router contains high level methods which
#  allow easy switching between application parts
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com


class Router extends Backbone.Router
  
  
  # initialize simply sets the application as a property
  # implement init when subclases
  initialize: (app) =>
    app.register(@)
    @init.apply(@, arguments)
    this
  
  # delegate() and undelegate() bind / unbind the events to free up memory for 
  # the other parts of your application 
  delegate: =>
    @undelegate()
    @bind()
    @form.delegateEvents()
    @list.delegateEvents()
    
    # this reference makes the primary app instance aware that its here
    # the controller is currently locked and loaded.
    @app.controller = @
    
  undelegate: =>
    @unbind()
    @form.undelegateEvents()
    @list.undelegateEvents()
      
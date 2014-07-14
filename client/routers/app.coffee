
class Application extends Backbone.Router
  
  
  # setting a default route avoids a Backbone.history.start() error,
  # if you have other routers with routes exposed keep this commented out
  
  #routes:  
  #  '' : 'main' 
  
  initialize: -> 
    
    # initialize helpers and high level objects
    @helpers = new views.Helpers
    # @user = new models.User 
    
    # initialize any app routers here
    @reports = new routers.Reports @
    @examples = new routers.Examples @
    
    # start the party
    Backbone.history.start()
    
    # return the app instance
    console.log '[swell] app instantiated as window.app ' + moment().format('YYYY-MM-DD HH:mm:ss')
    return @
    
  
  main: =>
    # @user.call '/users/authenticate', (err, data) =>
      # etc..
  
  
  # allows registration of routers for app wide undelegate call
  # this frees up memory (big time!) in larger, multi-view applications
  # and avoids binding conflicts, see swell.Router in the docs for more info
  routers:[]
  register: (router) =>
    @routers.push router
    
  undelegate: (route) =>
    for router in @routers
      router.unbind(route)
  
  
  
    
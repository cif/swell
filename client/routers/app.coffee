
class Application extends Backbone.Router
  
  
  # setting a default route avoids a Backbone.history.start() error,
  # if you have other routers with routes exposed keep this commented out
  
  #routes:  
  #  '' : 'main' 
  
  initialize: (options) ->   # options is used to pass in configuration 
                             # variables directly to the constructor ("bootstrap")
    
    # initialize helpers and synchro (sync manager class)
    window.helpers = @helpers = new views.Helpers options
    window.synchro = @synchro = new swell.Synchro options
    
    # initialize application routers
    @examples = new routers.Examples @
    @reports  = new routers.Reports @
    
    # start the party
    Backbone.history.start()
    
    # return the app instance
    console.info '[swell] ' + moment().format('HH:mm:ss') + ' app instantiated as window.app '
    return @
    
  
  main: =>
    # @user = new models.User 
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
      router.undelegate(route)
  
  
  
    
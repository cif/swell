
class Application extends Backbone.Router
  
  
  # setting a default route avoids history.start() error,
  # note if you have other routers with routes exposed, 
  # keep this commented out
  #routes:  
  #  '' : 'main' 
  
  initialize: -> 
    
    # initialize helpers and high level objects
    @helpers = new views.Helpers
    @user = new models.User 
    
    
    # initialize any app routers here
    @reports = new routers.Reports @
    
    
    # start the party
    Backbone.history.start()
    console.log '[swell] app initialized. ' + moment().format('YYYY-MM-DD HH:mm:ss')
    
    
    # return the app instance
    return @
    
  
  main: =>
    # @user.call '/users/authenticate', (err, data) =>
      # etc..
  
  
  # allows registration of routers for app wide undelegation
  # required to free up memory (big time!) in larger, multi-view applications
  routers:[]
  register: (router) =>
    @routers.push router
    
  
  
    
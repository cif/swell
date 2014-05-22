
class Application extends Backbone.Router
  
  
  initialize: -> 
    
    # initialize view helpers
    @helpers = new views.Helpers()
    
    # initialize your application's routers here.
    @examples = new routers.Examples @
      
    # start the party
    console.log '[swell] app initialized. ' + moment().format('YYYY-MM-DD HH:mm:ss')
    Backbone.history.start()
    
  
  # allows registration of routers for easy undelegation
  # required to free up memory in multi-view applications
  routers:[]
  register: (router) =>
    @routers.push router

class Application extends Backbone.Router
  
  
  initialize: -> 
    
    # initialize view helpers
    @helpers = new views.Helpers()
    
    # initialize your application's routers here.
    @examples = new routers.Examples @
    
    test = 
      # name: 'Testing 12345'
      color: '#c00'
      
    example = new models.Example test
    example.url = '/examples/'
    example.save()
      
    # start the party
    console.log '[swell] app initialized. ' + moment().format('YYYY-MM-DD HH:mm:ss')
    Backbone.history.start()
    
  
  # allows registration of routers for app wide undelegation
  # this frees up memory (big time) in larger, multi-view applications
  routers:[]
  register: (router) =>
    @routers.push router
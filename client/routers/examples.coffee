
class Examples extends swell.Router
  
  title: 'Swell Client Examples'
  routes:
    'home' : 'home'
    'router' : 'router'
    'list/search/:query' : 'list'
    'list' : 'list'
    'form' : 'form'
    'edit/:id' : 'edit'
  
  init: (@app) =>
    
    # scoping the collection to the window allows 
    # quick access to collections from other 
    # routers / collections / models and YES, you WILL need them.
    window.examples = new collections.Examples
    
    # our list views are just a core object passed a few arguments.
    # for more complex functionality, swell.List can be subclassed.
    @list = new swell.List el: '.simple', sortable: true
    @grid = new swell.List el: '.grid', sortable: false, columns: ['name','color','length','datetime'], fields: new models.Example().fields
    
    
  # bind and unbind allow us to wire
  # collections to our views and release
  # events when they aren't needed
  bind: =>
    
    # bind the our list sorting
    @list.on 'sorted', examples.sorted
    
    # when the collection gets updates re-render the simple list
    # but, call update() on the grid in case it is user sorted
    examples.on 'updated', (res) =>
      @list.render 'examples.list_simple', examples: examples.models
      @grid.update
    
  unbind: =>
    @list.off 'sorted'
    examples.off 'updated'
    
  # home and router are simple renders (no events)
  home: =>
    helpers.render 'section[role=main]', 'examples.home', @app
  
  router: =>
    helpers.render 'section[role=main]', 'examples.router', @app
    
  list: (search) =>
    helpers.render 'section[role=main]','examples.list', @app, =>
      helpers.loader '.simple,.grid'
      examples.grab (err, models) =>
        display = if search then @collection.search(search, 'name') else models
        @list.render 'examples.list_simple', examples: display
        @grid.render 'examples.list_grid', examples: display
   
   
  
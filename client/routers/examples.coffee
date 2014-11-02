
class Examples extends swell.Router
  
  title: 'Swell Client Examples'
  # specifying a collection
  collection: 'collections.Examples'
  routes:
    'home' : 'home'
    'router' : 'router'
    'list' : 'list'
    'list/search/:query' : 'search'
    'form' : 'form'
    'edit/:id' : 'form'
  
  
  
  init: (@app) =>
    
    # scoping the collection to the window allows 
    # quick access to collections from other 
    # routers / collections / models and ... 
    # YES you will want and need them.
    window.examples = @collection
    
    # our list views are examples of simple drag and heading sort functionality.
    @list = new views.examples.List el: '.simple', sortable: true
    @grid = new swell.List el: '.grid', sortable: false, columns: ['name','color','length','price','last_seen'], fields: new models.Example().fields
    
  
  # bind and unbind allow us to wire
  # collections to our views and release
  # events when they aren't needed
  bind: =>
    
    # bind the list sorting event (persists to server)
    @list.on 'sorted', examples.sorted
    
    # bind change to our list update function
    examples.on 'change', @list.update
    
    # sort require re-rendering the list
    examples.on 'sort', (collection) =>
      @list.render dom.examples.list_simple, examples: examples.models
    
    
    # add to remove events require re-rendering
    # examples.on 'add remove', (model) =>
      #@list.render dom.examples.list_simple, examples: collection.models
      
    
      
  unbind: =>
    @list.off 'sorted'
    examples.off 'change add remove sort'
    
  # home and router are simple renders (no events)
  home: =>
    helpers.render 'section[role=main]', dom.examples.home, {}, @app
    
  router: =>
    helpers.render 'section[role=main]', dom.examples.router, @app
    # highlights code examples
    $('pre code').each (i, block) -> hljs.highlightBlock(block)
    
  list: =>
    
    helpers.render 'section[role=main]',dom.examples.list, {}, @app
    # we have to delegate here, because DOM nodes
    # aren't rendered initially in our example
    @delegate()
    
    helpers.loader '.simple,.grid'
    examples.grab (err, models) =>
      @list.render dom.examples.list_simple, examples: models
      # @grid.render 'examples.list_grid', examples: models
      
      # highlights code examples
      $('pre code').each (i, block) -> hljs.highlightBlock(block)
   
  form: (id) =>
    helpers.render 'section[role=main]','examples.form', @app, =>
    
      # we have delegate here, because DOM nodes
      # aren't rendered initially in our example
      @delegate()
    
      
   
  
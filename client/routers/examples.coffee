
class Examples extends swell.Router
  
  
  routes:
    'test' : 'test'
  
  collection: new collections.Examples
    
  test: =>
    @collection.fetch 
      success: (data) =>
        console.log data
      error: (nope) =>
        console.log error

class Reports extends swell.Router
  
  
  routes:
    'reports' : 'reports'
  
  collection: new collections.Examples
    
  reports: (which) =>
    console.log 'why is my router fucked?'
    console.log which
    
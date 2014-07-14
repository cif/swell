
class Reports extends swell.Router
  
  
  routes:
    'reports' : 'reports'
    'reports/:which' : 'reports'
    
  collection: new collections.Examples
  
  init: =>
    @view = new views.reports.ReportsChart @
    
  reports: (which='reservation_fees') =>
    @view.render(which)
    
    
   
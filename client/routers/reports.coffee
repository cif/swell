
class Reports extends swell.Router
  
  
  routes:
    'reports' : 'reports'
    'reports/:which' : 'reports'
    
  
  init: =>
    @view = new views.reports.ReportsChart @
    
  reports: (which='reservation_fees') =>
    console.log 'bind?'
    # @view.render(which)
    
  
  bind: =>
    console.log 'reports binding!'  
   
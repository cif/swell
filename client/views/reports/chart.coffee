
class ReportsChart extends Backbone.View
  
  
  el: '.main'
  
  initialize: (@router) =>
    
  
  render: (name) =>
    console.log 'doing it?'
    dust.render 'reports.chart', name:name, (err, html) =>
      @$el.html html
      if name is 'reservation_fees'
        @reservation_fees(name)
      
    
  reservation_fees: (which) =>
    
    # charts fun
    context = document.getElementById('chart').getContext("2d")
    @router.app.helpers.ajax '/statements/annual/', (err, data) =>
      draw = 
        labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        datasets: []
      
      years = {}
      colors = ['red','blue','green','orange']
      for month in data
        month.color = colors[_i]
        years[month.year] = [] if !years[month.year]
        years[month.year].push month
      
      index = 0
      for year, months of years
        # res fees
        set = 
          label: year + ' Res Fees'
          strokeColor: colors[index]
          fillColor: 'transparent'
          data:[]
          
        for month in months
          set.data.push month.res_fees
        
        draw.datasets.push set     
        index++
        
        # service fees
        #set = 
        #  label: year + ' Service Fees'
        #  strokeColor: colors[index]
        #  fillColor: 'transparent'
        #  data:[]
          
        #for month in months
        #  set.data.push month.serv_fees
        
        #draw.datasets.push set     
        index++
        
        
        
        
      console.log draw  
      chart = new Chart(context).Line(draw, false)
    
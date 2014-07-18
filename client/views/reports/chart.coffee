
class ReportsChart extends Backbone.View
  
  
  el: '.main'
  
  initialize: (@router) =>
    
  
  render: (name) =>
    dust.render 'reports.chart', name:name, (err, html) =>
      @$el.html html
      if name is 'reservation_fees'
        @reservation_fees(name)
      
    
  reservation_fees: (which) =>
    
    # charts fun
    context = document.getElementById('chart').getContext("2d")
    helpers.ajax '/statements/annual/', (err, data) =>
      draw = 
        labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        datasets: []
      
      years = {}
      colors = ['red','blue','green','orange']
      for month in data.billed
        month.color = colors[_i]
        years[month.year] = [] if !years[month.year]
        years[month.year].push month
      
      index = 0
      for year, months of years
        # res fees
        set = 
          label: year + ' Res Fees'
          strokeColor: colors[index]
          fillColor: colors[index]
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
        
        
      # forecast
      years = {}
      colors = ['green','orange','purple','pink','black']
      for month in data.projected
        month.color = colors[_i]
        years[month.year] = [] if !years[month.year]
        years[month.year].push month
      
      index = 0
      for year, months of years
        # res fees
        set = 
          label: year + ' Projected'
          strokeColor: colors[index]
          fillColor: colors[index]
          data:[]
          
        for _m in [1...13]
          push = 0
          for month in months
            if (month.month+1) is _m
              push = month.res_fees
            
          set.data.push push 
        
        draw.datasets.push set     
        index++  
        
        
      chart = new Chart(context).Bar(draw, false)
    
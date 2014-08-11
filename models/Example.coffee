# Example Model Class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Example extends swell.Model
  
  idAttribute: '_id'    # validation will remove your keys if not specified
  
  # see docs for all options, there are many.
  # field definitions. 
  fields:  
    name:
      type: 'string'
      label: 'Full Name'
      not_empty: true
      not: 'bad'
      message: 'Custom description validation message'
      sortable: true
      
    color:
      type: 'string'
      label: 'Color'
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/
      message: 'Colors must be in hex format'
      
    length:
      type: 'number'
      label: 'Length (in.)'
      round: 2
      sortable: true
      
    last_seen:
      label: 'Last Seen'
      type: 'datetime'
      past: false
      format: 'MMM Do YYYY h:ma'
      sortable: true
    
    email: 
      type:'email'
    
    sort_order:
      type: 'number'
      length: 2
      
  
  # defaults are in their own store for backbone
  defaults:
    name: 'Swell Example Model'
    color: 'cc0000'
    
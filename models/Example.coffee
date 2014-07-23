# Example Model Class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Example extends swell.Model
  
  idAttribute: '_id'    # validation will remove your keys if not specified
  
  fields:
    name:
      type: 'string'
      label: 'Name'
      not_empty: true
      not: 'bad'
      message: 'Custom description validation message'
    
    color:
      type: 'string'
      label: 'Color'
      maxlength: 6
    
    length:
      type: 'number'
      label: 'Length (in.)'
      round: 2
      
    sort_order:
      type: 'number'
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/
      length: 2
    
    datetime:
      label: 'Last Seen'
      type: 'datetime'
      past: false
      format: 'MMM Do YYYY h:ma'
    
    email: 
      type:'email'
      
      
  defaults:
    name: 'This is fucking retarded'
    color: 'cc0000'
    
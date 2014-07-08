# Example Model Class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Example extends swell.Model
  
  idAttribute: '_id'  # this is important - validation will remove your keys if not specified
  
  fields:
    name:
      type: 'string'
      not_empty: true
      not: 'bad'
      message: 'Custom description validation message'
    
    color:
      type: 'string'
      maxlength: 6
    
    sort_order:
      type: 'number'
      expr: /^#([0-9a-f]{3}|[0-9a-f]{6})$/
      length: 2
    
    start_date:
      type: 'datetime'
      future: false
    
  defaults:
    name: 'New Example'
    color: 'cc0000'
    
# Example Collection class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Example extends swell.Model
  
  idAttribute: '_id'
  
  fields:
    name:
      type: 'string'
      not_empty: true
      not: 'bad'
      message: 'Custom description validation message'
    
    color:
      type: 'string'
      length: 6
    
    sort_order:
      type: 'number'
      length: 2
    
    start_date:
      type: 'datetime'
      future: false
    
  defaults:
    name: 'New Example'
    color: 'cc0000'
    
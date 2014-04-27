# Example Collection class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

class Examples extends swell.Collection
  
  # which model to use within the collection
  model: models.Example
  
  # url is for the client
  url: '/examples/'
  
  # which data resource to connect to
  resource: 'mongo-example'
  # resource: 'mysql-example'
  
  # which nosql store or rdb table to use
  store: 'examples'
  
  # default sorting key
  sort_by: 'sort_order'
  
  # list will limit the fields retured to those specified
  # for larger objects, this can drastically improve list load time
  # if no list is specified, everything will be returned
  list: ['_id','name']
  # list: false  
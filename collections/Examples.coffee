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
  #resource: 'mysql-swell'
  resource: 'mongo-example'
  
  # which nosql store or rdb table to use
  store: 'examples'
  
  # default sorting key
  sort_by: 'sort_order'
  
  # list will limit the fields retured to those specified
  # for larger stores this can drastically improve long list loading time
  # if no list is specified, everything in the model will be returned
  list: ['_id','name','color','length','price','last_seen','active']
  # list: false  
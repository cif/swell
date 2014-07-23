# swell default responder          
# 2014-04-16
# github.com/cif/swell
# email@benipsen.com


class Pages extends swell.Responder
  
  # init is called immediately after swell.Responder is constructed. 
  # for a more convenient method for authentication on a high level
  # implement before: (request) => ... do security stuff
  # returning false will send a 403 automatically
  init: (@config) =>
  
  
  # default index page
  index: (req, callback) =>
    data = 
      view: 'index'
      layout: 'layouts/page'
    callback null, data
  
  # very simple responder method that will render 
  # a dust view template by url: /page/:view > views/:view.dust
  # to remove this functionality, delete the route in swell.json or run 
  #    swell -d  "server.routes./page/:view"
  page: (req, callback) =>
    data = 
      view: 'docs/' + req.params.view.replace(/\./g,'/')
      layout: 'layouts/page'
    callback null, data
  
    
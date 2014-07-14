
class Statements extends swell.Responder
  
  fs = require 'fs'
  async = require 'async'
  
  expose_rest: true
  collection: collections.Statements
  
  annual: (req, callback) =>
    new @collection @config, (err, @collection) =>
      @collection.db.query 'SELECT YEAR(date) as year, MONTHNAME(date) as month, SUM(total) as total, SUM(reservation_fees) as res_fees, SUM(service_fees) as serv_fees FROM statements GROUP BY YEAR(date), MONTH(date)', (err, res) =>
        callback(err) if err
        callback(null, res)
    
    
    
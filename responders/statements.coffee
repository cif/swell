
class Statements extends swell.Responder
  
  fs = require 'fs'
  async = require 'async'
  
  expose_rest: true
  collection: collections.Statements
  
  annual: (req, callback) =>
    
    new @collection @config, (err, @collection) =>
      
      return callback(err) if err
      
      queries = [
        "select YEAR(start_date) as year, MONTH(start_date) as month, sum(adults), sum(adults*1.46) as res_fees from reservations where start_date >= DATE_FORMAT(NOW() ,'%Y-01-01') and account_id in(select id from accounts where is_billable=1) and status=1 and (trip_id > '' or lodge_id > '') GROUP BY YEAR(start_date), MONTH(start_date)"
        "SELECT YEAR(date) as year, MONTHNAME(date) as month, SUM(total) as total, SUM(reservation_fees) as res_fees, SUM(service_fees) as serv_fees FROM statements GROUP BY YEAR(date), MONTH(date)" 
      ]
      
      async.map queries, @collection.db.query, (err, res) =>
        return callback(err) if err
        data =
          projected: res[0]
          billed: res[1]
        callback(null, data)
    
    
    
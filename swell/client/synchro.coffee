#  swell.Synchro is Swell's sync manager
# 2014-07-18
# github.com/cif/swell
# email@benipsen.com

class Synchro
  
  constructor: (options) ->
    @namespace = if options and options.nsp then options.nsp else '/'
    @socket = io(@namespace)
  
  on: (event, callback) =>
    console.info '[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' subscribed'
    @socket.on event, (data) =>
      console.info '[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' recieved', data
      callback(data)
  
  off: (event) =>
    console.info '[swell] ' + moment().format('HH:mm:ss') + ' synchro:' + event + ' unsubscribed'
    @socket.removeListener event
      
  
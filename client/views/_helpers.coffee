# View helpers class
# 2014-04-26
# github.com/cif/swell
# email@benipsen.com

# IMPORTANT: This filename is prefixed with an _ so that it gets compiled before any other views

class Helpers extends swell.Helpers
  
  init: =>
    
    # extend dust.helpers so methods here are available in dust templates
    _.extend(dust.helpers, @)
    
  # define custom helpers for your application here
  # example_dust_helper: (chunk, ctx, bodies, params) =>
    # do stuff ... 
    # hello = 'custom helper works!'
    # chunk.write hello
  
  
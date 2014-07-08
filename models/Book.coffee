
class Book extends swell.Model
  
  has_many: [collections.Chapters]
  
  fields:
    title:
      type:'string'
       
class List extends swell.List
  
  tmpl: '<span style="color:#{color}">{name}</span>'
  
  update: (model) =>
    @nodes[model.id].innerHTML = helpers.tmpl(@tmpl, model.attributes)
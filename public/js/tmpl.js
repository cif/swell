var dom = {}
dom.examples = {};
dom.examples.list = (function anonymous(data_0) {
  var frag = document.createDocumentFragment();
  var data = data_0;
  var el0 = document.createElement("p");
  el0.textContent = "testing template:";
  frag.appendChild(el0);
  var el2 = document.createElement("p");
  el2.textContent = test;
  frag.appendChild(el2);
  return frag;
});

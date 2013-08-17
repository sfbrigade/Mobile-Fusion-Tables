(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['infobox.helper'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "";
  return buffer;
  }

  buffer += "<div class='"
    + escapeExpression(((stack1 = ((stack1 = depth0.classes),stack1 == null || stack1 === false ? stack1 : stack1.infobox)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n	<div class='score "
    + escapeExpression(((stack1 = ((stack1 = depth0.classes),stack1 == null || stack1 === false ? stack1 : stack1.score)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>"
    + escapeExpression(((stack1 = ((stack1 = depth0.info),stack1 == null || stack1 === false ? stack1 : stack1.score)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</div>\n	<h4 class='"
    + escapeExpression(((stack1 = ((stack1 = depth0.classes),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>"
    + escapeExpression(((stack1 = ((stack1 = depth0.info),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h4>\n	<p class='"
    + escapeExpression(((stack1 = ((stack1 = depth0.classes),stack1 == null || stack1 === false ? stack1 : stack1.date)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'><strong>"
    + escapeExpression(((stack1 = ((stack1 = depth0.info),stack1 == null || stack1 === false ? stack1 : stack1.date)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</strong></p>\n	<p class='"
    + escapeExpression(((stack1 = ((stack1 = depth0.classes),stack1 == null || stack1 === false ? stack1 : stack1.address)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "'>\n		"
    + escapeExpression(((stack1 = ((stack1 = depth0.info),stack1 == null || stack1 === false ? stack1 : stack1.address)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\n		";
  if (stack2 = helpers.violations_header) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.violations_header; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  stack2 = helpers.list.call(depth0, depth0.violations, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n	</p>\n</div>";
  return buffer;
  });
})();
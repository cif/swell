
(function(){dust.register(".index",body_0);function body_0(chk,ctx){return chk.write("testing this view {").reference(ctx.get(["dope"], false),ctx,"h").write("}");}return body_0;})();
(function(){dust.register("layouts.app",body_0);function body_0(chk,ctx){return chk.write("<html><body>").partial(body_1,ctx,null).write("</body></html>");}function body_1(chk,ctx){return chk.reference(ctx.get(["_main"], false),ctx,"h");}return body_0;})();

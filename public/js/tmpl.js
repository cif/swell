
(function(){dust.register("reports.chart",body_0);function body_0(chk,ctx){return chk.write("<div class=\"chart\"><h2>").reference(ctx.get(["name"], false),ctx,"h").write("</h2><canvas id=\"chart\" width=\"1000\" height=\"500\"></canvas></div>");}return body_0;})();
(function(){dust.register("test.testing",body_0);function body_0(chk,ctx){return chk.write("this is some dust ").reference(ctx.get(["variable"], false),ctx,"h").write(" testing and ").reference(ctx.get(["poop"], false),ctx,"h").write("  ").helper("test_dust_helper",ctx,{},{"me":"stoked"});}return body_0;})();

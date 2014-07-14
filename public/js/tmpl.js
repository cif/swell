
(function(){dust.register("test.testing",body_0);function body_0(chk,ctx){return chk.write("this is some dust ").reference(ctx.get(["variable"], false),ctx,"h").write(" testing and ").reference(ctx.get(["poop"], false),ctx,"h").write("  ").helper("test_dust_helper",ctx,{},{"me":"stoked"});}return body_0;})();

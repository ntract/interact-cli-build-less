events.on("task:less", function(options) {
	var less = require("less");

	//load all backend/routes
	var globs = new GlobCollection([
		cli.plugins_dirname+"/**/*.css",
		cli.plugins_dirname+"/**/*.less",
		cli.plugins_dirname+"/*.css",
		cli.plugins_dirname+"/*.less",
		"!**/res",
		"!**/root",
		"!**/cfg"
	]);
	var treecontext = new TreeContext({
	    files: true,
	    dirs: true,
	    cache: true
	});
	var tree = treecontext.Tree(".", options.src);
	var modules = tree.mapGlobs(globs);


	var chunks = [];
	var line = 1;

	FileSystem.mkdir(path.join(options.build, cli.plugins_dirname));

	var includes = "";

	for (var i = 0, l = modules.files.length; i < l; i++) {
		includes+="@import (less) \""+modules.files[i].relativeLocation+"\";\n";
		FileSystem.rm(path.join(options.build, modules.files[i].relativeLocation));
	}

	less.render(includes, {
		sourceMap: options.dev ? {
			sourceMapBasepath: options.src,	
			sourceMapFileInline: true,
			outputSourceFiles: true
		} : null,
		paths: [options.src],  // Specify search paths for @import directives
		filename: 'bundled.css', // Specify a filename, for better error messages
		compress: true          // Minify CSS output
	}, function (e, output) {
		fs.writeFileSync(path.join(options.build, "_plugins.css"), output.css);

		console.log("LESS done.");
		events.emit("task:done", "less");
	});


});
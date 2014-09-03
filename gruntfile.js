module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON("package.json"),

		jshint: {
			options: {
				curly: true,
				eqnull: true,
				browser: true,
				asi: true,
				smarttabs: true,
				expr: true
			},
			before: ["src/modules/*.js"],
			after: ["www/build.js"]
		},

		concat: {
			dist: {
				src: [
					"src/lib/dat.gui.js",
					"src/lib/jquery.js",
					"src/lib/jquery.*.js",
					
					"src/init.js",
					"src/modules/*.js",
					"src/complete.js"
				],

				dest: "tmp/build.js",
			},
		},

		uglify: {
			options: {
				sourceMap: true
			},
			build: {
				files: {
					"www/build.js": "tmp/build.js"
				}
			}
		}
	});

	Object.keys(grunt.config.data.pkg.devDependencies).forEach(function(v) {
		if (v == "grunt") { return true; }
		grunt.loadNpmTasks(v);
	});

	grunt.registerTask("default", [
		"jshint:before",
		"concat",
		"uglify"
	]);

};

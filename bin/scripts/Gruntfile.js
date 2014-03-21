module.exports = function(grunt){
	grunt.initConfig({
		execute: {
			build: {
				src: ['./build.js']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-jasmine-node');
	
	grunt.registerTask("build", ["execute:build"]);
};
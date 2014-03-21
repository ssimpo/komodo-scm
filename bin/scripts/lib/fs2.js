QQ = require('promise-stack');
var fs = require('fs-extended');
var Path = require('path');

fs.debug = fs.debug || false;

fs.getAllFiles =  function(path, filters) {
	var files = [];
	var Q = new QQ();
	Q.data = files;
	filters = fs._initFilters(filters);
	path = Path.normalize(path);
	
	return fs._getAllFiles(path, files, Q, filters);
};

fs.xcopy = function(source, dest, filters) {
	var Q = new QQ();
	
	fs.getAllFiles(source, filters).then(function(files){
		files.forEach(function(file){
			if (file.directory) {
				var destFile = fs._getDestinationFile(file.path, dest, source);
				Q.nfcall(fs.createDir, destFile).then(function(){
					if (fs.debug) {
						console.log("Created: " + Path.resolve(destFile));
					}
				}, function(error) {
					console.error(error);
				});
			}else{
				var destFile = fs._getDestinationFile(file.path, dest, source);
				Q.nfcall(fs.copyFile, file.path, destFile).then(function(){
					if (fs.debug) {
						console.log("Copied: " + Path.resolve(file.path));
					}
				}, function(error) {
					console.error(error);
				});
			}
		});
	});
	
	
	
	return Q;
}

fs._getDestinationFile = function(sourceFullPath, destBase, source) {
	sourceFullPath = Path.resolve(sourceFullPath);
	destBase = Path.resolve(destBase);
	source = Path.resolve(source);

	return destBase + sourceFullPath.replace(source, "");
}

fs._getAllFiles = function(path, files, Q, filters) {
	if (fs.debug) {
		console.log("Examining directory: " + Path.resolve(path));
	}
	
	Q.nfcall(fs.readdir, path).then(function(cfiles) {
		cfiles.forEach(function(file) {
			var filePath = Path.normalize(path + '/' + file);
			Q.nfcall(fs.stat, filePath).then(function(stats){
				if (fs._filterFiles(filePath, filters, stats.isDirectory())) {
					
					files.push({
						'path': filePath,
						'directory': stats.isDirectory()
					});
					
					if(stats.isDirectory()) {
						fs._getAllFiles(filePath, files, Q, filters);
					}
					
				}
			});
		});
	});
	
	return Q;
}

fs._initFilters = function(filters) {
	filters = filters || {};
	
	filters.directories = filters.directories || {};
	filters.directories.includes = filters.directories.includes || [/.*/];
	filters.directories.excludes = filters.directories.excludes || [];
	
	filters.files = filters.files || {};
	filters.files.includes = filters.files.includes || [/.*/];
	filters.files.excludes = filters.files.excludes || [];
	
	return filters
}

fs._filterFiles = function(file, filters, isDirectory) {
	if (isDirectory) {
		if (fs._applyFilter(file, filters.directories.includes)) {
			return !fs._applyFilter(file, filters.directories.excludes);
		}
	} else {
		if (fs._applyFilter(file, filters.files.includes)) {
			return !fs._applyFilter(file, filters.files.excludes);
		}
	}
	
	return false;
}

fs._applyFilter = function(file, filters) {
	var pass = false;
	
	filters.every(function(filter) {
		if (filter.test(file)) {
			pass = true;
			return false;
		}
		return true;
	});
	
	return pass;
}

module.exports = fs;
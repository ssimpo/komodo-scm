var EXPORTED_SYMBOLS = ["require"];

var _this = this;
var _loadedLibraries = {};
var _libraryPaths = {};
var _cacheBust = false;

var require = function(config, moduleIds, callback){
	if(moduleIds === undefined){
		_loadLibraryPaths(config, false);
		if(_isProperty(config, "cacheBust")){
			_cacheBust = config.cacheBust;
		}
	}else{
		if(callback === undefined){
			callback = moduleIds;
			moduleIds = config;
			config = {"packages":[]};
		}
		moduleIds = (Object.prototype.toString.call(moduleIds) === '[object Array]')
			? moduleIds
			: [moduleIds];
			
		_require(config, moduleIds, callback);
	}
}

function _require(config, moduleIds, callback){
	var paths = _loadLibraryPaths(config);
	var cacheBust = ((_isProperty(config, "cacheBust"))
		? config.cacheBust
		: _cacheBust
	);
	var params = [];
	
	moduleIds.forEach(function(moduleId){
		var context = {};
		Components.utils.import(
			_resolveModuleId(moduleId, paths, cacheBust),
			context
		);
		params.push(context.main);
	});
	
	callback.apply(_this, params);
}

function _loadLibraryPaths(config, useTemp){
	useTemp = ((useTemp === undefined) ? true : useTemp);
	var tempLibraryPaths = cloneObject(_libraryPaths);
	
	config.packages.forEach(function(packageDetails){
		tempLibraryPaths[packageDetails.name] = packageDetails.location;
		if(!useTemp){
			_libraryPaths[packageDetails.name] = packageDetails.location;
		}
	});
	
	return tempLibraryPaths;
}

function _resolveModuleId(moduleId, paths, cacheBust){
	var idParts = moduleId.split("/");
	var library = idParts.shift();
	var filePath =
		"/" + idParts.join("/") + ".js?cachBust="
		+ _getCacheVar(moduleId, cacheBust);
	
	if(_isProperty(paths, library)){
		filePath = paths[library] + filePath;
	}else{
		var error = new Error("Could not load module: " + moduleId);
		Components.utils.reportError(error);
		throw error;
	}
	
	return filePath;
}

function _getCacheVar(libraryName, cacheBust){
	if(cacheBust === false){
		if(!_isProperty(_loadedLibraries, libraryName)){
			_loadedLibraries[libraryName] = _getRandomId();
		}
		
		return _loadedLibraries[libraryName];
	}else if(cacheBust === true){
		return _getRandomId();
	}else{
		return cacheBust;
	}
}

function _getRandomId(){
	return Date.now();
}

function cloneObject(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function _isProperty(value, propName){
	// summary:
	//		Does the object have a particular property?
	// value: Object
	//		Object to test against.
	// propName: string
	//		Property to test for.
	// returns: boolean

	return ((Object.prototype.hasOwnProperty.call(value, propName)) || (propName in value));
}
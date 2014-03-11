var EXPORTED_SYMBOLS = ["require"];

var _this = this;
var _loadedLibraries = {};
var _libraryPaths = {};
var _cacheBust = false;

var require = function(config, moduleIds, callback){
	// summary:
	//		Javascript module injector (similar to RequireJs).
	// config: object
	//		Object to use for config.  If it is the only parameter then use it
	//		to reconfigure the global config.  If it is not the only parameter
	//		then use it only for this operation.
	// moduleIds: array
	//		Array of modules to load in the id format aa/bb/...
	// callback: function
	//		The function to return the modules into.
	
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
	// summary:
	//		Load the specified modules, return them into callback as parameters.
	// description:
	//		Load the specified modules using the config object for load
	//		settings.  Loaded modules are then supplied in the sequence
	//		requested (ie. order of moduleIds array) as parameters to callback.
	// config: object
	//		Config object used to control how modules are loaded.
	// moduleIds: array
	//		Array of modules to load in the id format aa/bb/...
	//	callback: function
	//		The function to return the modules into.
	
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
	// summary:
	//		Load the library paths from a config object.
	// description:
	//		Load the library paths from a given config object. A temparary
	//		library path mapping object is created and returned.  Depending on
	//		on the value of useTemp (default: true), the global paths are
	//		also overriden so it affects future operations.
	// config: object
	//		The config object to parse for packages.
	// useTemp: boolean
	//		Overwrite the global package paths?
	// returns: object
	//		Object in the format:
	//			{"<package id>":"<package root directory path (absolute)>"}.
	
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
	// summary:
	//		Resolve the full path of a given module id.
	// description:
	//		Calculate and return the full path to a given Javascript resource
	//		based on the supplied module-id and the current config settings.
	// moduleId: string
	//		Module-id in the format aa/bb/... Where is aa is the base library
	//		and should have been previously listed in the config.packages
	//		settings.  bb and anything after it the directory path from aa
	//		library root.
	// paths: object
	//		Object containing the current library paths (packagages) to be
	//		used for this resolve.
	// cacheBust: boolean|mixed
	//		The cacheBust setting for this resolve operation.
	// returns: string
	//		Path to the resource.
	
	cacheBust = ((cacheBust === undefined) ? _cacheBust : cacheBust);
	
	var idParts = moduleId.split("/");
	var library = idParts.shift();
	var filePath =
		"/" + idParts.join("/") + ".js?cachBust="
		+ _getCacheVarForModule(moduleId, cacheBust);
	
	if(_isProperty(paths, library)){
		filePath = paths[library] + filePath;
	}else{
		var error = new Error("Could not load module: " + moduleId);
		Components.utils.reportError(error);
		throw error;
	}
	
	return filePath;
}

function _getCacheVarForModule(moduleName, cacheBust){
	// summary:
	//		Get a cache query paramater for the given library.
	// description:
	//		Return a unique interger id for the given library name. The id will
	//		calculated depeding on the value of cacheBust. The id will be used
	//		to control the caching of module loads.
	//
	//		If cacheBust is false then the value is caculated only once for each
	//		module.  If it is true, it re-calculated for every call (even if
	//		module already has a cache id.  If it is a value then use the value
	//		as the cache id.
	// moduleName: string
	//		The name of the library.
	// cacheBust: boolean|mixed
	//		Generate a new cache id for each module for each load: True or
	//		False.  If not a boolean then use the value as a cache id or use
	//		supplied function to generate one (assumes return of function will
	//		be the new cache id.
	// returns: integer
	//		The cache id value calculated for the given module at this time.
	
	cacheBust = ((cacheBust === undefined) ? _cacheBust : cacheBust);
	
	if(cacheBust === false){
		if(!_isProperty(_loadedLibraries, moduleName)){
			_loadedLibraries[moduleName] = _getRandomId();
		}
		
		return _loadedLibraries[moduleName];
	}else if(cacheBust === true){
		return _getRandomId();
	}else{
		return cacheBust;
	}
}

function _getRandomId(){
	// summary:
	//		Generate a random interger.
	// returns: integer
	//		A random number greater than zero.
	
	return Date.now();
}

function cloneObject(obj) {
	// summary:
	//		Clone a Javascript object.
	// obj: object
	//		Object to clone.
	// returns: object
	//		Cloned copy of obj.
	
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
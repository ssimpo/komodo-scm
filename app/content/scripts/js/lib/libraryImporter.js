var EXPORTED_SYMBOLS = ["require"];

var _this = this;
var _loadedLibraries = {};

var require = function(config, moduleIds, callback){
	if(callback === undefined){
		moduleIds = config;
		callback = modules;
		config = _this.config;
	}
	moduleIds = (Object.prototype.toString.call(moduleIds) === '[object Array]')
		? moduleIds
		: [moduleIds];
	
	_require(config, moduleIds, callback);
}

function _require(config, moduleIds, callback){
	var params = [];
	
	moduleIds.forEach(function(moduleId){
		var context = {};
		Components.utils.import(_resolveModuleId(moduleId, config), context);
		params.push(context.main);
	});
	
	callback.apply(_this, params);
}

function _resolveModuleId(moduleId, config){
	var idParts = moduleId.split("/");
	var library = idParts.shift();
	var filePath =
		"/" + idParts.join("/") + ".js?cachBust="
		+ _getCacheVar(moduleId);
	
	if(_isProperty(config, library)){
		filePath = config[library] + filePath;
	}else{
		var error = new Error("Could not load module: " + moduleId);
		Components.utils.reportError(error);
		throw error;
	}
	
	return filePath;
}

function _getCacheVar(libraryName){
	if(!_isProperty(_loadedLibraries, libraryName)){
		_loadedLibraries[libraryName] = _getRandomId();
	}
	
	return _loadedLibraries[libraryName];
}

function _getRandomId(){
	return Date.now();
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
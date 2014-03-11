var EXPORTED_SYMBOLS = ["loadLibrary"];

var _this = this;
var _scriptPath = "/scripts/js";
var _loadedLibraries = {};

var loadLibrary = function(libraryName, scope, protocol){
	if(Object.prototype.toString.call(libraryName) === '[object Array]'){
		libraryName.forEach(function(loadLibraryParams){
			_loadLibrary.apply(_this, loadLibraryParams);
		});
	}else{
		_loadLibrary.call(_this, libraryName, scope, protocol);
	}
}

function _loadLibrary(libraryName, scope, protocol){
	protocol = protocol || "chrome";
		
	if((protocol === "file") || (protocol === "chrome")){
		if(protocol === "file"){
			protocol = protocol + ":///";
			var path = _calculateFilePath(scope);
		}else{
			protocol = protocol + "://";
			var path = _calculateChromePath();
		}
		path += _scriptPath;
	}else{
		protocol = "file:///";
		var path = protocol.replace(/\\/g, "/");
	}
	path += "/" + libraryName + ".js?cacheBust=" + _getCacheVar(libraryName);
	
	Components.utils.import(protocol + _fixPath(path), scope);
}

function _fixPath(path){
	return path.replace(/\\/g, "/").replace(/\/\//g, "/");
}

function _calculateChromePath(){
	return "komodoscm/content"
}

function _calculateFilePath(scope){
	var ko = ko || scope.ko;
	return ko.interpolate.interpolateString('%p').replace(/\\/g, "/") + "/app/content";
}

function _getGlobal(){
	return Function('return this')() || (42, eval)('this');
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
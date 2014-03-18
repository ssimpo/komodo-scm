define([], function(){
	var interfaceNameLookup = {
		"mozilla.org/xre/app-info":"nsIXULRuntime",
		"mozilla.org/file/local":"nsIFile"
	};
	var interfaceNameMappings = {};
	
	for(var interfaceName in Components.interfaces){
		interfaceNameMappings[interfaceName.toLowerCase()] = interfaceName;
	}
	
	function isProperty(value, propName){
		// summary:
		//		Does the object have a particular property?
		// value: Object
		//		Object to test against.
		// propName: string
		//		Property to test for.
		// returns: boolean

		return Object.prototype.hasOwnProperty.call(value, propName);
	}
	
	function guessInterfaceName(componantName){
		var lookup = componantName.toLowerCase().split("/").pop().replace("-","");
		var domain = componantName.toLowerCase().split("/").shift();
		if(domain === "mozilla.org"){
			lookup = "nsi" + lookup;
		}else if(domain === "activestate.com"){
			lookup = "koi" + lookup.substring(2);
		}
		
		if(isProperty(interfaceNameMappings, lookup)){
			return interfaceNameMappings[lookup];
		}
		
		return undefined;
	}
	
	return {
		load: function (name, require, onload, config) {
			var interfaceName;
			
			if(isProperty(interfaceNameLookup, name)){
				interfaceName = interfaceNameLookup[name];
			}else{
				interfaceName = guessInterfaceName(name);
			}
			
			if(interfaceName){
				onload(
					Components.classes["@" + name + ";1"]
					.getService(Components.interfaces[interfaceName])
				);
			}else{
				onload.error("Could not find the requested component ("+name+").");
			}	
		}
	};
});
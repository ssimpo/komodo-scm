var EXPORTED_SYMBOLS = ["getComponent"];

function getComponent(classname, library, infterface){
	library = library || "activestate.com";
	infterface = infterface || _calculateKomodoInterfaceName(classname);
	
	return Components.classes["@" + library + "/" + classname + ";1"].getService(Components.interfaces[infterface]);
};

function _calculateKomodoInterfaceName(classname){
	var infterface;
	
	if(classname.substr(0,2) === "ko"){
		infterface = "koI" + classname.substr(2);
	}
	
	return infterface;
}
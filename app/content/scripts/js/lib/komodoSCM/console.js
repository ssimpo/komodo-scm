define([
	"./componant!mozilla.org/consoleservice"
], function(mozConsoleService){
	return {
		log: function(value){
            mozConsoleService.logStringMessage(value);
        },
        error: function(error){
            Components.utils.reportError(error);
        }
    };
});
// summary:
//      Main JavaScript content for KomodoSCM.
// author:
//      <%= creator %> <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      <%= version %>

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.komodoscm) org.simpo.komodoscm = {};

try {
	org.simpo.komodoscm.dialogs = function(args){
		var construct = {
			"returner": null,
			
			constructor: function(args){
				this.returner = args[0];
			},
			
			save: function(){
				this._setCommandClose('save');
			},
			
			cancel: function() {
				this._setCommandClose('cancel');
			},
			
			ignore: function() {
				this._setCommandClose('ignore');
			},
			
			_setCommandClose: function(command){
				this.returner.command = command;
				window.close();
			}
		}
		
		construct.constructor(arguments);
		return construct;
	};
	
	// Global namespace violation?
	var KSCMDIALOG = new org.simpo.komodoscm.dialogs(window.arguments);
} catch(e) {
	Components.utils.reportError(e);    
}
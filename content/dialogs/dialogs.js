// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.2.1b

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

try {
	org.simpo.svnk.dialogs = function(args){
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
	var SVNKDIALOG = new org.simpo.svnk.dialogs(window.arguments);
} catch(e) {
	Components.utils.reportError(e);    
}
// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.1.9

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

try {
    org.simpo.svnk.dialogs = function(arguments) {
        
        this.returner = arguments[0];
        
        this.save = function() {
            this.returner.command = 'save';
            window.close();
	}
	
	this.cancel = function() {
            this.returner.command = 'cancel';
	    window.close();
	}
        
        this.ignore = function() {
            this.returner.command = 'ignore';
	    window.close();
	}
        
    }
    
    // Global namespace violation?
    var SVNKDIALOG = new org.simpo.svnk.dialogs(window.arguments);
} catch(e) {
    Components.utils.reportError(e);    
}
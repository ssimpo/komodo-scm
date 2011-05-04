// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.4

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

// Current version of Komodo does not support Function.bind; this emulates
// that functionality.
if ( !Function.prototype.bind ) {
    Function.prototype.bind = function( obj ) {
        var slice = [].slice,
        args = slice.call(arguments, 1),
        self = this,
        nop = function () {},
        bound = function () {
            return self.apply( this instanceof nop ? this : ( obj || {} ),
                args.concat( slice.call(arguments) ) );
        };
        nop.prototype = self.prototype;
        bound.prototype = new nop();
        return bound;
    };
}

try {
org.simpo.svnk.pref = function() {
    this.prefBrowser = Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs;
    this.pathToProcTextBox = document.getElementById("preferences-SVNK-pathToProc");
    
    this.browse = function() {
        // summary:
        //      Handle a folder-browse request.  Store result of folder
        //      picking in preferences and textbox.
    
        var path = ko.filepicker.getFolder(
            this._getPrefString('svnk.pathtoproc'),
            'Path to TortoiseProc.exe'
        );
        this.pathToProcTextBox.value = path;
        this._setPrefString('svnk.pathtoproc', path);
    };
    
    this._setPrefString = function(prefID,prefValue) {
        // summary:
        //      Set a Komodo String preference.
        // prefId: string
        //      The ID of the preference to set.
        // prefValue: string
        //      The string value to set preference to.
        
        if (parent.hPrefWindow) {
            parent.hPrefWindow.prefset.setStringPref(prefID, prefValue);
        }
        this.prefBrowser.setStringPref(prefID, prefValue);
    }
    
    this._getPrefString = function(prefID) {
        // summary:
        //      Get a Komodo string preference.
        // prefID: string
        //      The ID of the Komodo preference string to get.
        // returns: string
        //      The preference value or blank-string if preference not found.
        
        if (this.prefBrowser.hasStringPref(prefID)) {
            return this.prefBrowser.getStringPref(prefID);
        } else {
            return '';
        }
    }
    
    this.pathToProcTextBox.onchange = function(e) {
        var path = SVNKPREF.pathToProcTextBox.value;
        
        if (parent.hPrefWindow) {
            parent.hPrefWindow.prefset.setStringPref('svnk.pathtoproc', path);
        }
        SVNKPREF.prefBrowser.setStringPref('svnk.pathtoproc', path);
    }
    
    this.pathToProcTextBox.value = this._getPrefString('svnk.pathtoproc');
};

// Global namespace violation?
var SVNKPREF = new org.simpo.svnk.pref();

} catch (e) {
    Components.utils.reportError(e);
}
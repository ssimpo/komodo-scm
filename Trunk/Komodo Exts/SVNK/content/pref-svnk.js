// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.1.7

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
org.simpo.svnk.pref = {
    prefBrowser:Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    
    browse:function() {
        // summary:
        //      Handle a folder-browse request.  Store result of folder
        //      picking in preferences and textbox.
    
        var path = ko.filepicker.getFolder(
            org.simpo.svnk.pref.getPrefString('svnk.pathtoproc'),
            'Path to TortoiseProc.exe'
        );
        var tXB = document.getElementById('SVNK-option-pathToProc');
        tXB.value = path;
        org.simpo.svnk.pref.setPrefString('svnk.pathtoproc', path);
    },
    
    setPrefString:function(prefID,prefValue) {
        // summary:
        //      Set a Komodo String preference.
        // prefId: string
        //      The ID of the preference to set.
        // prefValue: string
        //      The string value to set preference to.
        
        if (parent.hPrefWindow) {
            parent.hPrefWindow.prefset.setStringPref(prefID, prefValue);
        }
        org.simpo.svnk.pref.prefBrowser.setStringPref(prefID, prefValue);
    },
    
    setPrefBoolean:function(prefID,prefValue) {
        // summary:
        //      Set a Komodo Boolean preference.
        // prefId: string
        //      The ID of the preference to set.
        // prefValue: boolean
        //      The true|false value to set preference to.
        
        if (parent.hPrefWindow) {
            parent.hPrefWindow.prefset.setBooleanPref(prefID, prefValue);
        }
        org.simpo.svnk.pref.prefBrowser.setBooleanPref(prefID, prefValue);
    },
    
    getPrefString:function(prefID) {
        // summary:
        //      Get a Komodo string preference.
        // prefID: string
        //      The ID of the Komodo preference string to get.
        // returns: string
        //      The preference value or blank-string if preference not found.
        
        if (org.simpo.svnk.pref.prefBrowser.hasStringPref(prefID)) {
            return org.simpo.svnk.pref.prefBrowser.getStringPref(prefID);
        } else {
            return '';
        }
    },
    
    getPrefBoolean:function(prefID,defaultValue) {
        // summary:
        //      Get a Komodo boolean preference.
        // prefID: string
        //      The ID of the Komodo preference boolean to get.
        // defaultValue: variant
        //      The default value to return if the preference does not exist.
        // returns: boolean
        //      The preference value or defaultValue if preference not found.
        
        if (org.simpo.svnk.pref.prefBrowser.hasBooleanPref(prefID)) {
            return org.simpo.svnk.pref.prefBrowser.getBooleanPref(prefID);
        } else {
            return defaultValue;
        }
    },
    
    checkboxOnCommand:function() {
        var pref = this.getAttribute('preference');
        org.simpo.svnk.pref.setPrefBoolean(pref,this.checked);
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var komodo = wm.getMostRecentWindow('Komodo');
        komodo.org.simpo.svnk.toolLoader.showHideButtons();
    },
    
    textboxOnChange:function() {
        var pref = this.getAttribute('preference');
        org.simpo.svnk.pref.setPrefString(pref,this.value);
    }
    
    
};

var checkboxes = document.getElementsByTagName("checkbox");
for (var i = 0; i < checkboxes.length; i++) {
    var cCB = checkboxes[i];
    var pref = cCB.getAttribute('preference');
    cCB.checked = org.simpo.svnk.pref.getPrefBoolean(pref,false);
    cCB.addEventListener(
        'command',org.simpo.svnk.pref.checkboxOnCommand,false
    );
}

var textboxes = document.getElementsByTagName("textbox");
for (var i = 0; i < textboxes.length; i++) {
    var tXB= textboxes[i];
    var pref = tXB.getAttribute('preference');
    tXB.value = org.simpo.svnk.pref.getPrefString(pref);
    tXB.addEventListener(
        'change',org.simpo.svnk.pref.textboxOnChange,false
    );
}


// Global namespace violation?
//var SVNKPREF = new org.simpo.svnk.pref();

} catch (e) {
    Components.utils.reportError(e);
}
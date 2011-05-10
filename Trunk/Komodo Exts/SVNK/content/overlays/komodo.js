// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.6

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

org.simpo.svnk.toolLoader = {
    prefBrowser:Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    toolbarbuttons:null,
    
    getPrefBoolean:function(prefID,defaultValue) {
        // summary:
        //      Get a Komodo boolean preference.
        // prefID: string
        //      The ID of the Komodo preference boolean to get.
        // defaultValue: variant
        //      The default value to return if the preference does not exist.
        // returns: boolean
        //      The preference value or defaultValue if preference not found.
        
        if (org.simpo.svnk.toolLoader.prefBrowser.hasBooleanPref(prefID)) {
            return org.simpo.svnk.toolLoader.prefBrowser.getBooleanPref(prefID);
        } else {
            return defaultValue;
        }
    },
    
    showHideButtons:function() {
        var toolbarbuttons = org.simpo.svnk.toolLoader.toolbarbuttons;
        for (var i = 0; i < toolbarbuttons.length; i++) {
            var tBB = toolbarbuttons[i];
            var pref = tBB.getAttribute('preference'); 
            if (pref) {
                //org.simpo.svnk.toolLoader.logger.logStringMessage(pref);
                var prefValue = org.simpo.svnk.toolLoader.getPrefBoolean(pref,true);
                tBB.hidden = !prefValue; 
            }
        }
    }
    
};

org.simpo.svnk.toolLoader.toolbarbuttons = document.getElementsByTagName("toolbarbutton");

window.addEventListener(
    'load',org.simpo.svnk.toolLoader.showHideButtons,false
);
window.addEventListener(
    'codeintel_activated_window',org.simpo.svnk.toolLoader.showHideButtons,true
);
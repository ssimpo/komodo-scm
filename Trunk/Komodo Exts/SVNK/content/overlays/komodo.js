// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.7

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
        //      Get a Komodo boolean preference. Will also set to default value
        //      if no value already set.
        // prefID: string
        //      The ID of the Komodo preference boolean to get.
        // defaultValue: variant
        //      The default value to return if the preference does not exist.
        // returns: boolean
        //      The preference value or defaultValue if preference not found.
        
        if (org.simpo.svnk.toolLoader.prefBrowser.hasBooleanPref(prefID)) {
            return org.simpo.svnk.toolLoader.prefBrowser.getBooleanPref(prefID);
        } else {
            if (parent.hPrefWindow) {
                parent.hPrefWindow.prefset.setBooleanPref(prefID, defaultValue);
            }
            org.simpo.svnk.toolLoader.prefBrowser.setBooleanPref(
                prefID, defaultValue
            );
            
            return defaultValue;
        }
    },
    
    showHideButtons:function() {
        // summary:
        //      Show/Hide buttons on the toolbar based on preference setting.
        // note:
        //      Will only execute against IDs containing 'svnk' so that it
        //      dosen't run against other addon buttons or core Komodo buttons.
        
        var toolbarbuttons = org.simpo.svnk.toolLoader.toolbarbuttons;
        for (var i = 0; i < toolbarbuttons.length; i++) {
            if (toolbarbuttons[i].id.toLowerCase().indexOf("svnk") != -1) {
                var tBB = toolbarbuttons[i];
                var pref = tBB.getAttribute('preference');
                this._showHideButton(tBB,pref);
            } 
        }
    },
    
    _showHideButton:function(button,pref) {
        // summary:
        //      Show/Hide a toolbar button depending on the
        //      supplied preference-ID.
        // button: XulElement
        //      The button to show/hide.
        // pref: string
        //      The preference-ID to base the show/hide on.
        
        if (pref) {
            var defaultValue = !button.hidden;
            var prefValue = org.simpo.svnk.toolLoader.getPrefBoolean(
                pref, defaultValue
            );
            button.hidden = !prefValue; 
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
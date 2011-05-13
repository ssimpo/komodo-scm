// summary:
//      Set/Get preference settings.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.1.8

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

try {
org.simpo.svnk.pref = {
    prefBrowser:Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    
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
        //      Get a Komodo boolean preference. Will also set to default value
        //      if no value already set.
        // prefID: string
        //      The ID of the Komodo preference boolean to get.
        // defaultValue: variant
        //      The default value to return if the preference does not exist.
        // returns: boolean
        //      The preference value or defaultValue if preference not found.
        
        if (org.simpo.svnk.pref.prefBrowser.hasBooleanPref(prefID)) {
            return org.simpo.svnk.pref.prefBrowser.getBooleanPref(prefID);
        } else {
            if (parent.hPrefWindow) {
                parent.hPrefWindow.prefset.setBooleanPref(prefID, defaultValue);
            }
            org.simpo.svnk.pref.setPrefBoolean(prefID, defaultValue);
            
            return defaultValue;
        }
    }
};

} catch (e) {
    Components.utils.reportError(e);
}
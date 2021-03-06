// summary:
//      Set/Get preference settings.
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
if (!org.simpo.komodoscm.objects) org.simpo.komodoscm.objects = {};

try {
org.simpo.komodoscm.pref = {
    prefBrowser:Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs,
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    
    setPrefString: function(prefID,prefValue){
        // summary:
        //      Set a Komodo String preference.
        // prefId: string
        //      The ID of the preference to set.
        // prefValue: string
        //      The string value to set preference to.
        
        if(parent.hPrefWindow){
            parent.hPrefWindow.prefset.setStringPref(prefID, prefValue);
        }
        org.simpo.komodoscm.pref.prefBrowser.setStringPref(prefID, prefValue);
    },
    
    setPrefBoolean: function(prefID,prefValue){
        // summary:
        //      Set a Komodo Boolean preference.
        // prefId: string
        //      The ID of the preference to set.
        // prefValue: boolean
        //      The true|false value to set preference to.
        
        if(parent.hPrefWindow){
            parent.hPrefWindow.prefset.setBooleanPref(prefID, prefValue);
        }
        org.simpo.komodoscm.pref.prefBrowser.setBooleanPref(prefID, prefValue);
    },
    
    getPrefString: function(prefID){
        // summary:
        //      Get a Komodo string preference.
        // prefID: string
        //      The ID of the Komodo preference string to get.
        // returns: string
        //      The preference value or blank-string if preference not found.
        
        if(org.simpo.komodoscm.pref.prefBrowser.hasStringPref(prefID)){
            return org.simpo.komodoscm.pref.prefBrowser.getStringPref(prefID);
        }else{
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
        
        if(org.simpo.komodoscm.pref.prefBrowser.hasBooleanPref(prefID)){
            return org.simpo.komodoscm.pref.prefBrowser.getBooleanPref(prefID);
        }else{
            if(parent.hPrefWindow){
                parent.hPrefWindow.prefset.setBooleanPref(prefID, defaultValue);
            }
            org.simpo.komodoscm.pref.setPrefBoolean(prefID, defaultValue);
            
            return defaultValue;
        }
    }
};

}catch(e){
    Components.utils.reportError(e);
}
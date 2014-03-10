// summary:
//      Main JavaScript content for KomodoSCM.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.2.1b

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.komodoscm) org.simpo.komodoscm = {};
if (!org.simpo.komodoscm.objects) org.simpo.komodoscm.objects = {};

org.simpo.komodoscm.toolLoader = {
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    toolbarbuttons:null,
    
    showHideButtons: function(){
        // summary:
        //      Show/Hide buttons on the toolbar based on preference setting.
        // note:
        //      Will only execute against IDs containing 'komodoscm' so that it
        //      dosen't run against other addon buttons or core Komodo buttons.
        
        var toolbarbuttons = org.simpo.komodoscm.toolLoader.toolbarbuttons;
        for(var i = 0; i < toolbarbuttons.length; i++){
            if(toolbarbuttons[i].id.toLowerCase().indexOf("komodoscm") != -1){
                var tBB = toolbarbuttons[i];
                var pref = tBB.getAttribute('preference');
                org.simpo.komodoscm.toolLoader._showHideButton(tBB,pref);
            } 
        }
    },
    
    _showHideButton: function(button,pref){
        // summary:
        //      Show/Hide a toolbar button depending on the
        //      supplied preference-ID.
        // button: XulElement
        //      The button to show/hide.
        // pref: string
        //      The preference-ID to base the show/hide on.
        
        if(pref){
            var defaultValue = !button.hidden;
            var prefValue = org.simpo.komodoscm.pref.getPrefBoolean(
                pref, defaultValue
            );
            button.hidden = !prefValue; 
        }
    }
    
};

org.simpo.komodoscm.toolLoader.toolbarbuttons = document.getElementsByTagName("toolbarbutton");

window.addEventListener(
    'load', org.simpo.komodoscm.toolLoader.showHideButtons, false
);
window.addEventListener(
    'codeintel_activated_window', org.simpo.komodoscm.toolLoader.showHideButtons, true
);
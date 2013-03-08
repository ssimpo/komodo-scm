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
if (!org.simpo.svnk.objects) org.simpo.svnk.objects = {};

org.simpo.svnk.toolLoader = {
    logger:Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    toolbarbuttons:null,
    
    showHideButtons: function(){
        // summary:
        //      Show/Hide buttons on the toolbar based on preference setting.
        // note:
        //      Will only execute against IDs containing 'svnk' so that it
        //      dosen't run against other addon buttons or core Komodo buttons.
        
        var toolbarbuttons = org.simpo.svnk.toolLoader.toolbarbuttons;
        for(var i = 0; i < toolbarbuttons.length; i++){
            if(toolbarbuttons[i].id.toLowerCase().indexOf("svnk") != -1){
                var tBB = toolbarbuttons[i];
                var pref = tBB.getAttribute('preference');
                org.simpo.svnk.toolLoader._showHideButton(tBB,pref);
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
            var prefValue = org.simpo.svnk.pref.getPrefBoolean(
                pref, defaultValue
            );
            button.hidden = !prefValue; 
        }
    }
    
};

org.simpo.svnk.toolLoader.toolbarbuttons = document.getElementsByTagName("toolbarbutton");

window.addEventListener(
    'load', org.simpo.svnk.toolLoader.showHideButtons, false
);
window.addEventListener(
    'codeintel_activated_window', org.simpo.svnk.toolLoader.showHideButtons, true
);
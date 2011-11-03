// summary:
//      Javascript for preferences/options dialog./panel.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.2.0

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};
if (!org.simpo.svnk) org.simpo.svnk = {};

try {
org.simpo.svnk.options = {
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
        'command',org.simpo.svnk.options.checkboxOnCommand,false
    );
}

var textboxes = document.getElementsByTagName("textbox");
for (var i = 0; i < textboxes.length; i++) {
    var tXB= textboxes[i];
    var pref = tXB.getAttribute('preference');
    tXB.value = org.simpo.svnk.pref.getPrefString(pref);
    tXB.addEventListener(
        'change',org.simpo.svnk.options.textboxOnChange,false
    );
}

} catch (e) {
    Components.utils.reportError(e);
}
// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      0.1.6

// Non violation of global namespace.
if (!org) var org = {};
if (!org.simpo) org.simpo = {};

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

org.simpo.svnk = function() {
    // summary:
    //      Main class containing the core-code for this addon.
    
    
    // strings: object
    //      String-bundle class for error reporting ... etc.
    this.strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://svnk/locale/main.properties");
    this.entries = {};
    this.prefBrowser = Components.classes['@activestate.com/koPrefService;1'].getService(Components.interfaces.koIPrefService).prefs;
    this.logger = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    this._dirtyCheckOn = new Array(
        'commit','update','revert','diff','rename','delete'
    );
    
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
    
    this.stringBundle = function(stringToGet) {
        // summary:
        //      Get the requested string from the stringbundle locale.
        // stringToGet: string
        //      The string you are looking for.
        // returns: string
        //      The local string requested.
        
        return this.strings.GetStringFromName(stringToGet);
    };
    
    this._runTortoiseCommand = function(command, type, errorMsgRef) {
        // summary:
        //      Run a TortoiseProc command.
        // command: string
        //      The command to run.
        // type: string
        //      The type of file-path to execute against the command.
        // errorMsgRef: string
        //      The errror reference to report if it fails.
        
        try {
            var path = this._getPath(type);
            if (this._checkNoDirtyFiles(type,command,path)) {
                var feedback = this._runTortoiseProc(path, command);
                if (feedback.error == true) {
                    Components.utils.reportError(feedback.value);
                }
            }
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle(errorMsgRef)
            );
        }
    };
    
    this._checkNoDirtyFiles = function(type,command,path) {
        // summary:
        //      Check for dirty files and respond to solicite user response.
        // type: string
        //      The method of action (ie. against activefile|selectedpaths|project)
        // command: string
        //      The SVN command requested.
        // path: string
        //      Paths to test.
        // returns: boolean
        //      Was there dirty paths (returns no ignore was pressed or
        //      files undirtied by a save).
        
        if (!this._checkDirtyCheckNeeded(command)) {
            return true;
        }
        
        try {
            var chrome = 'chrome://svnk/content/dialogs/saveYesNo.xul';
            var title = 'Unsaved information';
            var options = 'modal=yes,centerscreen=yes';
            var saveCommand = null;
            var returner = {'command':saveCommand};
            
            switch(type) {
                case 'activefile':
                    saveCommand = this._checkNoDirtyFilesActiveFile(
                        chrome,title,options,returner
                    );
                    break;
                case 'selectedpaths':
                    saveCommand = this._checkNoDirtySelectedPaths(
                        path,chrome,title,options,returner
                    );  
                    break;
                case 'project':
                    saveCommand = this._checkNoDirtyFilesAnyPath(
                        chrome,title,options,returner
                    );
                    break;
            }
        
            return this._handleDirtyPathsResponse(type,saveCommand);
            
        } catch(e) {
            Components.utils.reportError(e);
        }
        
        return false;
    };
    
    this._checkDirtyCheckNeeded = function(command) {
        // summary:
        //      Check if a dirty file check is needed for specified command.
        // command: string
        //      Command to check;
        // returns: boolean
        
        for (var i = 0; i < this._dirtyCheckOn.length; i++) {
            if (this._dirtyCheckOn[i] == command) {
                return true;
            }
        }
        
        return false;
    };
    
    this._docIsInPathString = function(doc,path) {
        // summary:
        //      Check if a given doc's path is contained within a path-string.
        // doc: object
        //      Open document object.
        // path: string
        //      The path-string (seprate paths, seperated by *)
        // returns: boolean
        
        var paths = path.split('*');
        for (var i = 0; i < this._paths.length; i++) {
            if (paths[i] == doc.file.path) {
                return true;
            }
        }
        
        return false;
    };
    
    this._checkNoDirtyFilesAnyPath = function(chrome,title,options,returner) {
        // summary:
        //      Check if the active file is dirty and solicite user response.
        // returner: object
        //      The object to pass to the dialog for responses.
        // chrome: string 
        //      The path to the dialog, which will pose dirt file question.
        // options: string
        //      The dialog options to use.
        // title: string
        //      The dialog title to use.
        // returns: string
        //      What does the user want you to do? (save|cancel|ignore).
        
        var doc = ko.views.manager.currentView.document;
        if (doc.isDirty) {
            var msg = this.stringBundle('DialogActiveFileDirty');
            openDialog(chrome,title,options,returner,msg);
        }
        
        return returner.command;
    };
    
    this._checkNoDirtyFilesActiveFile = function(
        path,chrome,title,options,returner
    ) {
        // summary:
        //      Check if the active file is dirty and solicite user response.
        // path:
        //      The path-string (seprate paths, seperated by *)
        // returner: object
        //      The object to pass to the dialog for responses.
        // chrome: string 
        //      The path to the dialog, which will pose dirt file question.
        // options: string
        //      The dialog options to use.
        // title: string
        //      The dialog title to use.
        // returns: string
        //      What does the user want you to do? (save|cancel|ignore).
        
        var doc = ko.views.manager.currentView.document;
        if ((doc.isDirty) && (this._docIsInPathString(doc,path))) {
            var msg = this.stringBundle('DialogActiveFileDirty');
            openDialog(chrome,title,options,returner,msg);
        }
        
        return returner.command;
    };
    
    this._checkNoDirtySelectedPaths = function(chrome,title,options,returner) {
        // summary:
        //      Check if the selected paths are dirty.
        // returner: object
        //      The object to pass to the dialog for responses.
        // chrome: string 
        //      The path to the dialog, which will pose dirt file question.
        // options: string
        //      The dialog options to use.
        // title: string
        //      The dialog title to use.
        // returns: string
        //      What does the user want you to do? (save|cancel|ignore).
        // todo:
        //      Currently checks all open files rather than just the selected
        //      ones.  This needs fixing; however this simple solution is good
        //      option in-place of the better more complicated one.
        
        var paths = this._getDirtyPaths();
        if (paths.length > 0) {
            var msg = this.stringBundle('DialogActiveFilesDirty1') + "\n" + paths.join("\n") + "\n\n" + this.stringBundle('DialogActiveFilesDirty2') + "\n";
            openDialog(chrome,title,options,returner, msg);
        }
        
        return returner.command;
    };
    
    this._handleDirtyPathsResponse =  function(type,command) {
        // summary:
        //      Action the users response to dirty paths dialog.
        // type: string
        //      The method of action (ie. against activefile|selectedpaths|project).
        // command: string
        //      The command, which the user issued.
        // returns: boolean
        //      Result of action (ie. no dirty paths / ignore = true, else false).
        
        switch(command) {
            case null:
                return true;
                break;
            case 'ignore':
                return true;
                break;
            case 'cancel':
                return false;
                break;
            case 'save':
                if (type == 'activefile') {
                    ko.views.manager.currentView.document.save(true);
                } else {
                    this._saveDirtyPaths();
                }
                return true;
                break;
        }
        
        return false;
    };
    
    this._saveDirtyPaths = function() {
        // summary:
        //      Save all the current dirty paths.
        // todo:
        //      Make it work only against selected paths
        
        var views = ko.views.manager.getAllViews();
        for (var i = 0; i < views.length; i++) {
            var doc = views[i].document;
            if (doc.isDirty) {
                doc.save(true);
            }
        }
    };
    
    this._getDirtyPaths = function() {
        // summary:
        //      Get a list of open filepaths, which dirty (ie. change + unsaved).
        // returns: array
        //      String array containing dirty paths
        
        var views = ko.views.manager.getAllViews();
            
        var paths = new Array();
        for (var i = 0; i < views.length; i++) {
            var doc = views[i].document;
            if (doc.isDirty) {
                paths.push(doc.file.path);
            }
        }
        
        return paths;
    };
    
    this.repoBrowser = function() {
        // summary:
        //      Open the repository browser for the current project.
        
        this._runTortoiseCommand('repobrowser','project','ErrorBrowserLoad');
    };

    this.commit = function(type) {
        // summary:
        //      Commit an item(s) to the repository.
        
        this._runTortoiseCommand('commit',type,'ErrorCommit');
    }
    
    this.update = function(type) {
        // summary:
        //      Update item(s) from the SVN repository.
        
        this._runTortoiseCommand('update',type,'ErrorUpdate');
        ko.places.viewMgr.view.refreshFullTreeView();
    };
    
    
    this.diff = function(type) {
        // summary:
        //      Compare item(s) with SVN versioned copy.
        
        this._runTortoiseCommand('diff',type,'ErrorDiff');
    };
    
    this.viewLog = function(type) {
        // summary:
        //      View the SVN log for item(s).
        
        this._runTortoiseCommand('log',type,'ErrorViewLog');
    };
    
    this.viewProperties = function(type) {
        // summary:
        //      View the SVN properties for item(s).
        
        this._runTortoiseCommand('properties',type,'ErrorViewProperties');
    };
    
    this.rename = function() {
        // summary:
        //      Raname the selected file
        
        this._runTortoiseCommand('rename','selectedpaths','ErrorRename');
        ko.places.viewMgr.view.refreshFullTreeView();
    };
    
    this.revert = function(type) {
        // summary:
        //      Raname the selected file
        
        this._runTortoiseCommand('revert',type,'ErrorRevert');
        ko.places.viewMgr.view.refreshFullTreeView();
    };
    
    this.delete = function(type) {
        // summary:
        //      Raname the selected file
        
        try {
            var path = this._getPath(type);
            this._runTortoiseCommand('remove',type,'ErrorDelete');
            var feedback = this._runTortoiseProc(path, 'commit');
            if (feedback.error == true) {
                Components.utils.reportError(feedback.value);
            }
            ko.places.viewMgr.view.refreshFullTreeView();
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle(ErrorDelete)
            );
        }
    };
    
    this._getPath = function(type) {
        // summary:
        //      Get the path for a given type.
        // type: string
        //      The type to get ActiveFile|Path|Project
        // returns: string
        //      The file path(s) to requested type
        
        var path = '';
        
        
        switch(type.toLowerCase()) {
            case 'activefile':
                path = this._getCurrentFilePath();
                break;
            case 'selectedpaths':
                path = this._getSelectedPaths().join('*');
                break;
            case 'project':
                path = this._getProjectPath();
                break;
        }
        
        return path;
    }
    
    this._runTortoiseProc = function(path,command) {
        // summary:
        //      Run a specified TortoiseProc command against the given path.
        // path: string
        //      The path to run the command against.
        // command: string
        //      The TortoiseProc command to run.
        // returns: object
        //      The result of running the command as supplied by _runCommand().
        
        var pathToProc = this._getPrefString('svnk.pathtoproc');
        if (pathToProc != '') {
            pathToProc = '"'+pathToProc+'\\TortoiseProc.exe" ';
        } else {
            pathToProc += 'TortoiseProc.exe ';
        }
        var cmd = pathToProc+'/command:'+command+' /path:\"'+path+'\"';
        var cwd = '';
        
        var response = this._runCommand(cmd,cwd,null,null);
        
        return response;
    };
    
    this._getCurrentFilePath = function() {
        //  summary:
        //      Get the path of the currently open file.
        //  returns: string

        try {
            return ko.views.manager.currentView.document.file.path;
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle("ErrorNoCurrentFile")
            );
            return false;
        }
    };
    
    this._getOpenFilePaths = function() {
        // summary:
        //      Get a list of all the open file paths.
        // returns: array
        //      An string-array of all the paths.
        
        var paths = new Array();
        var views = ko.views.manager.getAllViews();
    
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            paths.push(view.document.file.path);
        }
    };
    
    this._docIsOpen = function(path) {
        // summary:
        //      Test whether a file path is currently open for editing.
        // path: string
        //      The path to test.
        // returns: boolean
        
        var paths = this._getOpenFilePaths();
        for (cpath in paths) {
            if (path.toLowerCase() == cpath.toLowerCase()) {
                return true;
            }
        }
        
        return false;
    };
    
    this._getViewForPath = function(path) {
        // summary:
        //      Get the view object for a give path if it exists.
        // path: string
        //      The file-path of the view to return.
        // returns: object|boolean
        //      The view object or false if no open view found for path.
        
        var views = ko.views.manager.getAllViews();
        for (var i = 0; i < views.length; i++) {
            var view = views[i];
            if (path.toLowerCase() ==  view.document.file.path.toLowerCase()) {
                return view;
            }
        }
        return false;
    }
    
    this._getSelectedPaths = function() {
        // summary:
        //      Get the paths of the currently selected items in the places view.
        // returns: array
        //      The selected paths.
        
        try {
            var view = ko.places.viewMgr.view;
            var selectedIndices = ko.treeutils.getSelectedIndices(view, false);
            return selectedIndices.map( function(row) {
                var uri = view.getURIForRow(row);
                var path = ko.uriparse.URIToLocalPath(uri);
                return path;
            });
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle("ErrorNoSelectedPaths")
            );
            return false; 
        }
    };
    
    this._getProject = function() {
        //  summary:
        //      Get the project, the current file is attached to (will assume first
        //      which it find the current file in).
        //  returns: Object KomodoProject

        try {
            return ko.projects.manager.getCurrentProject();
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle("ErrorNoCurrentProject")
            );
            return false; 
        }
    };
    
    this._getProjectPath = function(project) {
        // summary:
        //      Get the path of a project.
        // project: object KomodoProject
        //      The project to get the path of.
        // returns: string
        
        if (project == undefined) {
            project = this._getProject();
        }
        var projectFile = project.getFile();
        return projectFile.dirName;
    };
    
    this._runCommand = function(cmd,cwd,env,c_input) {
        // summary:
        //      Run a command-prompt-style command and grab the output.
        // cmd: string
        //      The command to run.
        // cwd: string
        //      The working directory to use.
        // env: object|null
        //      The env variables to use.
        // c_input: object|null
        //      The input object to use (STDIN).
        // returns: object
        //      The content returned by the command in the format:
        //      { error: true|false, value: errorString|commadOutput }
        
        var RunService = Components.classes["@activestate.com/koRunService;1"].getService(Components.interfaces.koIRunService);
        var output = new Object();
        var error = new Object();
        
        try {
            var process = RunService.RunAndCaptureOutput(cmd,cwd,env,c_input,output,error);
            if (error.value != '') {
                return {error:true,value:error.value};
            } else {
                return {error:false,value:output.value};
            }
        } catch(e) {
            return {error:true,value:e};
        }
    };
};

// Global namespace violation?
var SVNK = new org.simpo.svnk();

} catch (e) {
    Components.utils.reportError(e);
}
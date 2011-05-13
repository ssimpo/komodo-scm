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
    
    this.stringBundle = function(stringToGet) {
        // summary:
        //      Get the requested string from the stringbundle locale.
        // stringToGet: string
        //      The string you are looking for.
        // returns: string
        //      The local string requested.
        
        return this.strings.GetStringFromName(stringToGet);
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
    
    this._getDirtyCommands = function(type) {
        // summary:
        //      Get a list of paths, which are dirty and being
        //      acted upon for current command
        // type: string
        //      The type to get ActiveFile|Path|Project
        // returns: array()
        //      The dirty paths
        
        var dirtyPaths = this._getDirtyPaths();
        var dirtyCommands = new Array();
        
        if (dirtyPaths.length > 0) {
            var paths = this._getPath(type).split('*');
            
            for (var i = 0; i < dirtyPaths.length; i++) {
                for (var ii = 0; ii < paths.length; ii++) {
                    if (this._pathContainsPath(paths[ii],dirtyPaths[i])) {
                        dirtyCommands.push(dirtyPaths[i]);
                        continue;
                    }
                }
            }
        }

        return dirtyCommands;
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
    
    this._pathContainsPath = function(path1,path2) {
        // summary:
        //      Check if a given path-string is contained within another path.
        // path1: string
        //      The 1st path-string, the one to search for.
        // path2: string
        //      The 2nd path-string, the one to search within.
        // returns: boolean
        
        if (path1 == path2) {
            return true;
        } else {
            if (path1.length <= path2.length) {
                if (path1 == path2.substr(0,path1.length)) {
                    return true;
                }
            }
        }
        
        return false;
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
    
    this._saveDirtyPaths = function() {
        // summary:
        //      Save all the current dirty paths.
        
        var views = ko.views.manager.getAllViews();
        for (var i = 0; i < views.length; i++) {
            var doc = views[i].document;
            if (doc.isDirty) {
                doc.save(true);
            }
        }
    };
    
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
    
    this._handleDirtyFiles = function(type) {
        // summary:
        //      Check for dirty files in the current paths for the command
        //      being issued.
        // type: string
        //      The type of command being issued (ie.
        //      activefile|project|selectedpaths).
        // returns: boolean
        //      Should the command be executed or not?
        
        var dirtyPaths = this._getDirtyCommands(type);
        
        if (dirtyPaths.length > 0) {
            var command = null;
            
            if (type == 'activefile') {
                command = this._reportDirtyActiveFile();
            } else {
                command =this._reportDirtyPaths(dirtyPaths);
            }
            
            return this._respondDirtyResponse(type,command);
        }
        
        return true;
    };
    
    this._respondDirtyResponse = function(type,command) {
        // summary:
        //      Respond to user input on dirty files.
        // type: string
        //      The type of command being issued (ie.
        //      activefile|project|selectedpaths).
        // command: string
        //      The user response (ie. save|ignore|cancel).
        // returns: boolean
        //      Should the command proceed or be aborted?
        
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
    
    this._reportDirtyActiveFile = function() {
        // summary
        //      Handle the active file being dirty.
        // returns: string
        //      The user response (ie. save|ignore|cancel).
        
        var chrome = 'chrome://svnk/content/dialogs/saveYesNo.xul';
        var title = 'Unsaved information';
        var options = 'modal=yes,centerscreen=yes';
        var returner = {'command':null};
        
        var msg = '<html:b>'+this.stringBundle('DialogActiveFileDirty')+'</html:b>';
        openDialog(chrome,title,options,returner,msg);
        
        return returner.command;
    };
    
    this._reportDirtyPaths = function(paths) {
        // summary
        //      Handle the dirty files that are being acted upon by
        //      the current command.
        // paths: array
        //      The paths being acted upon, which are dirty.
        // returns: string
        //      The user response (ie. save|ignore|cancel).
        
        var chrome = 'chrome://svnk/content/dialogs/saveYesNo.xul';
        var title = 'Unsaved information';
        var options = 'modal=yes,centerscreen=yes';
        var returner = {'command':null};
        
        if (paths.length > 0) {
            var msg = '<html:b>'+this.stringBundle('DialogActiveFilesDirty1') + '</html:b><html:ul>'
            for (var i = 0; i < paths.length; i++) {
                msg += '<html:li>'+paths[i]+'</html:li>';
            }
            msg += '</html:ul><html:i>' + this.stringBundle('DialogActiveFilesDirty2') + '</html:i><html:br />'
            openDialog(chrome,title,options,returner, msg);
        }
        
        return returner.command;
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
            var paths = this._getPath(type);
            if (this._handleDirtyFiles(type)) {
                var feedback = this._runTortoiseProc(paths, command);
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
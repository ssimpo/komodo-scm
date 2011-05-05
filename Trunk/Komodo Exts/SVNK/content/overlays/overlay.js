// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.5


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
    var error = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
    
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
    
    this.repoBrowser = function() {
        // summary:
        //      Open the repository browser for the current project.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var path = this._getPath('project');
            var feedback = this._runTortoiseProc(path,'repobrowser');
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle("ErrorCommit")
            );
        }
    };

    this.commit = function(type) {
        // summary:
        //      Commit an item(s) to the repository.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var path = this._getPath(type);
            var feedback = this._runTortoiseProc(path,'commit');
        } catch(e) {
            Components.utils.reportError(
                this.stringBundle("ErrorCommit")
            );
        }
    }
    
    this.update = function(type) {
        // summary:
        //      Update item(s) from the SVN repository.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var path = this._getPath(type);
            var feedback = this._runTortoiseProc(path,'update');
        } catch (e) {
            Components.utils.reportError(
                this.stringBundle("ErrorUpdate")
            );
        }
    };
    
    this.diff = function(type) {
        // summary:
        //      Compare item(s) with SVN versioned copy.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        this.logger.logStringMessage('diff');
        try {
            var path = this._getPath(type);
            var feedback = this._runTortoiseProc(path,'diff');
        } catch (e) {
            Components.utils.reportError(
                this.stringBundle("ErrorDiff")
            );
        }
    };
    
    this.viewLog = function(type) {
        // summary:
        //      View the SVN log for item(s).
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var path = this._getPath(type);
            var feedback = this._runTortoiseProc(path,'log');
        } catch (e) {
            Components.utils.reportError(
                this.stringBundle("ErrorViewLog")
            );
        }
    };
    
    this.viewProperties = function(type) {
        // summary:
        //      View the SVN properties for item(s).
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var path = this._getPath(type);
            var feedback = this._runTortoiseProc(path,'properties');
        } catch (e) {
            Components.utils.reportError(
                this.stringBundle("ErrorViewProperties")
            );
        }
    };
    
    this.rename = function() {
        // summary:
        //      Raname the selected file
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        try {
            var paths = this._getSelectedPaths();
            var feedback = this._runTortoiseProc(paths.join('*'),'rename');
            ko.places.viewMgr.view.refreshFullTreeView();
        } catch (e) {
            alert(this.stringBundle("ErrorCommitSelect"));
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
if (!org) var org={};
if (!org.simpo) org.simpo={};


org.simpo.koSVN = {
    repoBrowser: function() {
        // summary:
        //      Open the repository browser for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            var feedback = this._runTortoiseProc(path,'repobrowser');
        } else {
            alert("Could not load the browser.");
        }
    },
    commitPath: function() {
        // summary:
        //      Commit the path(s) selected in the current places view to the
        //      SVN repository.
        
        try {
            var paths = this._getSelectedPaths();
            var feedback = this._runTortoiseProc(paths.join('*'),'commit');
        } catch (e) {
            alert("Could not commit the selected content.")
        }
    },
    commitProject: function() {
        // summary:
        //      Open the commit interface for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            var feedback = this._runTortoiseProc(path,'commit');
        } else {
            alert("Could not commit the current project.");
        }
    },
    compareDiff: function() {
        // summary:
        //      Compare the file selected in the current places view with it's
        //      SVN versioned copy.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'diff');
            }
        } catch (e) {
            alert("Failed to compare the selected file.")
        }
    },
    compareDiffActiveFile: function() {
        // summary:
        //      Compare the current file to its versioned copy in SVN.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {    
                var feedback = this._runTortoiseProc(path,'diff');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    },
    viewLog: function() {
        // summary:
        //      View the SVN log for selected file in the current places view.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'log');
            }
        } catch (e) {
            alert("Failed to view SVN Log for file.")
        }
    },
    viewLogActiveFile: function() {
        // summary:
        //      View the SVN log for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                 var feedback = this._runTortoiseProc(path,'log');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    },
    viewProperties: function() {
        // summary:
        //      View the SVN properties for selected file in the
        //      current places view.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'properties');
            }
        } catch (e) {
            alert("Failed to view SVN properties for file.")
        }
    },
    viewPropertiesActiveFile: function() {
        // summary:
        //      View the SVN file properties for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                var feedback = this._runTortoiseProc(path,'properties');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    },
    _runTortoiseProc: function(path,command) {
        // summary:
        //      Run a specified TortoiseProc command against the given path.
        // path: string
        //      The path to run the command against.
        // command: string
        //      The TortoiseProc command to run.
        
        var RunService = Components.classes["@activestate.com/koRunService;1"].getService(Components.interfaces.koIRunService);
        var cmd = 'TortoiseProc.exe /command:'+command+' /path:\"'+path+'\"';
        var output = new Object();
        var error = new Object();
            
        try {
            var process = RunService.RunAndCaptureOutput(cmd,'',null,null,output,error);
            if (error.value != '') {
                return {error:true,value:error.value};
            } else {
                return {error:false,value:output.value};
            }
        } catch(e) {
            return {error:true,value:e};
        }
    },
    _getCurrentFilePath: function() {
        //  summary:
        //      Get the path of the currently open file.
        //  returns: string

        try {
            return ko.views.manager.currentView.document.file.path;
        } catch(e) {
            return false;   
        }
    },
    _getSelectedPaths: function() {
        // summary:
        //      Get the paths of the currently selected items in the places view.
        
        var view = ko.places.viewMgr.view;
        var selectedIndices = ko.treeutils.getSelectedIndices(view, false);
        return selectedIndices.map( function(row) {
            var uri = view.getURIForRow(row);
            var path = ko.uriparse.URIToLocalPath(uri);
            return path;
        });
    },
    _getProject: function() {
        //  summary:
        //      Get the project, the current file is attached to (will assume first
        //      which it find the current file in).
        //  returns: Object KomodoProject

        try {
            return ko.projects.manager.getCurrentProject();
        } catch(e) {
            return false;   
        }
    },
    _getProjectPath: function(project) {
        // summary:
        //      Get the path of a project.
        // project: object KomodoProject
        //      The project to get the path of.
        // returns: string
    
        var projectFile = project.getFile();
        return projectFile.dirName;
    }
};
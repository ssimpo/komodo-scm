if (!org) var org={};
if (!org.simpo) org.simpo={};


org.simpo.koSVN = function() {
    //public object returned by this function
    var pub = {};
    
    pub.repoBrowser = function() {
        // summary:
        //      Open the respository browser for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            this._runTortoiseProc(path,'repobrowser');
        } else {
            alert("Could not load the browser.");
        }
    };
    
    pub.commitProject = function() {
        // summary:
        //      Open the commit interface for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            this._runTortoiseProc(path,'commit');
        } else {
            alert("Could not load the browser.");
        }
    };
    
    pub.compareDiff = function() {
        // summary:
        //      Compare the current file to its versioned copy in SVN
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {    
                this._runTortoiseProc(path,'diff');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub.viewLog = function() {
        // summary:
        //      View the SVN log for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                this._runTortoiseProc(path,'log');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub.viewProperties = function() {
        // summary:
        //      View the SVN file properties for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                this._runTortoiseProc(path,'properties');
            } else {
                alert("Could not find an active document");
            }
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub._runTortoiseProc = function(path,command) {
        // summary:
        //      Run a specified TortoiseProc command against the given path.
        // path: string
        //      The path to run the command against.
        // command: string
        //      The TortoiseProc command to run
        
            ko.run.runEncodedCommand(window, 'TortoiseProc.exe /command:'+command+' /path:\"'+path+'\" {\'cwd\': u\'%p\'}');
    }
    
    pub._getCurrentFilePath = function() {
        //  summary:
        //      Get the path of the currently open file
        //  returns: string

        try {
            return ko.views.manager.currentView.document.file.path;
        } catch(e) {
            return false;   
        }
    };
    
    pub._getProject = function() {
        //  summary:
        //      Get the project, the current file is attached to (will assume first
        //      which it find the current file in).
        //  returns: Object KomodoProject

        try {
            return ko.projects.manager.getCurrentProject();
        } catch(e) {
            return false;   
        }
    };
    
    pub._getProjectPath = function(project) {
        // summary:
        //      Get the path of a project.
        // project: object KomodoProject
        //      The project to get the path of.
        // returns: string
    
        var projectFile = project.getFile();
        return projectFile.dirName;
    };
    
    return pub;
} ();
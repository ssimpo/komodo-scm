//the advice given at http://blogger.ziesemer.com/2007/10/respecting-javascript-global-namespace.html has been followed
if (!org) var org={};
if (!org.simpo) org.simpo={};


org.simpo.koSVN = function() {
    //public object returned by this function
    var pub = {};
    
    pub.repoBrowser = function() {
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            this._runTortoiseProc(path,'repobrowser');
        } else {
            alert("Could not load the browser.");
        }
    };
    
    pub.commitProject = function() {
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            this._runTortoiseProc(path,'commit');
        } else {
            alert("Could not load the browser.");
        }
    };
    
    pub.compareDiff = function() {
        try {
            var path = ko.views.manager.currentView.document.file.path;
            this._runTortoiseProc(path,'diff');
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub.viewLog = function() {
        try {
            var path = ko.views.manager.currentView.document.file.path;
            this._runTortoiseProc(path,'log');
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub.viewProperties = function() {
        try {
            var path = ko.views.manager.currentView.document.file.path;
            this._runTortoiseProc(path,'properties');
        } catch(e) {
            alert("No current file.")
        }
    }
    
    pub._runTortoiseProc = function(path,command) {
            ko.run.runEncodedCommand(window, 'TortoiseProc.exe /command:'+command+' /path:\"'+path+'\" {\'cwd\': u\'%p\'}');
    }
    
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
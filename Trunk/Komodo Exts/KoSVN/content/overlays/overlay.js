//the advice given at http://blogger.ziesemer.com/2007/10/respecting-javascript-global-namespace.html has been followed
if (!org) var org={};
if (!org.simpo) org.simpo={};


org.simpo.koSVN = function() {
    //public object returned by this function
    var pub = {};
    
    pub.repoBrowser = function() {
        alert("HELLO WORLD");
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
    
            ko.run.runEncodedCommand(window, 'TortoiseProc.exe /command:repobrowser /path:\"'+path+'\" {\'cwd\': u\'%p\'}');
        } else {
            alert("Could not find current file in open projects.")
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
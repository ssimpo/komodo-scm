// summary:
//      Main JavaScript content for SVN-K.
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

org.simpo.svnk.main = function() {
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
        
        this._runTortoiseCommand('repobrowser','project_then_directory','ErrorBrowserLoad');
    };
    
    this.repoStatus = function() {
        // summary:
        //      Open the repository browser for the current project.
        
        this._runTortoiseCommand('repostatus','project_then_directory','ErrorBrowserLoad');
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
        
        //this._runTortoiseCommand('log',type,'ErrorViewLog');
    };
    
    this.createMenu = function(menuNode,command) {
        var lookup = {};
        this._removeChildNodes(menuNode);
        this._addProjectsToMenu(menuNode,lookup,command);
        this._addOpenFilesToMenu(menuNode,lookup,command);
    };
    
    this.menuItemClick = function(item,command) {
        this.logger.logStringMessage(item.value);
        this.logger.logStringMessage(command);
        
        try {
            //if (this._handleDirtyFiles(type)) {
                var feedback = this._runTortoiseProc(item.value, command);
                if (feedback.error == true) {
                    this.logger.logStringMessage(feedback.value);
                }
            //}
        } catch(e) {
            this.logger.logStringMessage(
                "Unknown Error"
            );
        }
    };
    
    this._addOpenFilesToMenu = function(menuNode,lookup,command) {
        var md5Parser = new org.simpo.md5();
        var views = ko.views.manager.getAllViews();
        var seperator = (menuNode.childNodes.length < 1);
        
        for (var i = 0; i < views.length; i++) {
            var file = this._getCurrentDocument(views[i]).file;
            var name = file.baseName;
            var path = file.path;
            
            var id = 'i' + md5Parser.calcMD5(path);
            if (!(id in lookup)) {
                lookup[id] = true;
                if (!seperator) {
                    this._appendMenuSeperator(menuNode);
                    seperator = true;
                }
                
                menuNode.appendChild(
                    this._createMenuItem(command,name,path,'File',path)
                );
            }
        }
    };
    
    this._addProjectsToMenu = function(menuNode,lookup,command) {
        var md5Parser = new org.simpo.md5();
        var projects = this._getProjects();
        var seperator = (menuNode.childNodes.length < 1);
        
        for (var i=0; i < projects.length; i++) {
            var name = this._getProjectName(projects[i]);
            var path = this._getProjectPath(projects[i]);
            
            var id = 'i' + md5Parser.calcMD5(path);
            if (!(id in lookup)) {
                lookup[id] = true;
                if (!seperator) {
                    this._appendMenuSeperator(menuNode);
                    seperator = true;
                }
                
                menuNode.appendChild(
                    this._createMenuItem(command,name,path,'Project',path)
                );
            }
        }
    };
    
    this._appendMenuSeperator = function(menuNode) {
        var doc = this._getCurrentDocument(ko.windowManager.getMainWindow());
        menuNode.appendChild(doc.createElement('menuseparator'));
    };
    
    this._createMenuItem = function(command,label,value,icon,tooltip) {
        var doc = this._getCurrentDocument(ko.windowManager.getMainWindow());
        
        var item = doc.createElement('menuitem');
        item.setAttribute('label',label);
        item.setAttribute('value',value);
        if ((icon !== null) && (icon !== undefined)) {
            item.setAttribute('class','menuitem-iconic SVNK-'+icon+'-Icon');
        }
        if ((tooltip !== null) && (tooltip !== undefined)) {
            item.setAttribute('tooltiptext',tooltip);
        }
        item.setAttribute('onclick','SVNK.menuItemClick(this,"'+command+'");');
        
        return item;
    };
    
    this._removeChildNodes = function(node) {
        if ((node === undefined) || (node === null)) {
            return;
        }
        
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild());
        }
    };
    
    this.viewProperties = function(type) {
        // summary:
        //      View the SVN properties for item(s).
        
        this._runTortoiseCommand('properties',type,'ErrorViewProperties');
    };
    
    this.rename = function() {
        // summary:
        //      Rename the selected file
        
        this._runTortoiseCommand('rename','selectedpaths','ErrorRename');
        ko.places.viewMgr.view.refreshFullTreeView();
    };
    
    this.revert = function(type) {
        // summary:
        //      Rename the selected file
        
        this._runTortoiseCommand('revert',type,'ErrorRevert');
        ko.places.viewMgr.view.refreshFullTreeView();
    };
    
    this.delete = function(type) {
        // summary:
        //      Rename the selected file
        
        try {
            var path = this._getPath(type);
            this._runTortoiseCommand('remove',type,'ErrorDelete');
            var feedback = this._runTortoiseProc(path, 'commit');
            if (feedback.error == true) {
                this.logger.logStringMessage(feedback.value);
            }
            ko.places.viewMgr.view.refreshFullTreeView();
        } catch(e) {
            this.logger.logStringMessage(
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
            case 'activedirectory':
                path = this._getCurrentDirectoryPath();
                break;
            case 'activefile':
                path = this._getCurrentFilePath();
                break;
            case 'selectedpaths':
                path = this._getSelectedPaths().join('*');
                break;
            case 'project':
                path = this._getProjectPath();
                break;
            case 'project_then_directory':
                if (this._hasActiveProject()) {
                    path = this._getProjectPath();
                } else {
                    path = this._getCurrentDirectoryPath();
                }
                break;
            case 'activefile_then_project':
                path = this._getCurrentFilePath();
                if (!path) {
                    path = this._getProjectPath();
                }
                break;
        }
        
        return path;
    };
    
    this._getCurrentDocument = function(root) {
        // summary:
        //      Get the document for the supplied object - compatibility method so
        //      version 5 API and version 6 API can both be used.
        // returns: object
        
        try {
            if (root.document) {
                return root.document;
            } else {
                return root.koDoc;
            }
        } catch(e) {
            return false;
        }
    };
    
    this._getCurrentFilePath = function() {
        //  summary:
        //      Get the path of the currently open file.
        //  returns: string

        try {
            return this._getCurrentDocument(ko.views.manager.currentView).file.path;
        } catch(e) {
            this.logger.logStringMessage(
                this.stringBundle("ErrorNoCurrentFile")
            );
            return false;
        }
    };
    
    this._getCurrentDirectoryPath = function() {
        //  summary:
        //      Get the directory path of the currently open file.
        //  returns: string

        try {
            return this._getCurrentDocument(ko.views.manager.currentView).file.dirName;
        } catch(e) {
            this.logger.logStringMessage(
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
            this.logger.logStringMessage(
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
            paths.push(this._getCurrentDocument(view).file.path);
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
            var doc = this._getCurrentDocument(views[i]);
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
            if (path.toLowerCase() ==  this._getCurrentDocument(view).file.path.toLowerCase()) {
                return view;
            }
        }
        return false;
    };
    
    this._hasActiveProject = function() {
        //  summary:
        //      Test whether there is a project or not.
        //  returns: boolean

        try {
            var project = ko.projects.manager.getCurrentProject();
            if (project != null) {
                return true;
            } else {
                return false;
            }
        } catch(e) {
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
            this.logger.logStringMessage(
                this.stringBundle("ErrorNoCurrentProject")
            );
            return false; 
        }
    };
    
    this._getProjects = function() {
        var projectsTree = '';
        if (ko.places.projects_SPV) {
            projectsTree = ko.places.projects_SPV.projectsTree.view;
        } else {
            projectsTree = ko.places.projects.projectsTree.view;
        }
        
        var projects = new Array();
        for (i=0; i < projectsTree.rowCount; i++) {
            projects.push(projectsTree.getRowItem(i).project);
        }
        
        return projects;
    };
    
    this._getProjectName = function(project) {
        if (project == undefined) {
            project = this._getProject();
        }
        
        var name = project.name.replace('.komodoproject','');
        name = name.replace('.kpf','');
        
        return name;
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
        if (project) {
            var projectFile = project.getFile();
            return projectFile.dirName;
        } else {
            return '';
        }
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
            var doc = this._getCurrentDocument(views[i]);
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
                    this._getCurrentDocument(ko.views.manager.currentView).save(true);
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
        //      The error reference to report if it fails.
        
        try {
            var paths = this._getPath(type);
            if (this._handleDirtyFiles(type)) {
                var feedback = this._runTortoiseProc(paths, command);
                if (feedback.error == true) {
                    this.logger.logStringMessage(feedback.value);
                }
            }
        } catch(e) {
            this.logger.logStringMessage(
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
        
        this.logger.logStringMessage(cmd);
        
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

org.simpo.md5 = function() {
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 */

    this.hex_chr = '0123456789abcdef';
    
    this.rhex = function(num) {
        var str = "";
        for (var j = 0; j <= 3; j++)
        str += this.hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) + this.hex_chr.charAt((num >> (j * 8)) & 0x0F);
        return str;
    };

    this.str2blks_MD5 = function(str) {
        var nblk = ((str.length + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (var i = 0; i < str.length; i++)
        blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
        blks[i >> 2] |= 0x80 << ((i % 4) * 8);
        blks[nblk * 16 - 2] = str.length * 8;
        return blks;
    };
    
    this.add = function(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };
 
    this.rol = function(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    };
    
    this.cmn = function(q, a, b, x, s, t) {
        return this.add(this.rol(this.add(this.add(a, q), this.add(x, t)), s), b);
    };
    
    this.ff = function(a, b, c, d, x, s, t) {
        return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };
    
    this.gg = function(a, b, c, d, x, s, t) {
        return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };
    
    this.hh = function(a, b, c, d, x, s, t) {
        return this.cmn(b ^ c ^ d, a, b, x, s, t);
    };
    
    this.ii = function(a, b, c, d, x, s, t) {
        return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
    };

    this.calcMD5 = function(str) {
        var x = this.str2blks_MD5(str);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            
            a = this.ff(a, b, c, d, x[i+ 0], 7 , -680876936);
            d = this.ff(d, a, b, c, x[i+ 1], 12, -389564586);
            c = this.ff(c, d, a, b, x[i+ 2], 17,  606105819);
            b = this.ff(b, c, d, a, x[i+ 3], 22, -1044525330);
            a = this.ff(a, b, c, d, x[i+ 4], 7 , -176418897);
            d = this.ff(d, a, b, c, x[i+ 5], 12,  1200080426);
            c = this.ff(c, d, a, b, x[i+ 6], 17, -1473231341);
            b = this.ff(b, c, d, a, x[i+ 7], 22, -45705983);
            a = this.ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
            d = this.ff(d, a, b, c, x[i+ 9], 12, -1958414417);
            c = this.ff(c, d, a, b, x[i+10], 17, -42063);
            b = this.ff(b, c, d, a, x[i+11], 22, -1990404162);
            a = this.ff(a, b, c, d, x[i+12], 7 ,  1804603682);
            d = this.ff(d, a, b, c, x[i+13], 12, -40341101);
            c = this.ff(c, d, a, b, x[i+14], 17, -1502002290);
            b = this.ff(b, c, d, a, x[i+15], 22,  1236535329);
            
            a = this.gg(a, b, c, d, x[i+ 1], 5 , -165796510);
            d = this.gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
            c = this.gg(c, d, a, b, x[i+11], 14,  643717713);
            b = this.gg(b, c, d, a, x[i+ 0], 20, -373897302);
            a = this.gg(a, b, c, d, x[i+ 5], 5 , -701558691);
            d = this.gg(d, a, b, c, x[i+10], 9 ,  38016083);
            c = this.gg(c, d, a, b, x[i+15], 14, -660478335);
            b = this.gg(b, c, d, a, x[i+ 4], 20, -405537848);
            a = this.gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
            d = this.gg(d, a, b, c, x[i+14], 9 , -1019803690);
            c = this.gg(c, d, a, b, x[i+ 3], 14, -187363961);
            b = this.gg(b, c, d, a, x[i+ 8], 20,  1163531501);
            a = this.gg(a, b, c, d, x[i+13], 5 , -1444681467);
            d = this.gg(d, a, b, c, x[i+ 2], 9 , -51403784);
            c = this.gg(c, d, a, b, x[i+ 7], 14,  1735328473);
            b = this.gg(b, c, d, a, x[i+12], 20, -1926607734);
            
            a = this.hh(a, b, c, d, x[i+ 5], 4 , -378558);
            d = this.hh(d, a, b, c, x[i+ 8], 11, -2022574463);
            c = this.hh(c, d, a, b, x[i+11], 16,  1839030562);
            b = this.hh(b, c, d, a, x[i+14], 23, -35309556);
            a = this.hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
            d = this.hh(d, a, b, c, x[i+ 4], 11,  1272893353);
            c = this.hh(c, d, a, b, x[i+ 7], 16, -155497632);
            b = this.hh(b, c, d, a, x[i+10], 23, -1094730640);
            a = this.hh(a, b, c, d, x[i+13], 4 ,  681279174);
            d = this.hh(d, a, b, c, x[i+ 0], 11, -358537222);
            c = this.hh(c, d, a, b, x[i+ 3], 16, -722521979);
            b = this.hh(b, c, d, a, x[i+ 6], 23,  76029189);
            a = this.hh(a, b, c, d, x[i+ 9], 4 , -640364487);
            d = this.hh(d, a, b, c, x[i+12], 11, -421815835);
            c = this.hh(c, d, a, b, x[i+15], 16,  530742520);
            b = this.hh(b, c, d, a, x[i+ 2], 23, -995338651);
            
            a = this.ii(a, b, c, d, x[i+ 0], 6 , -198630844);
            d = this.ii(d, a, b, c, x[i+ 7], 10,  1126891415);
            c = this.ii(c, d, a, b, x[i+14], 15, -1416354905);
            b = this.ii(b, c, d, a, x[i+ 5], 21, -57434055);
            a = this.ii(a, b, c, d, x[i+12], 6 ,  1700485571);
            d = this.ii(d, a, b, c, x[i+ 3], 10, -1894986606);
            c = this.ii(c, d, a, b, x[i+10], 15, -1051523);
            b = this.ii(b, c, d, a, x[i+ 1], 21, -2054922799);
            a = this.ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
            d = this.ii(d, a, b, c, x[i+15], 10, -30611744);
            c = this.ii(c, d, a, b, x[i+ 6], 15, -1560198380);
            b = this.ii(b, c, d, a, x[i+13], 21,  1309151649);
            a = this.ii(a, b, c, d, x[i+ 4], 6 , -145523070);
            d = this.ii(d, a, b, c, x[i+11], 10, -1120210379);
            c = this.ii(c, d, a, b, x[i+ 2], 15,  718787259);
            b = this.ii(b, c, d, a, x[i+ 9], 21, -343485551);
            
            a = this.add(a, olda);
            b = this.add(b, oldb);
            c = this.add(c, oldc);
            d = this.add(d, oldd);
        }
        return this.rhex(a) + this.rhex(b) + this.rhex(c) + this.rhex(d);
    };
};

// Global namespace violation?
var SVNK = new org.simpo.svnk.main();

} catch (e) {
    this.logger.logStringMessage(e);
}
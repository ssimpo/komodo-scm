// summary:
//      Main javascript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.4

if (!org) var org = {};
if (!org.simpo) org.simpo = {};

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
    this.strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://svnk/locale/main.properties");
    
    this.stringBundle = function(stringToGet) {
        // summary:
        //      Get the requested string from the stringbundle locale.
        // stringToGet: string
        //      The string you are looking for
        // returns: string
        //      The local string requested
        
        return this.strings.GetStringFromName(stringToGet);
    };
    
    this.repoBrowser = function() {
        // summary:
        //      Open the repository browser for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            var feedback = this._runTortoiseProc(path,'repobrowser');
        } else {
            alert(this.stringBundle("ErrorBrowserLoad"));
        }
    };
    
    this.commitPath = function() {
        // summary:
        //      Commit the path(s) selected in the current places view to the
        //      SVN repository.
        
        try {
            var paths = this._getSelectedPaths();
            var feedback = this._runTortoiseProc(paths.join('*'),'commit');
        } catch (e) {
            alert(this.stringBundle("ErrorCommitSelect"));
        }
    };
    
    this.commitProject = function() {
        // summary:
        //      Open the commit interface for the current project.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            var feedback = this._runTortoiseProc(path,'commit');
        } else {
            alert(this.stringBundle("ErrorCommitProject"));
        }
    };
    
    this.compareDiff = function() {
        // summary:
        //      Compare the file selected in the current places view with it's
        //      SVN versioned copy.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'diff');
            }
        } catch (e) {
            alert(this.stringBundle("ErrorCompareSelected"));
        }
    };
    
    this.compareDiffActiveFile = function() {
        // summary:
        //      Compare the current file to its versioned copy in SVN.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {    
                var feedback = this._runTortoiseProc(path,'diff');
            } else {
                alert(this.stringBundle("ErrorFindActiveDocument"));
            }
        } catch(e) {
            alert(this.stringBundle("ErrorNoCurrentFile"));
        }
    };
    
    this.viewLog = function() {
        // summary:
        //      View the SVN log for selected file in the current places view.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'log');
            }
        } catch (e) {
            alert(this.stringBundle("ErrorFailedSVNLog"));
        }
    };
    
    this.viewLogActiveFile = function() {
        // summary:
        //      View the SVN log for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                 var feedback = this._runTortoiseProc(path,'log');
            } else {
                alert(this.stringBundle("ErrorFindActiveDocument"));
            }
        } catch(e) {
            alert(this.stringBundle("ErrorNoCurrentFile"));
        }
    };
    
    this.viewProperties = function() {
        // summary:
        //      View the SVN properties for selected file in the
        //      current places view.
        
        try {
            var paths = this._getSelectedPaths();
            for (i in paths) {
                var feedback = this._runTortoiseProc(paths[i],'properties');
            }
        } catch (e) {
            alert(this.stringBundle("ErrorFailedSVNProperties"));
        }
    };
    
    this.viewPropertiesActiveFile = function() {
        // summary:
        //      View the SVN file properties for the current file.
        
        try {
            var path = this._getCurrentFilePath();
            if (path) {
                var feedback = this._runTortoiseProc(path,'properties');
            } else {
                alert(this.stringBundle("ErrorFindActiveDocument"));
            }
        } catch(e) {
            alert(this.stringBundle("ErrorNoCurrentFile"));
        }
    };
    
    this._runTortoiseProc = function(path,command) {
        // summary:
        //      Run a specified TortoiseProc command against the given path.
        // path: string
        //      The path to run the command against.
        // command: string
        //      The TortoiseProc command to run.
        var cmd = 'TortoiseProc.exe /command:'+command+' /path:\"'+path+'\"';
        var cwd = '';
        
        var response = this._runCommand(cmd,cwd,null,null);
        
        return response;
    };
    
    this._runSvnCommand = function(path,command,switches) {
        // summary:
        //      Run a specified SVN command against the given path (with given switches).
        // path: string
        //      The path to run the command against.
        // command: string
        //      The TortoiseProc command to run.
        // switches: string
        //      The switches to add to the SVN command.
        
        var cmd = 'svn.exe '+command+' '+switches+' "'+path+'\"';
        var cwd = 'C:\\Program Files\\Subversion\\';
        
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
            return false;   
        }
    };
    
    this._getSelectedPaths = function() {
        // summary:
        //      Get the paths of the currently selected items in the places view.
        
        var view = ko.places.viewMgr.view;
        var selectedIndices = ko.treeutils.getSelectedIndices(view, false);
        return selectedIndices.map( function(row) {
            var uri = view.getURIForRow(row);
            var path = ko.uriparse.URIToLocalPath(uri);
            return path;
        });
    };
    
    this._getProject = function() {
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
    
    this._getProjectPath = function(project) {
        // summary:
        //      Get the path of a project.
        // project: object KomodoProject
        //      The project to get the path of.
        // returns: string
    
        var projectFile = project.getFile();
        return projectFile.dirName;
    };
    
    this._currentViewUpdated = function(event) {
        var path = ko.uriparse.URIToLocalPath(event.originalTarget.getURI());
        var response = this._runSvnCommand(path,'log','');
        
        if (!response.error) {
            try {
                var logParser = new org.simpo.svnk.logParser(response.value);
            } catch(e) { Components.utils.reportError(e); }
            
            //var log = org.simpo.svnk.logParser._toUnixText(response.value);
            //var blocks = org.simpo.svnk.logParser._getLogSections(log);
            //var entries = org.simpo.svnk.logParser._getLogEntries(log);
            
            //Components.utils.reportError(logParser.entries[0].block);
            //Components.utils.reportError("REVISION: " + logParser.entries[0].revision + "\nUSER: " + logParser.entries[0].user + "\nDATE: " + logParser.entries[0].date);
            
            try {
                var logView = new org.simpo.svnk.logView();
            } catch(e) { Components.utils.reportError(e); }
            
            try {
                logView.addItem(logParser.entries);
            } catch(e) { Components.utils.reportError(e); }
        } else {
            Components.utils.reportError(response.value);
        }
        
        //alert(response.value);
    };
    
    this._runCommand = function(cmd,cwd,env,c_input) {
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
    
    window.addEventListener(
        'current_view_changed',
        this._currentViewUpdated.bind(this),
        false
    );
    
};

org.simpo.svnk.logView = function() {
    this.view = document.getElementById("SVNK-tab-logpanel-tree-content");
    
    this.addItem = function(log) {
        for (var i = 0;i < log.length; i++) {
            var item = document.createElement("treeitem");
            item.container = true;
            item.open = true;
            this.view.appendChild(item);
    
            content = new Array(
                log[i].revision,
                log[i].user,
                log[i].date,
                log[i].block
            );
            
            this.addRow(item,content);
        }
    };
    
    this.addRow = function(item,content) {
        var row = document.createElement("treerow");
        item.appendChild(row);
            
        for (var i = 0; i < content.length; i++) {
            item.appendChild(row);
            this.addCell(row,content[i]);
        }
    };
    
    this.addCell = function(row,content) {
        var cell = document.createElement("treecell");
        cell.setAttribute("label", content);
        row.appendChild(cell);
        //Components.utils.reportError(content);
    };
};

org.simpo.svnk.logParser = function(log) {
    
    this._getLogEntries = function(log) {
        var blocks = this._getLogSections(log);
        var entries = new Array();
        var j = 0;
            
        for (i in blocks) {
            var entry = blocks[i];
            if (entry != '') {
                entries[j] = {
                    'block':entry,
                    'revision':this._getRevisionNumber(entry),
                    'user':this._getUser(entry),
                    'date':this._getRevisionDate(entry)
                };
                j++;
            }
        }
        
        return entries;
    };
    
    this._getRevisionNumber = function(block) {
        try {
            var result = block.match(/^r(\d+) \|/);
            result = result[1];
            result++;result--;
            return result;
        } catch(e) {
            return false;
        }
    };
    
    this._getRevisionDate = function(block) {
        try {
            var result = block.match(/\| (\d+\-\d+-\d+ \d+:\d+:\d+ (\+|\-)\d+)/);
            return result[1];
        } catch(e) {
            return false;
        }
    };
    
    this._getUser = function(block) {
        try {
            var result = block.match(/\| (\w+) \|/);
            return result[1];
        } catch(e) {
            return false;
        }
    };
    
    this._toUnixText = function(text) {
        text.replace(/\r\n/g,"\n");
        text.replace(/[\r\f]/g,"\n");
        return text;
    };
    
    this._getLogSections = function(log) {
        var blocks = log.split(/^-{10,}$/mg);
        for (i in blocks) {
            blocks[i] = blocks[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
        return blocks;
    };
    
    this.log = this._toUnixText(log);
    this.entries = this._getLogEntries(this.log);
};

var SVNK = new org.simpo.svnk();


} catch (e) {
    Components.utils.reportError(e);
}



/*window.addEventListener(
    'current_view_changed',
    org.simpo.svnk._currentViewUpdated,
    false
);*/
// summary:
//      Main JavaScript content for SVN-K.
// author:
//      Stephen Simpson <me@simpo.org>
// license:
//      LGPL <http://www.gnu.org/licenses/lgpl.html>
// version:
//      1.0.4


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
    this.entries = [];
    
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
        var project = this._getProject();
        if (project) {
            var path = this._getProjectPath(project);
            var feedback = this._runTortoiseProc(path,'commit');
        } else {
            alert(this.stringBundle("ErrorCommitProject"));
        }
    };
    
    this.compareEntry = function() {
        
    };
    
    this.compareDiff = function() {
        // summary:
        //      Compare the file selected in the current places view with it's
        //      SVN versioned copy.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
    
    this._getCurrentRevisionNo = function() {
        var tree = document.getElementById("SVNK-logTree");
        var view = tree.contentView;
        var treeIndex = tree.currentIndex;
        var revisionColumn = tree.columns.getNamedColumn("SVNK-logTree-col-revision");
        return view.getCellText(treeIndex,revisionColumn).valueOf();
    }
    
    this.viewEntry = function() {
        try {
            var tree = document.getElementById("SVNK-logTree");
            var treeIndex = tree.currentIndex;
            var currentRevisionNumber = this._getCurrentRevisionNo();
            
            var currentEntry = this.entries[treeIndex];
            openDialog(
                'chrome://svnk/content/viewLogEntry.xul',
                'Revision No.'+currentEntry.revision.toString(),
                'chrome,modal,centerscreen',
                currentEntry
            );
            
        } catch(e) {
            alert("ERROR");
        }
    };
    
    this.viewLog = function() {
        // summary:
        //      View the SVN log for selected file in the current places view.
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // todo:
        //      Parse and deal with any feedback from running the command.
        
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
        // returns: object
        //      The result of running the command as supplied by _runCommand().
        
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
        // returns: object
        //      The result of running the command as supplied by _runCommand(). 
        
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
        // returns: array
        //      The selected paths.
        
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
        // summary:
        //      Current in-view file has changed, update any tabs in response.
        // event: object DOMEvent
        //      The event object for: current_view_changed
        
        var path = ko.uriparse.URIToLocalPath(event.originalTarget.getURI());
        var response = this._runSvnCommand(path,'log','');
        
        if (!response.error) {
            try {
                var logParser = new org.simpo.svnk.logParser(response.value);
                var tree = document.getElementById("SVNK-logTree");
                this.entries = logParser.entries;
                var logView = new org.simpo.svnk.logView(this.entries,tree);
                
                tree.view = logView;
            } catch(e) { Components.utils.reportError(e); }
        } else {
            Components.utils.reportError(response.value);
        }
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
    
    window.addEventListener(
        'current_view_changed',
        this._currentViewUpdated.bind(this),
        false
    );
    
};

org.simpo.svnk.logView = function(entries,tree) {
    // summary:
    //      Class, which can be passed to nsITreeView.
    // entries: object org.simpo.svnk.logParser
    //      Contains the log entries.
    // tree: object XULTreeElement
    //      The XUL tree element to add content to.
    // todo:
    //      Event code needs adding so that context-menus work.
    //      Filtering code needed so search is possible.
    //      Sorting code needed so user can click on column headers to sort.
    
    this.getCellText = function(row,column) {
        // summary:
        //      Supply the text-content for a given tree cell.
        // row: integer
        //      The row number in the tree.
        // column: object XULTreecolElement
        //      The column element in the tree.
        // returns: string
        
        switch (column.id) {
            case "SVNK-logTree-col-revision":
                return this.entries[row].revision;
            case "SVNK-logTree-col-user":
                return this.entries[row].user;
            case "SVNK-logTree-col-date":
                return this.entries[row].date;
            case "SVNK-logTree-col-details":
                var details = this.entries[row].details;
                return details.replace(/\n/,' ... ');
        }
        return "";
    };
    this.setTree = function(treebox) { this.treebox = treebox; };
    this.isContainer = function(row) { return false; };
    this.isSeparator = function(row) { return false; };
    this.isSorted = function() { return false; };
    this.getLevel = function(row) { return 0; };
    this.getImageSrc = function(row,col) { return null; };
    this.getRowProperties = function(row,props) {};
    this.getCellProperties = function(row,col,props) {};
    this.getColumnProperties = function(colid,col,props) {};
    this._onDoubleClick = function(event) { SVNK.viewEntry(); };
    
    // rowCount: integer
    //      The number of rows to output to the current tree.
    this.rowCount = entries.length;
    
    // entries: object org.simpo.svnk.logParser
    //      The entries to parse into the tree
    this.entries = entries;
    
    // tree: object XULTreeElement
    //      Reference to the tree element, which we are parsing to
    this.tree = tree;
    
    tree.addEventListener('dblclick', this._onDoubleClick.bind(this), true);
};

org.simpo.svnk.logParser = function(log) {
    // summary
    //      Parse a SVN-log file into its component parts.
    // log: string
    //      The SVN Log.
    // todo:
    //      More try/catch clauses.
    
    this._getLogEntries = function(log) {
        // summary:
        //      Take a UNIX-formated log and parse into a object.
        // log: string
        //      The log text to parse.
        // returns: object
        
        var blocks = this._getLogSections(log);
        var entries = new Array();
        var j = 0;
            
        for (i in blocks) {
            var entry = blocks[i];
            if (entry != '') {
                entries[j] = {
                    'block':entry,
                    'details':this._getDetails(entry),
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
        // summary:
        //      Get the revision number from the supplied block of text.
        // block:
        //      A block of text, which equates to a single log entry.
        // returns: integer
        // todo:
        //      The result++/result-- code is messy and needs refactoring.
        
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
        // summary:
        //      Get the date of a log entry from the supplied block of text.
        // block: string
        //      A block of text, which equates to a single log entry.
        // returns: string
        // todo:
        //      This only returns a string; a better method would parse the
        //      string to produce a JavaScript date-object.
        
        try {
            var result = block.match(/\| (\d+\-\d+-\d+ \d+:\d+:\d+ (\+|\-)\d+)/);
            return result[1];
        } catch(e) {
            return false;
        }
    };
    
    this._getDetails = function(block) {
        // summary:
        //      Get the log entry content from a block of text.
        // block: string
        //      A block of text, which equates to a single log entry.
        // returns: string
        
        try {
            var result = block.split(/\n/);
            result.shift();result.shift();
            return result.join("\n");
        } catch(e) {
            return '';
        }
    };
    
    this._getUser = function(block) {
        // summary:
        //      Get the user who submitted the the supplied block.
        // block: string
        //      A block of text, which equates to a single log entry.
        // returns: string
        
        try {
            var result = block.match(/\| (\w+) \|/);
            return result[1];
        } catch(e) {
            return 'unknown';
        }
    };
    
    this._toUnixText = function(text) {
        // summary:
        //      Convert line endings within a string into their UNIX equivalent.
        // text: string
        //      The string to convert
        
        text.replace(/\r\n/g,"\n");
        text.replace(/[\r\f]/g,"\n");
        return text;
    };
    
    this._getLogSections = function(log) {
        // summary:
        //      Break-down a log into its blocks (individual entries).
        // log: string
        //      The log to break-down.
        // returns: array
        //      Each item in the array is log-block.
        // todo:
        //      In theory this may break if someone has a section of text with
        //      repeated ---- in it.  Refactoring is required to pay attention
        //      to the stated number of lines, recorded at the end of the first
        //      line of each block.
        
        var blocks = log.split(/^-{10,}$/mg);
        for (i in blocks) {
            blocks[i] = blocks[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
        return blocks;
    };
    
    // log: string
    //      Store a UNIX-formated version of the log. 
    this.log = this._toUnixText(log);
    
    // entries: array
    //      The parsed entries.
    // todo:
    //      Add setter/getter methods instead.
    this.entries = this._getLogEntries(this.log);
};

// Global namespace violation?
var SVNK = new org.simpo.svnk();

} catch (e) {
    Components.utils.reportError(e);
}
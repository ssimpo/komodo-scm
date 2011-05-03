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
if (!org.simpo.svnk) org.simpo.svnk = {};

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
org.simpo.svnk.pref = function() {
    this.browse = function() {
        var path = ko.filepicker.getFolder('','Path to TortoiseProc.exe');
        
        var pathToProcTextBox = document.getElementById("preferences-SVNK-pathToProc");
        pathToProcTextBox.value = path;
    };
};

// Global namespace violation?
var SVNKPREF = new org.simpo.svnk.pref();

} catch (e) {
    Components.utils.reportError(e);
}
//the advice given at http://blogger.ziesemer.com/2007/10/respecting-javascript-global-namespace.html has been followed
if(!org) var com={};
if(!org.simpo) org.simpo={};

org.simpo.koSVN = function() {
    hello: function() {
        alert('Hello World');
    }
}
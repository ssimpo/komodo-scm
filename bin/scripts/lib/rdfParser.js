var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;

function getEmData(path) {
  var deferred = Q.defer();
  
  Q.nfcall(
	fs.readFile, path, {"encoding":"utf8"}
  ).then(function(rdf) {
    var dom =  new DOMParser().parseFromString(rdf, 'text/xml');
    var em = parseEmData(dom);
    deferred.resolve(em);
  }, reportError);
  
  return deferred.promise;
}

function parseEmData(dom){
  var data = {};
  var Document = dom.getElementsByTagName("Description");
  if(Document.length > 0){
    var elements = getChildElements(Document[0]);
		elements.forEach(function(element){
      if(/^em\:/.test(element.tagName)){
        var id = element.tagName.replace("em:", "");
        data[id] = element.textContent;
      }
    });
  }
  
	return data;
}

function getChildElements(node){
	var elements = [];
	
	for(var n = 0; n < node.childNodes.length; n++){
		var cnode = node.childNodes[n];
		if(cnode.nodeType === 1){
			elements.push(cnode);
		}
	}
	
  return elements;
}

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}

module.exports = getEmData;
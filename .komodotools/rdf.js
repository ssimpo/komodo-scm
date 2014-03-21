"use strict";

var EXPORTED_SYMBOLS = ["main"];

function main(path){
	
	var self = this;
	
	require([
		"activestate.com/koFileEx"
	], function(koFileEx){
		
		self.getRdfXml = function(path){
			var XMLParser = new DOMParser();
			var rdfDoc = XMLParser.parseFromString(
				this.readFile(path),
				"text/xml"
			);
	
			return rdfDoc;
		}
	
		self.parseEmData =  function(){
			var data = {};
			
			var Document = self.xmldoc.getElementsByTagName("Description");
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

		self.getChildElements =  function(node){
			var elements = [];
	
			for(var n = 0; n < node.childNodes.length; n++){
				var cnode = node.childNodes[n];
				if(cnode.nodeType === 1){
					elements.push(cnode);
				}
			}
	
			return elements;
		}
	
		self.readFile = function(filename) {
			try {
				koFileEx.URI = filename;
				koFileEx.open('rb');
				var content = koFileEx.readfile();
				koFileEx.close();
				return content;
			} catch(e) { 
				alert(e+ "filename: "+filename);
				return "";
			}
		}
	});
	
	this.xmldoc = this.getRdfXml(path);
}
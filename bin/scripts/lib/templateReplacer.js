var Q = require('q');
var Path = require('path');
var fs = require('fs');

function replaceTemplateData(files, data){
	var rx = /\<\%\=.*?\%>/m;
  
  files.forEach(function(file){
    if (!file.directory) {
      console.log("Parsing: " + Path.resolve(file.path));
      readFile(file.path).then(function(content){
        var test = rx.test(content);
        if(rx.test(content)){
          console.log("Parsing Template Tagscls: " + Path.resolve(file.path));
          while(rx.test(content)){
            content = replaceTemplateTagWithData(content, data);
          }
          writeFile(file.path, content).then(undefined, reportError);
        }
      }, reportError);
    }
	});
}

function replaceTemplateTagWithData(text, data){
	var rx = /\<\%\=(.*?)\%>/m;
  
  match = rx.exec(text);
	if(match){
		var lookup = trimStr(match[1]);
		var value = data[lookup];
    
    if(value){
      text = text.replace(match[0], value);
		}else{
			text = text.replace(match[0], "");
		}
	}
	
	return text
}

function readFile(file){
  return Q.nfcall(fs.readFile, file, {"encoding":"utf8"});
}

function trimStr(str){
	return str.replace(/^\s+|\s+$/g, '');
}

function writeFile(file, content){
  return Q.nfcall(fs.writeFile, file, content, {"encoding":"utf8"});
}

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}

module.exports = replaceTemplateData;
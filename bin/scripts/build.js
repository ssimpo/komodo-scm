var xcopy = require('directory-copy');
var Q = require('q');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var Path = require('path');

var pathToRoot = Path.normalize(__dirname.replace(/\\/g, '/') + '/../../');

/*copyFilesForBuild(
  'app', 'build/app', '.buildignore'
).then(copyComplete, reportProgress, reportError);*/

getEmData().then(function(em) {
  var files = [];
  getAllFiles(pathToRoot + 'build/app', files).then(function(files) {
    console.log("HELLO");
  }, reportError);
}, reportError);

function copyComplete() {
  reportProgress("App copy complete.");
}

function getEmData() {
  var deferred = Q.defer();
  
  Q.nfcall(
    fs.readFile,
    pathToRoot + 'build/app/install.rdf',
    {"encoding":"utf8"}
  ).then(function(rdf) {
    var dom =  new DOMParser().parseFromString(rdf, 'text/xml');
    var em = parseEmData(dom);
    deferred.resolve(em);
  }, reportError);
  
  return deferred.promise;
}

function parseBuildExcludes(path) {
  var deferred = Q.defer();
  
  readBuildIgnore(path).then(function(data){
    var excludes = [];
    data = data.replace(/\r\n/g, '\n').split('\n');
    data.forEach(function(line) {
      excludes.push(RegExp(line,""));
    });
    deferred.resolve(excludes);
  });
  
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

function getAllFiles(path, files, count, promises) {
  if (count === undefined) {
    count = 0;
  }
  if (promises === undefined) {
    promises = [];
  }
  
  var deferred = Q.defer();
  promises.push(Q.defer());
  
  Q.nfcall(fs.readdir, path).then(function(files) {
    var statPromises = [];
    
    files.forEach(function(file) {
      var filePath = path + '/' + file;
      var statDeferred = Q.nfcall(fs.stat, filePath);
      statDeferred.then(function(stats) {
        if(stats.isDirectory()) {
          getAllFiles(filePath, files, count, promises).then(function() {
            count++
            /*console.log(count, promises.length);
            if (count >= promises.length) {
              deferred.resolve();
            }*/
          }, reportError);
        }else{
          console.log(filePath);
          files.push(filePath);
        }
      }, reportError);
    });
    
    Q.all(statPromises).then(function() {
      
      console.log(count, promises.length);
      if (count >= promises.length) {
        deferred.resolve();
      }
    }, reportError)
  }, reportError);
  
  return deferred.promise;
}

function replaceTemplateData(files, data){
	var rx = /\<\%\=.*?\%>/m;
  
  files.forEach(function(file){
    var content = readFile(file);
    var test = rx.test(content);
    
    if(rx.test(content)){
      while(rx.test(content)){
        content = replaceTemplateTagWithData(content, data);
			}
      writeFile(file, content);
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

function readBuildIgnore(path) {
  return Q.nfcall(fs.readFile, path, {"encoding":"utf8"});
}

function copyFilesForBuild(appDir, buildDir, buildIgnorePath) {
  var deferred = Q.defer();
  
  parseBuildExcludes(pathToRoot + buildIgnorePath).then(function(excludes) {
    xcopy({
      'src':pathToRoot + appDir,
      'dest':pathToRoot + buildDir,
      'excludes':excludes
    }, function(error){
      if (error === null) {
        deferred.resolve();
      } else {
        deferred.reject(error);
      }
    }).on('log', function (msg, level) {
      deferred.notify(msg);
    });
  });
  
  return deferred.promise;
}

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}
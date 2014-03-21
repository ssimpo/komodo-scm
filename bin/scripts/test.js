var Q = require('q');
var fs = require('./fs2');
var getEmData = require('./rdfParser.js');
fs.debug = true;

var rootDir = '../../';
var appDir = rootDir + 'app/';
var buildDir = rootDir + appDir + 'build/';

doDeleteAppBuildDirectory(buildDir,appDir);


function doDeleteAppBuildDirectory(buildDir, appDir) {
  Q.nfcall(fs.deleteDir, buildDir).then(function() {
    console.log("Deleted build app directory");
    doCopyAppDirectoryForBuilding(appDir, buildDir);
  });
}

function doCopyAppDirectoryForBuilding(appDir, buildDir) {
	fs.xcopy(
		appDir, buildDir, {
      'directories': {
				'excludes': [/[\/\\]\.git$/, /[\/\\]tests$/, /[\/\\]docs$/]
			},
			'files': {
				'excludes': [/\.hgkeep$/]
			}
		}
	).then(function(){
		doGetEmData(appDir, 'install.rdf');
	}, function(error){
		console.error("FAIL", error);
	});
}

function doGetEmData(appDir, rdfFileName, buildDir) {
  getEmData(appDir + rdfFileName).then(function(em){
		console.log(em);
	});
}

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}
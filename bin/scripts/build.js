var Q = require('q');
var fs = require('./lib/fs2');
var getEmData = require('./lib/rdfParser.js');
var replaceTemplateData = require('./lib/templateReplacer.js');
var xpiCreator = require('./lib/xpiCreator.js');
fs.debug = true;

var rootDir = '../../';
var appDir = rootDir + 'app/';
var buildDir = rootDir + 'build/app/';

doDeleteAppBuildDirectory(buildDir, appDir);
//doGetEmData(buildDir, 'install.rdf');


function doDeleteAppBuildDirectory(buildDir, appDir) {
  Q.nfcall(fs.deleteDir, buildDir).then(function() {
    console.log("Deleted build app directory");
    doCopyAppDirectoryForBuilding(appDir, buildDir);
  }, reportError);
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
		doGetEmData(buildDir, 'install.rdf');
	}, function(error){
		console.error("FAIL", error);
	});
}

function doGetEmData(buildDir, rdfFileName) {
  console.log("Reading: " + rdfFileName);
  getEmData(appDir + rdfFileName).then(function(em){
    getFilesForTemplateReplace(buildDir, em);
	});
}

function getFilesForTemplateReplace(buildDir, em) {
  fs.getAllFiles(buildDir, {
    'files': {
			'includes': [/\.html$/, /\.js$/, /\.xul$/, /\.properties$/, /\.css$/, /\.dtd$/]
		}
	}).then(function(files) {
    doReplaceTemplateData(files, em, buildDir)
  }, reportError);
}

function doReplaceTemplateData(files, emData, buildDir) {
  replaceTemplateData(files, emData).then(function(){
    doXpiCreation(buildDir, emData);
  });
}

function doXpiCreation(buildDir, emData) {
  xpiCreator(buildDir, buildDir + '../', emData);
  Q.nfcall(fs.deleteDir, buildDir).then(undefined, reportError);
  Q.nfcall(fs.deleteDir, buildDir + '../komodoscm.jar').then(undefined, reportError);
}

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}
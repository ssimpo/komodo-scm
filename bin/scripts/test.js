var Q = require('q');
var fs = require('./fs2');
var getEmData = require('./rdfParser.js');
fs.debug = true;

var rootDir = '../../';
var appDir = rootDir + 'app/';
var buildDir = rootDir + appDir + 'build/';

Q.nfcall(fs.deleteDir, buildDir).then(function() {
	console.log("Deleted build app directory");
	
	fs.xcopy(
		'../../app', '../../build/app', {
			'directories': {
				'excludes': [/[\/\\]\.git$/, /[\/\\]tests$/, /[\/\\]docs$/]
			},
			'files': {
				'excludes': [/\.hgkeep$/]
			}
		}
	).then(function(){
		getEmData(appDir + 'install.rdf').then(function(em){
			console.log(em);
		});
	}, function(error){
		console.error("FAIL", error);
	});
});

function reportProgress(progress) {
  console.log(progress);
}

function reportError(error) {
  console.error(error);
}
var AdmZip = require('adm-zip');
var Path = require('path');
var fs = require('./fs2');

function xpiCreator(buildDir, xpiBuildPath, emData) {
  try {
    buildDir = Path.resolve(buildDir);
    xpiBuildPath = Path.resolve(xpiBuildPath);
    
    var zip = new AdmZip();
    zip.addLocalFolder(buildDir + '/content', 'content');
    zip.addLocalFolder(buildDir + '/locale', 'local');
    zip.addLocalFolder(buildDir + '/skin', 'skin');
    
    zip.writeZip(xpiBuildPath + Path.sep + 'komodoscm.jar');
    
    var zip = new AdmZip();
    zip.addLocalFile(buildDir + '/chrome.manifest');
    zip.addLocalFile(buildDir + '/install.rdf');
    zip.addLocalFile(xpiBuildPath + '/komodoscm.jar');
    zip.writeZip(xpiBuildPath + Path.sep + 'komodoscm.xpi');
    
  } catch(error) {
    console.error(error);
  }
}

module.exports = xpiCreator;
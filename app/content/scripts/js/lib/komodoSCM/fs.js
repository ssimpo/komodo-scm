define([
	"./typeTest",
	"./console",
	"./interval",
	"./q",
	"komodoSCM/componant!activestate.com/koOs",
	"komodoSCM/componant!activestate.com/koOsPath"
], function(typeTest, console, interval, Q, koOs, koOsPath){
	var construct = {
		xcopy: function(fromDir, toDir, callers, promises){
			promises = promises || [];
			callers = callers || [];
			fromDir = (
				(typeTest.isString(fromDir))
				? construct._getNsFile(fromDir)
				: fromDir
			);
			toDir = construct.mkdir(toDir);
			
			construct._xcopy(fromDir, toDir, callers, promises);
			callers.forEach(function(caller){
				interval.add(caller);
			});
			return Q.all(promises);
		},
		
		_xcopy: function(fromDir, toDir, callers, promises){
			var dirList = koOs.listdir(fromDir.path, {});
			dirList.forEach(function(item){
				var cFile = fromDir.path + "\\" + item;
				var deferred = Q.defer();
				if(koOsPath.isdir(cFile)){
					(function(fromDir, toDir){
						callers.push(function(){
							construct.xcopy(fromDir, toDir, callers, promises);
							console.log(toDir.path);
							deferred.resolve(toDir);
						});
					})(
						cFile.toString(),
						toDir.path + "\\" + item
					);
				}else{
					(function(cFile, toDir){
						callers.push(function(){
							var nsFile = construct._getNsFile(toDir.path);
							nsFile.initWithPath(cFile);
							nsFile.copyTo(toDir, "");
							nsFile = undefined;
							console.log(toDir.path);
							deferred.resolve(toDir);
						});
					})(cFile, toDir);
				}
				promises.push(deferred);
			});
			
			fromDir = undefined;
			toDir = undefined;
		},
	
		mkdir: function(nsFile, name){
			nsFile = ((typeTest.isString(nsFile)) ? construct._getNsFile(nsFile) : nsFile);
		
			var path = nsFile.path;
			if(name !== undefined) {
				nsFile.append(name);
			}
			if (!nsFile.exists()){
				nsFile.create(nsFile.DIRECTORY_TYPE, parseInt("775",8));
			}
			if (path !== nsFile.path){
				nsFile.initWithPath(path);
			}
		
			return nsFile;
		},
		
		_getNsFile: function(path){
			var nsFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			nsFile.initWithPath(path);
			return nsFile;
		}
	};
	
	return construct;
});
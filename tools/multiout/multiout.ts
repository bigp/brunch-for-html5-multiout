declare var module;
declare var process;
var trace = console.log.bind(console);
var fs = require('fs');
var cmdParam = process.argv[2];
const spawn = require('child_process').spawnSync;

function traceJSON(o) {
    trace(JSON.stringify(o, null, '  '));
}

var exceptions = 'node_modules,public,tools'.split(",");
function endsWith(path, char:string) {
    if(path.charAt(path.length-1)!=char) return path + char;
    return path;
}

function recursiveGetFiles(path, allFiles:Array<string>=[]) {
    path = endsWith(path, "/");
    var files = fs.readdirSync(path);
    files.forEach(function(file) {
        var fullpath = path + file;
        if(file.indexOf(".")==0) return;
        if(fs.lstatSync(fullpath).isDirectory()) {
            if(exceptions.indexOf(file)>-1) return;

            allFiles.push(fullpath);
            recursiveGetFiles( fullpath, allFiles);
        } else {
            allFiles.push(fullpath);
        }

    });

    return allFiles;
}

var root = "./app/";
var allFiles = recursiveGetFiles(root);

function fileExists(path:string):boolean {
    try {
        fs.statSync(path);
        return true;
    } catch(e) {
        this.isDebug && trace("Missing directory, removing from arguments.");
        return false;
    }
}

function replaceHandleBars(str:string, obj:any):string {
    for(var prop in obj) {
        if(!obj.hasOwnProperty(prop)) continue;
        //obj[prop]
        var propHandlebar = "{{" + prop + "}}";
        while(str.indexOf(propHandlebar)>-1) {
            str = str.replace(propHandlebar, obj[prop]);
        }
    }
    return str;
}

function reduceExistingDirectories(arr:Array<string>):Array<string> {
    var TAG_CHECK_EXISTS = "@EXISTS@";

    for(var r=arr.length; --r>=0;) {
        var resolved = arr[r];
        if(resolved.indexOf(TAG_CHECK_EXISTS)==0) {
            resolved = resolved.substr(TAG_CHECK_EXISTS.length);
            if(!fileExists(resolved)) {
                arr.splice(r, 1);
                continue;
            }

            arr[r] = resolved;
        }
    }
    return arr;
}

module.exports.multiout = {
    isDebug: false,
    populateSeperateOutputs: function(pattern:RegExp, ext:string, folders:any={}, includesInAll:Array<string>=[]):any {
        if(ext.indexOf('.')!=0) ext = "." + ext;
        var outputExt;
        if(ext.indexOf(':')>-1) {
            var ext2 = ext.split(":");
            ext = ext2[0];
            outputExt = ext2[1];
        } else {
            outputExt = ext;
        }

        //Filter files by pattern:
        allFiles.forEach( function(fullpath) {
            var completePath = fullpath;

            if(fullpath.indexOf(root)==0) fullpath = fullpath.substr(root.length);
            if(!pattern.test(fullpath)) return;

            var foldername = fullpath.split("/")[0];
            var mergedname = foldername + outputExt;
            if(folders[mergedname]==null) {
                folders[mergedname] = includesInAll.concat();
            }
            if(fs.lstatSync(completePath).isDirectory()) return;
            if(fullpath.indexOf(ext)!=(fullpath.length-ext.length)) return;
            folders[mergedname].push(completePath);
        });

        return folders;
    },

    process: function(config) {
        var currentName = cmdParam.toLowerCase();
        var currentConfig = config[currentName];
        var currentTasks = currentConfig.tasks;
        var configFiles = config.files;

        if(currentTasks==null) {
            this.isDebug && trace("Missing 'tasks' in multiout's '" + currentName + "' section.");
            return;
        }

        if(configFiles==null) {
            this.isDebug && trace("Missing 'files' in multiout configuration file.");
            return;
        }

        configFiles.forEach( function(adUnit) {
            currentTasks.forEach( function(task) {
                if(task.name==null || task.name.length==0) return;

                var resolvedArgs = replaceHandleBars(task.args, adUnit).split(" ");
                reduceExistingDirectories(resolvedArgs);

                if(builtinTasks[task.name]!=null) {
                    builtinTasks[task.name].call(this, adUnit, resolvedArgs);
                } else {
                    var cmd = spawn(task.name, resolvedArgs, {encoding: "utf-8"});
                    if(task.silent===true) return;
                    if(cmd.stderr && cmd.stderr.length>0) {
                        this.isDebug && trace("ERROR: " + task.name + " failed: \n" + cmd.stderr);
                        return;
                    } else {
                        trace(cmd.stdout);
                    }
                }
            });
        });

        //traceJSON(currentTasks)
    }
};

var builtinTasks = {
    'merge-and-paste': function mergeAndPaste(adUnit, configArgs) {
        if(configArgs==null || configArgs.length!=2) {
            trace("ERROR: The merge-and-paste 'args' must be two values (seperated by space).")
            return;
        }

        trace("Merging and Pasting...");
        var htmlIn = configArgs[0];
        var htmlOut = configArgs[1];


        var htmlTemplate = fs.readSync(htmlIn);
        traceJSON([adUnit, configArgs]);
        //this.isDebug &&

    }
};
declare var require;
declare var module;
declare var process;
const fs = require('fs');
const spawn = require('child_process').spawnSync;
const trace = console.log.bind(console);
const UTF_8 = {encoding: "utf-8"};
const cmdParam = process.argv[2];
const debugParam = process.argv[3]=="0";

var _infoEnabled = false;
function info(... args) {
    if(!_infoEnabled) return;
    trace.apply(console, arguments);
}

function traceJSON(o) {
    trace(JSON.stringify(o, null, '  '));
}

var exceptions = 'node_modules,public,tools'.split(",");
function endsWith(path, char:string) {
    if(path.charAt(path.length-1)!=char) return path + char;
    return path;
}

function recursiveGetFiles(path, allFiles:Array<string>=[], exceptions:Array<string>=[]) {
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

function fileExists(path:string):boolean {
    try {
        fs.statSync(path);
        return true;
    } catch(e) {
        this.isDebug && trace("Missing directory, removing from arguments.");
        return false;
    }
}

var root = "./app/";
var allFiles = recursiveGetFiles(root);


function resolveHandleBars(str:string, obj:any):string {
    if(str==null) return null;
    if(str.length>0) {
        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) continue;
            //obj[prop]
            var propHandlebar = "{{" + prop + "}}";
            while(str.indexOf(propHandlebar)>-1) {
                str = str.replace(propHandlebar, obj[prop]);
            }
        }
    }

    return str;
}

function resolveEnvVars(str:string):string {
    return str.replace(/%([^%]+)%/g, function(_,n) {
        return process.env[n];
    });
}

function reduceExistingDirectories(arr:Array<string>):Array<string> {
    var TAG_CHECK_EXISTS = "@@";

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

function removeBeginsWith(path:string, char:string):string {
    if(path.indexOf(char)==0) return path.substr(char.length);
    return path;
}

function readFile(path:string, replacements:any=null ):string {
    var data = fs.readFileSync(path, UTF_8);
    if(replacements!=null) {
        data = resolveHandleBars(data, replacements);
    }
    return data;
}

function copyFile(from:string, to:string) {
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

module.exports.multiout = {
    isDebug: debugParam && _infoEnabled,

    populateTypicalAdFormats: function(debugFlag) {
        var jsFiles = {'js/vendor.js': /^vendor\/[a-zA-Z0-9_\-\/]*\.js/};
        var cssFiles = {'css/vendor.css': /^vendor\/[a-zA-Z0-9_\-\/]*\.(css|less)/};

        this.isDebug = debugFlag;
        this.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".js", jsFiles);
        this.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".css", cssFiles);
        this.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".less:.css", cssFiles);

        this.jsFiles = jsFiles;
        this.cssFiles = cssFiles;
    },

    populateSeperateOutputs: function(pattern:RegExp, ext:string, folders:any={}):any {
        if(ext.indexOf('.')!=0) ext = "." + ext;
        var outputExt;
        if(ext.indexOf(':')>-1) {
            var ext2 = ext.split(":");
            ext = ext2[0];
            outputExt = ext2[1];
        } else {
            outputExt = ext;
        }

        //Filter files by pattern (EDIT: this only detects /app/ subfolders with ad-like patterns.
        allFiles.forEach( function(fullpath) {
            var completePath = fullpath;

            if(fullpath.indexOf(root)==0) fullpath = fullpath.substr(root.length);
            if(!pattern.test(fullpath) || fullpath.indexOf("/")>-1) return;

            var mergedname = endsWith(outputExt.substr(1), "/") + fullpath + outputExt;
            var filesSrc = "^"+removeBeginsWith(completePath,"./")+"/.*"+ext;
            var filesRegex = new RegExp(filesSrc,"gi");
            //trace(mergedname + " -- " + filesSrc + " -- " + filesRegex.source);
            folders[mergedname] = filesRegex;
        });

        return folders;
    },

    process: function(config) {
        var currentName = cmdParam.toLowerCase();
        var currentConfig = config[currentName];
        var currentTasks = currentConfig.tasks;
        var currentFiles = config.files;
        var _THIS = this;
        trace("Processing phase " + currentName);

        if(currentTasks==null) {
            info("  Missing 'tasks' in multiout's '" + currentName + "' section.");
            return;
        }

        if(currentFiles==null) {
            info("  Missing 'files' in multiout configuration file.");
            return;
        }

        if(currentConfig.inputFile!=null) {
            if(!fileExists(currentConfig.inputFile)) {
                info("'inputFile' missing / incorrect path: " + currentConfig.inputFile);
                return;
            } else {
                info("Reading file: " + currentConfig.inputFile);
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////
                this._inputFileContent = readFile(currentConfig.inputFile);
            }
        }

        if(currentConfig.outputDir!=null) {
            this._outputDir = endsWith(currentConfig.outputDir, "/");
            if(!fileExists(this._outputDir)) {
                info("  'outputDir' does not exist yet - creating it now: " + this._outputDir);
                fs.mkdirSync(this._outputDir);
            }
        }

        info("[PROCESSING = %s]", currentName.toUpperCase());
        var isAFTER = currentName=="after";

        currentFiles.forEach( function(adUnit) {
            if (adUnit.name.indexOf("*") == 0) {
                adUnit.name = removeBeginsWith(adUnit.name, "*");
                _THIS._hasPrimaryFile = adUnit;
                _THIS._indexDefault = _THIS._outputDir + adUnit.name + ".html";
            }
        });

        currentFiles.forEach( function(adUnit) {
            if(_THIS._hasPrimaryFile!=null) {
                if(_THIS._hasPrimaryFile!=adUnit) return;
                trace("Working on primary file: " + adUnit.name);
            }

            if(!fileExists("app/" + adUnit.name)) {
                info("  Skipping missing folder: " + adUnit.name);
                return;
            }

            /*if(isAFTER) {
                _THIS._currentInput = resolveHandleBars(_THIS._inputFileContent, adUnit);
            }*/
            //trace(currentTasks);
            currentTasks.forEach( function(task) {
                if(task.name==null || task.name.length==0 || task.off===true) return;
                var resolvedArgs = resolveHandleBars(task.args, adUnit).split(" ");
                reduceExistingDirectories(resolvedArgs);

                var taskExec = resolveEnvVars(task.name);

                info("  [TASK] %s %s", taskExec, "\n  ... " + resolvedArgs.join("\n  ... "));

                if(builtinTasks[task.name]!=null) {
                    builtinTasks[task.name].call(_THIS, adUnit, resolvedArgs);
                } else {
                    var cmd = spawn(taskExec, resolvedArgs, UTF_8);
                    trace(taskExec);
                    if(task.silent===true) return;
                    if(cmd.stderr && cmd.stderr.length>0) {
                        trace("ERROR: " + task.name + " failed: \n" + cmd.stderr);
                        return;
                    } else {
                        trace(cmd.stdout);
                    }
                }
            });

            /*if(isAFTER) {
                //var htmlOut = _THIS._outputDir + removeBeginsWith( resolveHandleBars( configArgs[0], adUnit ), "./" );

                _THIS._currentInput = resolveHandleBars(_THIS._inputFileContent, adUnit);
            }*/
        });

        if(isAFTER) {
            if(_THIS._indexDefault==null) {
                _THIS._indexDefault = _THIS._lastHTMLFile;
                if(_THIS._indexDefault==null) { //Still no file written...
                    info("Default index file could not be written! :(");
                    return;
                }
            }

            var indexHTML = _THIS._outputDir + "index.html";
            info("Copying " + _THIS._indexDefault + " to index.html");
            if(!fileExists(_THIS._indexDefault)) {
                info("The file doesn't exist to copy as index.html file! " + _THIS._indexDefault);
                return;
            }
            copyFile(_THIS._indexDefault, indexHTML);
        }
    }
};

const TAG_MERGE = "@merge:";
const TAG_PASTE = "@paste:";
const TAG_SOURCES = "src=,href=".split(',');

var builtinTasks = {
    'merge-and-paste': function mergeAndPaste(adUnit, configArgs) {
        var _THIS = this;

        if(configArgs==null) {
            info("ERROR: incorrect 'args' passed to built-in task 'merge-and-paste': " + configArgs)
            return;
        }

        var htmlOut = _THIS._outputDir + removeBeginsWith( resolveHandleBars( configArgs[0], adUnit ), "./" );

        var htmlTemplate = resolveHandleBars(_THIS._inputFileContent, adUnit);
        if(htmlTemplate==null || htmlTemplate.length==0) return;

        var buffers = {};
        var mergedLines = [];
        var htmlLines = htmlTemplate.split("\n");

        function getSource(tag:string, line:string, lookupData:boolean):any {
            var result = {name: null, data: null, filename: null, altFilename:null};
            var tagStart = line.indexOf(tag);
            if(tagStart==-1) return null;

            var name = line.substr(tagStart + tag.length).trim();
            var matchName = name.match(/[a-z0-9\-_\.]*/i);
            if(matchName==null || matchName.length==0) {
                result.name = null;
            } else {
                result.name = matchName[0];
            }

            if(lookupData) {
                for(var t=TAG_SOURCES.length; --t>=0;) {
                    var src = TAG_SOURCES[t];
                    var srcID = line.indexOf(src);
                    if(srcID==-1) continue;
                    var quoteStart = srcID + src.length + 1;
                    var quoteEnd = line.indexOf("\"", quoteStart);
                    result.filename = removeBeginsWith(line.substring(quoteStart, quoteEnd), "/");
                    result.altFilename = _THIS._outputDir + result.filename;

                    if(fileExists(result.filename)) {
                        result.data = readFile(result.filename, adUnit);
                    } else if(fileExists(result.altFilename)) {
                        result.data = readFile(result.altFilename, adUnit);
                    } else {
                        info("'merge-and-paste' > SRC=/HREF= not found: " + result.filename + " || " + result.altFilename);
                        continue;
                    }

                    break;
                }
            }

            return result;
        }

        //First, iterate to "merge" the data in specific string variables:
        for(var m=0; m<htmlLines.length; m++) {
            var line = htmlLines[m];
            var o = getSource(TAG_MERGE, line, true);
            if(o==null || o.name==null || o.data==null) {
                mergedLines.push(line);
                continue;
            }

            if(buffers[o.name]==null) { buffers[o.name] = []; }

            info("  Writing to the buffer: " + o.name + "\t-> " + o.data.length + " chars ...");
            buffers[o.name].push( o.data );
        }

        for(var p=0; p<mergedLines.length; p++) {
            var o = getSource(TAG_PASTE, mergedLines[p], false);
            if(o==null || o.name==null) continue;
            var buffer = buffers[o.name];
            if(buffer==null) {
                info("  Buffer is empty: " + o.name);
                continue;
            }

            mergedLines[p] = buffer.join("\n");
        }

        var output = mergedLines.join("\n");

        function escapedForRegex(str) {
            str = str.replace(/\./g, "\\.");
            str = str.replace(/\-/g, "\\-");
            return str;
        }

        /**
         * TODO: Does the ARGS really need to be a string?
         *      Couldn't it sometimes be a raw Object that could be
         *      accessed by its fields?
         */

        if(configArgs.length>=2) {
            var extraParams = JSON.parse(configArgs[1]);
            if(extraParams.replace) {
                var reps = extraParams.replace;
                for(var r=0; r<reps.length; r+=2) {
                    var a = escapedForRegex(reps[r]);
                    var b = reps[r+1];

                    output = output.replace(new RegExp(a, "g"), b);
                }
            }
        }

        fs.writeFileSync(htmlOut, output, UTF_8);
        info("  -- Writing HTML file: " + htmlOut);

        _THIS._lastHTMLFile = htmlOut;

    }
};
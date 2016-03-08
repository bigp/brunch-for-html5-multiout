var jsFiles = {'vendor.js': /^vendor\/[a-zA-Z0-9_\-\/]*\.js/};
var cssFiles = {'vendor.css': /^vendor\/[a-zA-Z0-9_\-\/]*\.css/};

var trace = console.log.bind(console);
var isProduction = process.argv.indexOf("-p")>-1 ? 1 : 0;
var multiout = require("./tools/multiout/multiout.js").multiout;
multiout.isDebug = false; !isProduction;
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".js", jsFiles, ['app/initialize.js']);
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".css", cssFiles, ['app/reset.css']);
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".less:.css", cssFiles);
if(false) {
  trace("jsFiles: " + JSON.stringify(jsFiles, null, ' '));
  trace("----");
  trace("cssFiles: " + JSON.stringify(cssFiles, null, ' '));
}

module.exports = {
  // See http://brunch.io for documentation.
  modules: {
    wrapper: false,
    definition: false
  },

  //optimize: true,
  sourceMaps: false,
  plugins: {
    beforeBrunch: ["node multiout-config.js before " + isProduction],
    afterBrunch: ["node multiout-config.js after " + isProduction],
    //afterBrunch: ["haxe -cp %BIGPHAXE% --macro bigp.macros.BuildTasks.after('tasks.json')"],
    less: {
      enabled: true
    },
    autoReload: {
      enabled: true,
      delay: 150,
    },
    uglify: {
      mangle: true,
      dead_code: true,
      sequences: true,
      properties: true,
      conditionals: true,
      compress: {
        global_defs: {
          DEBUG: false
        },
        hoist_vars: true
      }
    }
  },

  files: {
    javascripts: {
      joinTo: jsFiles
    },
    stylesheets: {
      joinTo: cssFiles,
      order: {
        before: ['app/reset.css']
      }
    },
    templates: {
      joinTo: 'app.js'
    }
  }
};

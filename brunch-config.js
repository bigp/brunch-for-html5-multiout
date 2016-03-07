var trace = console.log.bind(console);
var multiout = require("./tools/multiout/multiout.js").multiout;
var test = multiout.populateSeperateOutputs(/^app\/en/, ".js");
trace("PIERRE: " + test);

var jsFiles = {
  'app.js': /^app\/[a-zA-Z0-9_\-\/]*\.js/,
  'vendor.js': /^vendor\/[a-zA-Z0-9_\-\/]*\.js/
};
var cssFiles = {
  'app.css': /^app\/[a-zA-Z0-9_\-\/]*\.(css|less)/,
  'vendor.css': /^vendor\/[a-zA-Z0-9_\-\/]*\.css/
};


module.exports = {
  // See http://brunch.io for documentation.
  modules: {
    wrapper: false,
    definition: false
  },

  optimize: true,
  sourceMaps: false,
  plugins: {
    beforeBrunch: ["node brunch-multiout-files.js before"],
    afterBrunch: ["node brunch-multiout-files.js after"],
    //afterBrunch: ["haxe -cp %BIGPHAXE% --macro bigp.macros.BuildTasks.after('tasks.json')"],
    less: {
      enabled: true
    },
    autoReload: {
      enabled: true
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

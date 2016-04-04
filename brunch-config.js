var trace = console.log.bind(console);
var isProduction = process.argv.indexOf("-p")>-1 ? 1 : 0;
var jsFiles = {'js/vendor.js': /^vendor\/[a-zA-Z0-9_\-\/]*\.js/};
var cssFiles = {'css/vendor.css': /^vendor\/[a-zA-Z0-9_\-\/]*\.(css|less)/};

var multiout = require("./tools/multiout/multiout.js").multiout;
multiout.isDebug = isProduction==0;
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".js", jsFiles, ['app/initialize.js']);
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".css", cssFiles, ['app/reset.css']);
multiout.populateSeperateOutputs(/^en[0-9a-z_\-]*/, ".less:.css", cssFiles);

if(multiout.isDebug) {
  trace("jsFiles: " + JSON.stringify(jsFiles, null, ' '));
  trace("----");
  trace("cssFiles: " + JSON.stringify(cssFiles, null, ' '));
}

module.exports = {
  // See http://brunch.io for documentation.
  modules: { wrapper: false, definition: false },

  //optimize: true,
  sourceMaps: false,
  plugins: {
    beforeBrunch: ["node multiout-config.js before " + isProduction],
    afterBrunch: ["node multiout-config.js after " + isProduction],
    less: { enabled: true },
    autoReload: { enabled: true }, //delay: 300
    uglify: {
      mangle: true,
      dead_code: true,
      sequences: true,
      properties: true,
      conditionals: true,
      compress: {
        global_defs: { DEBUG: false },
        hoist_vars: true
      }
    }
  },

  files: {
    javascripts: { joinTo: jsFiles },
    stylesheets: { joinTo: cssFiles, order: { before: ['vendor/common/reset.css'] }},
    templates: { joinTo: 'app.js' }
  }
};

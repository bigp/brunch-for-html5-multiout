var trace = console.log.bind(console);
var isProduction = process.argv.indexOf("-p")>-1 ? 1 : 0;
var multiout = require("./tools/multiout/multiout.js").multiout;
multiout.populateTypicalAdFormats(isProduction==0);

if(false) { //multiout.isDebug) {
  trace("jsFiles: " + JSON.stringify(multiout.jsFiles, null, '  '));
  trace("----");
  trace("cssFiles: " + JSON.stringify(multiout.cssFiles, null, '  '));
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
      compress: { global_defs: { DEBUG: false }, hoist_vars: true }
    }
  },

  files: {
    javascripts: { joinTo: multiout.jsFiles },
    stylesheets: { joinTo: multiout.cssFiles, order: { before: ['vendor/common/reset.css'] }},
    templates: { joinTo: 'app.js' }
  }
};

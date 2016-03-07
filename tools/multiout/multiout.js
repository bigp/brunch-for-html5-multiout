var trace = console.log.bind(console);
var fs = require('fs');
var cmdParam = process.argv[2];
switch (cmdParam.toLowerCase()) {
    case "before":
        trace("BEFORE...");
        break;
    case "after":
        trace("AFTER...");
        break;
    default:
        trace("DEFAULT [required in brunch-config.js, probably]...");
        break;
}
/*process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});*/
module.exports.multiout = {
    process: function (ads) {
        trace("PROCESSING: " + ads);
    },
    populateSeperateOutputs: function (pattern, ext) {
        return [];
    }
};
//# sourceMappingURL=multiout.js.map
var config = {
    files: [
        // Note ↓ the asterisk marks which file will overwrite "index.html" to preview & live-update
        {name: "*en_160x600_h1", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
        {name: "en_160x600_h2", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
        {name: "en_300x250_h1", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
        {name: "en_300x250_h2", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
        {name: "en_300x600_h1", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
        {name: "en_300x600_h2", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
        {name: "en_728x90_h1", width: 728, height: 90, borderWidth: 726, borderHeight: 88},
        {name: "en_728x90_h2", width: 728, height: 90, borderWidth: 726, borderHeight: 88},

    ],

    before: {
        tasks: [
            {name: 'texturepacker', silent: true, args: "--force-publish --data app/{{name}}/{{name}}.less --sheet public/{{name}}.png @@app/{{name}}/images @@app/images_{{width}}x{{height}} @@app/images_common app/atlas_common.tps"},
            {name: '%PNGQUANT%/pngquant.exe', off:true, silent: false, args: "--force --verbose --quality=45-85 --output public/{{name}}-fs8.png -- public/{{name}}.png"}
        ]
    },

    after: {
        inputFile: "app/index.html",
        outputDir: "public/",
        outputName: "{{name}}.html",
        tasks: [
            {name: 'merge-and-paste', silent: true, args: "{{name}}.html {\"replace\":[\".png\",\"-fs8.png\"]}" },
        ]
    }
};

var multiout = module.exports.multiout = require("./tools/multiout/multiout.js").multiout;
if(multiout.cmdParam!=null) {
    multiout.process(config);
} else {
    multiout.config = config;
}
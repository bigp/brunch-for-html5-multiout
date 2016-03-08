var config = {
    files: [
        {name: "en_160x600_h1", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
        {name: "*en_160x600_h2", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
        {name: "en_300x250_h1", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
        {name: "en_300x250_h2", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
        {name: "en_300x600_h1", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
        {name: "en_300x600_h2", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
        {name: "en_728x90_h1", width: 728, height: 90, borderWidth: 726, borderHeight: 88},
        {name: "en_728x90_h2", width: 728, height: 90, borderWidth: 726, borderHeight: 88},

    ],

    before: {
        tasks: [
            {name: 'texturepacker', silent: false, args: "--force-publish --data app/{{name}}/{{name}}.less --sheet public/{{name}}.png @@app/{{name}}/images @@app/images_{{width}}x{{height}} @@app/images_common app/atlas_common.tps"}
        ]
    },

    after: {
        inputFile: "app/index.html",
        outputDir: "public/",
        tasks: [
            {name: 'merge-and-paste', args: "{{name}}.html"}
        ]
    }
};

require("./tools/multiout/multiout.js").multiout.process(config);
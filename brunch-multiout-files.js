var ads = {
    files: [
        {name: "en_300x250", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
        {name: "en_728x90", width: 728, height: 90, borderWidth: 726, borderHeight: 88},
        {name: "en_300x600", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
        {name: "en_160x600", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
    ]
};

require("./tools/multiout/multiout.js").multiout.process(ads);
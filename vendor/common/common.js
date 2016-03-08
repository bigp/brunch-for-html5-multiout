var d = document, w = window, defaults, ad, isDebug = false;
var log = function log(msg) {
    console.log(msg);
};
var trace = log;
function id(n) {
    var found;
    if (n.indexOf(" ") > -1) {
        var eachIDs = n.split(" ");
        found = d.getElementById(eachIDs[0]);
        for (var r = 1; r < eachIDs.length;) {
            var subName = eachIDs[r];
            if (subName.charAt(0) == ".") {
            }
            var kids = found.getElementsByClassName(subName);
            if (kids.length == 0) {
                throw new Error("Cannot find child: " + subName);
                return null;
            }
            found = kids[0];
        }
    }
    else {
        found = d.getElementById(n);
    }
    if (!found)
        log("ERROR: Cannot find element by id: " + n);
    //else log("Found id: " + n);
    return found;
}
function isArray(o) {
    return (o instanceof Array) || o.hasOwnProperty('length');
}
function rem(arr, o) {
    var i = arr.indexOf(o);
    if (i > -1)
        arr.splice(i, 1);
}
var getQueryVariable;
(function (w) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    var queryObj = {};
    for (var i = 0; i < vars.length; i++) {
        var kv = vars[i].split('=');
        queryObj[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    }
    getQueryVariable = function _getQueryVariable(variable) {
        if (queryObj.hasOwnProperty(variable)) {
            return queryObj[variable];
        }
        console.log('Query variable %s not found', variable);
        return null;
    };
})(window);
(function () {
    w.onload = function () {
        _preload();
    };
    var clickTagHandler;
    function _callMain() {
        if (getQueryVariable('debug')) {
            isDebug = true;
            document.body.classList.add('debug');
            document.body.addEventListener("keydown", function (e) {
                switch (e.keyCode) {
                    case 13:
                        ad.onEnter && ad.onEnter();
                        break;
                }
            });
        }
        if (window['atlasURL'] != null) {
            var img = new Image();
            img.addEventListener("load", function () {
                isDebug ? setTimeout(_prepareAd, 250) : _prepareAd();
            });
            img.src = atlasURL;
        }
        else
            _prepareAd();
    }
    function _prepareAd() {
        var clickTarget = id("link");
        defaults = {
            attachTo: id("content"),
            timeline: new TimelineMax()
        };
        //Create the Ad, init and play it:
        if (window['Ad'] == null) {
            trace("No Ad object defined!");
            return;
        }
        ad = new Ad();
        ad.play(defaults.timeline);
        // /*
        clickTarget.addEventListener("click", function () {
            if (!clickTagHandler)
                trace("No click tag");
            else
                clickTagHandler();
            ad.onClick && ad.onClick();
        });
        // */
        defaults.timeline.call(function () {
            ad.onEnd && ad.onEnd();
        });
    }
    function _preload() {
        if (w.location.hostname == "localhost" && w.location.port == "3333") {
            trace(w.document.title = "*LOCAL* " + w.document.title);
        }
        //If Enabler is missing:
        if (!w['Enabler'] || !w['studio']) {
            log("**Could not load DoubleClick Enabler!**");
            _callMain();
        }
        else {
            clickTagHandler = function Enabler_clickTag() {
                Enabler.exit('Background Exit');
            };
            function Enabler_init() {
                // Polite loading
                if (Enabler.isVisible())
                    Enabler_visible();
                else
                    Enabler.addEventListener(studio.events.StudioEvent.VISIBLE, Enabler_visible);
            }
            function Enabler_visible() {
                _callMain();
            }
            // If true, start function. If false, listen for INIT.
            if (Enabler.isInitialized())
                Enabler_init();
            else
                Enabler.addEventListener(studio.events.StudioEvent.INIT, Enabler_init);
        }
    }
})();
function makeDiv(classes, attachTo) {
    if (classes === void 0) { classes = null; }
    if (attachTo === void 0) { attachTo = null; }
    if (attachTo == null)
        attachTo = defaults.attachTo;
    if (typeof (attachTo) == "string")
        attachTo = id(attachTo);
    var div = document.createElement("div");
    //div.classList.add("sprite");
    if (classes != null)
        addClassesTo(div, classes);
    attachTo.appendChild(div);
    return div;
}
function makeSprite(cssName, x, y, options) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (options === void 0) { options = null; }
    if (options == null)
        options = {};
    var div = makeDiv(null, options.attachTo);
    addClassesTo(div, cssName + " sprite");
    TweenMax.set(div, { x: x, y: y, alpha: defaults.hidden || options.hidden ? 0 : 1 });
    return div;
}
function makeText(text, className, x, y, options) {
    if (x === void 0) { x = 0; }
    if (y === void 0) { y = 0; }
    if (options === void 0) { options = null; }
    var div = makeSprite(className + " text", x, y, options);
    div.innerHTML = text.replace(/\|\|/g, "<br/>\n");
    return div;
}
function addClassesTo(div, classes) {
    var classList = typeof (classes) == "string" ? classes.split(" ") : classes;
    for (var c = classList.length; --c >= 0;) {
        div.classList.add(classList[c]);
    }
}
function show() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i - 0] = arguments[_i];
    }
    for (var r = rest.length; --r >= 0;) {
        defaults.timeline.set(rest[r], { alpha: 1 });
    }
}
function hide() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i - 0] = arguments[_i];
    }
    for (var r = rest.length; --r >= 0;) {
        defaults.timeline.set(rest[r], { alpha: 0 });
    }
}
function wait(time) {
    defaults.timeline.set({}, {}, "+=" + time);
}
function pauseHere() {
    var t = defaults.timeline;
    t.call(t.pause.bind(t));
}
var tempArray = [];
function fadeIn(time, rest, offset) {
    if (offset === void 0) { offset = null; }
    var current = typeof (offset) == "string" ? offset : defaults.timeline.totalDuration() + (offset == null ? 0 : offset);
    if (!isArray(rest)) {
        tempArray[0] = rest;
        rest = tempArray;
    }
    for (var r = rest.length; --r >= 0;) {
        defaults.timeline.to(rest[r], time, { alpha: 1 }, current);
    }
}
function fadeOut(time, rest, offset) {
    if (offset === void 0) { offset = null; }
    var current = defaults.timeline.totalDuration() + (offset == null ? 0 : offset);
    if (!isArray(rest)) {
        tempArray[0] = rest;
        rest = tempArray;
    }
    for (var r = rest.length; --r >= 0;) {
        defaults.timeline.to(rest[r], time, { alpha: 0 }, current);
    }
}
//# sourceMappingURL=common.js.map
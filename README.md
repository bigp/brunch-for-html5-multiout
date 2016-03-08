# Brunch app

This is HTML5 application, built with [Brunch](http://brunch.io).

## Getting started
* Install (if you don't have them):
    * [Node.js](http://nodejs.org): `brew install node` on OS X
    * [Brunch](http://brunch.io): `npm install -g brunch`
    * Brunch plugins and app dependencies: `npm install`
* Run:
    * `brunch watch --server` — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * `brunch build --production` — builds minified project for production
* Learn:
    * `public/` dir is fully auto-generated and served by HTTP server.  Write your code in `app/` dir.
    * Place static files you want to be copied from `app/assets/` to `public/`.
    * [Brunch site](http://brunch.io), [Getting started guide](https://github.com/brunch/brunch-guide#readme)

	
# About this specific Skeleton...

Writing plain HTML5 ad animations doesn't mean you have to waste your time rewriting the same HTML files, copy your CSS resets and JS librairies. Also, you CERTAINLY do NOT want to open TexturePacker everytime you make a change or add images, right?

Welcome to the skeleton that will save your life.

Essentially, this not only watches for file-changes, but updates each specific ad units into their own separate HTML, JS and CSS files.

What's more, it can also inline all the JS and CSS right into the end product HTML output.

While testing a particular animation, it usually makes sense to test it on:

`localhost:3333` but given you have seperate HTML pages per ads, how do you indicate which one you are actively working on?

Simple, prefix it with an "*" in the filenames, see for example:

	var multioutConfig = {
        files: [
            {name: "*en_300x250", width: 300, height: 250, borderWidth: 298, borderHeight: 248},
            {name: "en_728x90", width: 728, height: 90, borderWidth: 726, borderHeight: 88},
            {name: "en_300x600", width: 300, height: 600, borderWidth: 298, borderHeight: 598},
            {name: "en_160x600", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
        ],
    
        before: {
            tasks: [
                {name: 'texturepacker', silent: true, args: "--data app/{{name}}/{{name}}.less --sheet public/{{name}}.png app/{{name}}/images @EXISTS@app/images_{{width}}x{{height}} app/atlas_common.tps"}
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
    
    require("./tools/multiout/multiout.js").multiout.process(multioutConfig);
	
Easy as 1 - 2 - 3 right?
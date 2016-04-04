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

	var config = {
		files: [
			{name: "en_160x600_h1", width: 160, height: 600, borderWidth: 158, borderHeight: 598},
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
				{name: '%PNGQUANT%/pngquant.exe', off:true, silent: true, args: "--force --verbose --quality=45-85 --output public/{{name}}-fs8.png -- public/{{name}}.png"}
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

	require("./tools/multiout/multiout.js").multiout.process(config);
	
Easy as 1 - 2 - 3 right?
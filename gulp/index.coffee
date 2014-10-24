gulp = require("gulp")
browserify = require("browserify")
watchify = require("watchify")
source = require("vinyl-source-stream")
coffeeify = require("coffeeify")

debug = process.env.NODE_ENV isnt "production"

gulp.task "default", ->
	bundler = browserify(standalone: "Multirouter", extensions: [".coffee"], cache: {}, packageCache: {}, fullPaths: false)
	.transform({}, coffeeify)
	.add("./src/index.coffee")
	rebundle = ->
		bundler.bundle()
		.on("error", console.error)
		.pipe(source("multirouter.js"))
		.pipe(gulp.dest("./dist"))
	if debug
		bundler = watchify(bundler)
		.on("update", rebundle)
		.on("log", console.info)
	rebundle()

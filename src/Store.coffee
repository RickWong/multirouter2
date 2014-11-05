Route = require("./Route")
Utils = require("./Utils")

GUID = 30001


module.exports = class Store


	constructor: (@options = {}) ->
		@sync = if @options.sync? then @options.sync else true
		@routes = {}
		@callbacks = []
		@options = Utils.extend({
			compatible:  null,
			upgrade:     true,
			downgrade:   true,
			history: history || {},
			location: location || {},
			root:        "",
			routePrefix: "/",
			routeSuffix: ":",
			paramPrefix: ":",
			historyFn:   null,
			replace:     false,
			push:        false,
			reload:      false
		}, @options)

		for route of @options.routes
			@options.routes[route].listenTo(@)

		# TODO: refactor
		if @options.compatible is null
			@options.compatible = false
			if (@options.location.hash || "").length || @options.location.href.substr(-1) is "#"
				@options.compatible = true
				if @options.upgrade && @options.history.replaceState
					try
						newRoot = @options.location.href.replace(@options.location.hash, "")
						@options.history.replaceState({}, "", @options.location.href.replace(/#\/?([^\w])?/, "$1"))
						@options.root = newRoot
						@options.compatible = false
					catch error
					#
				else if @options.downgrade && @options.history.replaceState
					try
						currentLocation = @options.location.href
						@options.history.replaceState({}, "", currentLocation + ".")
						@options.history.replaceState({}, "", currentLocation)
					catch error
						@options.compatible = true

		# TODO: implement
		if !@options.historyFn
			if @options.push
				@options.historyFn = @_pushState
			else if @options.replace
				@options.historyFn = @_replaceState
			else if @options.reload
				@options.historyFn = @_reloadState
			else
				@options.historyFn = if @options.compatible then @_reloadState else @_pushState

		# TODO: refactor
		if @options.compatible
			@options.root = @options.location.href.replace(@options.location.hash, "")
			@options.start = @options.location.hash.replace("#", "")
		else
			@options.root = @options.root || @options.location.origin + "/"
			@options.start = @options.location.href.replace(@options.root, "")

		@fromString(@options.start)


	# TODO: abstract
	listen: (callback) ->
		unless callback.multirouterGuid
			callback.multirouterGuid = GUID++

		@callbacks.push(callback)
		callback(@routes)


	# TODO: abstract
	unlisten: (_callback) ->
		for i of @callbacks
			if _callback.multirouterGuid is @callbacks[i].multirouterGuid
				@callbacks.splice(i, 1)


	navigate:    (route, params) ->
		if !params?.length or params[0] is null or params[0] is false or params[0] is undefined
			delete @routes[route]
		else if params[0] is true
			@routes[route] = true
		else
			@routes[route] = params
		@trigger(@routes)


	link: (route, params) ->
		routes = Utils.extend({}, @routes)
		routes[route.options.route] = params
		@toString(routes)

	# TODO: abstract
	trigger: (routes) ->
		for callback in @callbacks
			callback(routes)


	# TODO: abstract
	triggerAsync: (routes) ->
		setTimeout((=> @trigger.call(@, routes)), 0)


	getDefaultData: ->
		@routes


	fromString:     (segments) ->
		@routes = {}

		segments = decodeURI(segments).split(@options.routePrefix)

		for segment in segments
			continue if !segment.length

			parts = segment.split(@options.routeSuffix)
			route = parts.shift()

			found = false
			for i of @options.routes
				if @options.routes[i].options.route is route
					found = true
					break
			continue unless found

			parts = parts.join(@options.paramPrefix)
			params = if parts.length then parts.split(@options.paramPrefix) else []

			@options.routes[i].apply(@options.routes[i], params)


	toString: (routes) ->
		routes ||= @routes
		return "" if !routes
		segments = "";
		sortedRoutes = [];

		for name of routes
			sortedRoutes.push({name: name, params: routes[name]})

		sortedRoutes.sort((a, b) -> 0);

		for route in sortedRoutes
			segments += @options.routePrefix + route.name

			if route.params and JSON.stringify(route.params) isnt JSON.stringify([]) and route.params isnt true
				segments += @options.routeSuffix

				if route.params instanceof Array
					segments += route.params.join(@options.paramPrefix)
				else
					segments += route.params

		@options.root + segments

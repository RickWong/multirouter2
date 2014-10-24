GUID = 20001


module.exports = class Route


	constructor: (@options = {}) ->
		@sync = if @options.sync? then @options.sync else true
		@callbacks = []

		if typeof @options is "string"
			@options = {route: @options}

		unless @options.route?
			throw "Can't create unknown route"


	# TODO: abstract listen
	listen: (callback) ->
		unless callback.multirouterGuid
			callback.multirouterGuid = GUID++

		@callbacks.push(callback)


	listenTo: (store) ->
		@listen(-> store.navigate.apply(store, arguments))


	# TODO: abstract unlisten
	unlisten: (_callback) ->
		for i of @callbacks
			if _callback.multirouterGuid is @callbacks[i].multirouterGuid
				@callbacks.splice(i, 1)


	# TODO: abstract trigger
	trigger: ->
		if arguments.length
			params = Array.prototype.slice.call(arguments, 0)
		else
			params = [true]

		for callback in @callbacks
			callback(@options.route, params)


	# TODO: abstract triggerAsync
	triggerAsync: ->
		args = arguments
		setTimeout((=> @trigger.apply(@, args)), 0)

GUID = 10001


module.exports = new class Utils


	extend:(object) ->
		sources = Array.prototype.slice.call(arguments, 0)

		for source in sources
			for key of source
				object[key] = source[key]

		object


	createFunctor: (prototype, options) ->
		functor = ->
			functor[if functor.sync then "trigger" else "triggerAsync"].apply(functor, arguments)

		@extend(functor, prototype, { multirouterGuid: GUID++ })
		prototype.constructor.call(functor, options)

		functor


	shallowEqual: (objA, objB) ->
		if objA is objB
			return true

		for key of objA
			if !objB.hasOwnProperty(key) or objA[key] isnt objB[key]
				return false

		for key of objB
			if !objA.hasOwnProperty(key)
				return false

		true


	result: (callbackOrValue, nothing = null) ->
		if typeof callbackOrValue is "function"
			callbackOrValue = callbackOrValue()

		callbackOrValue || nothing

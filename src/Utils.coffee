GUID = 10001


module.exports = new class Utils


	overwrite:(object) ->
		sources = Array.prototype.slice.call(arguments, 0)

		for source in sources
			for key of source
				object[key] = source[key]

		object


	createFunctor: (prototype, options) ->
		functor = ->
			functor[if functor.sync then "trigger" else "triggerAsync"].apply(functor, arguments)

		@overwrite(functor, prototype, { multirouterGuid: GUID++ })
		prototype.constructor.call(functor, options)

		functor

Utils = require("../Utils")


module.exports = (Components) ->
	Components.Viewport = React.createClass
		displayName: "Viewport"


		propTypes:
			route: React.PropTypes.func
			store: React.PropTypes.func
			onActive: React.PropTypes.func


		getInitialState: ->
			params = @props.params

			if params is null or params is false or params is undefined
				active = false
			else if params is true
				active = true
			else
				active = Utils.shallowEqual(
					@props.store.routes?[@props.route.options.route],
					params instanceof Array && params || [params]
				)

			{ active }


		componentWillMount: ->
			if @props.children
				throw "Multirouter Viewport ignored all of its children."

			@props.store.listen(@onRefresh)


		componentWillUnmount: ->
			@props.store.unlisten(@onRefresh)


		onRefresh: (routes) ->
			@setState(@getInitialState())


		render: ->
			result = Utils.result(
				if @state.active then @props.onActive else @props.onInactive
			)

			unless React.isValidComponent(result)
				result = React.DOM.div({ className: "multirouter-viewport" }, result)

			result

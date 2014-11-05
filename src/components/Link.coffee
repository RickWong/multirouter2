Utils = require("../Utils")


module.exports = (Components) ->
	Components.Link = React.createClass
		displayName: "Link"


		propTypes:
			route: React.PropTypes.func
			store: React.PropTypes.func

			
		getInitialState: ->
			link: @props.store.link(@props.route, +new Date)#@props.params)


		componentWillMount: ->
			@props.store.listen(@onRefresh)


		componentWillUnmount: ->
			@props.store.unlisten(@onRefresh)


		onRefresh: (routes) ->
			@setState(@getInitialState())


		onClick: (event) ->
			event.preventDefault()
			@props.route(if @props.params? then @props.params else true)


		shouldComponentUpdate: (nextProps, nextState) ->
			!Utils.shallowEqual(@state, nextState) or !Utils.shallowEqual(@props, nextProps)


		render: ->
			React.DOM.a(
				{
					className: "multirouter-link"
					href: this.state.link
					onClick:  this.onClick
				},
				this.props.children
			)

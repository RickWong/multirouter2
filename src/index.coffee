Store = require("./Store")
Route = require("./Route")
Utils = require("./Utils")


module.exports = new class Multirouter


	createStore: (options) ->
		Utils.createFunctor(Store.prototype, options)


	createRoute: (options) ->
		Utils.createFunctor(Route.prototype, options)


	components: require("./components")

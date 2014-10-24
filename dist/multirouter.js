!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Multirouter=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Multirouter, Route, Store, Utils;

Store = require("./Store");

Route = require("./Route");

Utils = require("./Utils");

module.exports = new (Multirouter = (function() {
  function Multirouter() {}

  Multirouter.prototype.createStore = function(options) {
    return Utils.createFunctor(Store.prototype, options);
  };

  Multirouter.prototype.createRoute = function(options) {
    return Utils.createFunctor(Route.prototype, options);
  };

  return Multirouter;

})());



},{"./Route":2,"./Store":3,"./Utils":4}],2:[function(require,module,exports){
var GUID, Route;

GUID = 20001;

module.exports = Route = (function() {
  function Route(options) {
    this.options = options != null ? options : {};
    this.sync = this.options.sync != null ? this.options.sync : true;
    this.callbacks = [];
    if (typeof this.options === "string") {
      this.options = {
        route: this.options
      };
    }
    if (this.options.route == null) {
      throw "Can't create unknown route";
    }
  }

  Route.prototype.listen = function(callback) {
    if (!callback.multirouterGuid) {
      callback.multirouterGuid = GUID++;
    }
    return this.callbacks.push(callback);
  };

  Route.prototype.listenTo = function(store) {
    return this.listen(function() {
      return store.navigate.apply(store, arguments);
    });
  };

  Route.prototype.unlisten = function(_callback) {
    var i, _results;
    _results = [];
    for (i in this.callbacks) {
      if (_callback.multirouterGuid === this.callbacks[i].multirouterGuid) {
        _results.push(this.callbacks.splice(i, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Route.prototype.trigger = function() {
    var callback, params, _i, _len, _ref, _results;
    if (arguments.length) {
      params = Array.prototype.slice.call(arguments, 0);
    } else {
      params = [true];
    }
    _ref = this.callbacks;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      callback = _ref[_i];
      _results.push(callback(this.options.route, params));
    }
    return _results;
  };

  Route.prototype.triggerAsync = function() {
    var args;
    args = arguments;
    return setTimeout(((function(_this) {
      return function() {
        return _this.trigger.apply(_this, args);
      };
    })(this)), 0);
  };

  return Route;

})();



},{}],3:[function(require,module,exports){
var GUID, Route, Store, Utils;

Route = require("./Route");

Utils = require("./Utils");

GUID = 30001;

module.exports = Store = (function() {
  function Store(options) {
    var currentLocation, error, newRoot, route;
    this.options = options != null ? options : {};
    this.sync = this.options.sync != null ? this.options.sync : true;
    this.routes = {};
    this.callbacks = [];
    this.options = Utils.overwrite({
      compatible: null,
      upgrade: true,
      downgrade: true,
      history: history || {},
      location: location || {},
      root: "",
      routePrefix: "/",
      routeSuffix: ":",
      paramPrefix: ";",
      historyFn: null,
      replace: false,
      push: false,
      reload: false
    }, this.options);
    for (route in this.options.routes) {
      this.options.routes[route].listenTo(this);
    }
    if (this.options.compatible === null) {
      this.options.compatible = false;
      if ((this.options.location.hash || "").length || this.options.location.href.substr(-1) === "#") {
        this.options.compatible = true;
        if (this.options.upgrade && this.options.history.replaceState) {
          try {
            newRoot = this.options.location.href.replace(this.options.location.hash, "");
            this.options.history.replaceState({}, "", this.options.location.href.replace(/#\/?([^\w])?/, "$1"));
            this.options.root = newRoot;
            this.options.compatible = false;
          } catch (_error) {
            error = _error;
          }
        } else if (this.options.downgrade && this.options.history.replaceState) {
          try {
            currentLocation = this.options.location.href;
            this.options.history.replaceState({}, "", currentLocation + ".");
            this.options.history.replaceState({}, "", currentLocation);
          } catch (_error) {
            error = _error;
            this.options.compatible = true;
          }
        }
      }
    }
    if (!this.options.historyFn) {
      if (this.options.push) {
        this.options.historyFn = this._pushState;
      } else if (this.options.replace) {
        this.options.historyFn = this._replaceState;
      } else if (this.options.reload) {
        this.options.historyFn = this._reloadState;
      } else {
        this.options.historyFn = this.options.compatible ? this._reloadState : this._pushState;
      }
    }
    if (this.options.compatible) {
      this.options.root = this.options.location.href.replace(this.options.location.hash, "");
      this.options.start = this.options.location.hash.replace("#", "");
    } else {
      this.options.root = this.options.root || this.options.location.origin + "/";
      this.options.start = this.options.location.href.replace(this.options.root, "");
    }
    this.fromString(this.options.start);
  }

  Store.prototype.listen = function(callback) {
    if (!callback.multirouterGuid) {
      callback.multirouterGuid = GUID++;
    }
    this.callbacks.push(callback);
    return callback(this.routes);
  };

  Store.prototype.unlisten = function(_callback) {
    var i, _results;
    _results = [];
    for (i in this.callbacks) {
      if (_callback.multirouterGuid === this.callbacks[i].multirouterGuid) {
        _results.push(this.callbacks.splice(i, 1));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Store.prototype.navigate = function(route, params) {
    if (!(params != null ? params.length : void 0) || params[0] === null || params[0] === false || params[0] === void 0) {
      delete this.routes[route];
    } else if (params[0] === true) {
      this.routes[route] = true;
    } else {
      this.routes[route] = params;
    }
    return this.trigger(this.routes);
  };

  Store.prototype.preview = function(route, params) {};

  Store.prototype.trigger = function(routes) {
    var callback, _i, _len, _ref, _results;
    _ref = this.callbacks;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      callback = _ref[_i];
      _results.push(callback(routes));
    }
    return _results;
  };

  Store.prototype.triggerAsync = function(routes) {
    return setTimeout(((function(_this) {
      return function() {
        return _this.trigger.call(_this, routes);
      };
    })(this)), 0);
  };

  Store.prototype.getDefaultData = function() {
    return this.routes;
  };

  Store.prototype.fromString = function(segments) {
    var found, i, params, parts, route, segment, _i, _len, _results;
    this.routes = {};
    segments = decodeURI(segments).split(this.options.routePrefix);
    _results = [];
    for (_i = 0, _len = segments.length; _i < _len; _i++) {
      segment = segments[_i];
      if (!segment.length) {
        continue;
      }
      parts = segment.split(this.options.routeSuffix);
      route = parts.shift();
      found = false;
      for (i in this.options.routes) {
        if (this.options.routes[i].options.route === route) {
          found = true;
          break;
        }
      }
      if (!found) {
        continue;
      }
      parts = parts.join(this.options.paramPrefix);
      params = parts.length ? parts.split(this.options.paramPrefix) : [];
      _results.push(this.options.routes[i].apply(this.options.routes[i], params));
    }
    return _results;
  };

  Store.prototype.toString = function() {
    var name, route, segments, sortedRoutes, _i, _len;
    if (!this.routes) {
      return "";
    }
    segments = "";
    sortedRoutes = [];
    for (name in this.routes) {
      sortedRoutes.push({
        name: name,
        params: this.routes[name]
      });
    }
    sortedRoutes.sort(function(a, b) {
      return 0;
    });
    for (_i = 0, _len = sortedRoutes.length; _i < _len; _i++) {
      route = sortedRoutes[_i];
      segments += this.options.routePrefix + route.name;
      if (route.params && JSON.stringify(route.params) !== JSON.stringify([]) && route.params !== true) {
        segments += this.options.routeSuffix;
        if (route.params instanceof Array) {
          segments += route.params.join(this.options.paramPrefix);
        } else {
          segments += route.params;
        }
      }
    }
    return segments;
  };

  return Store;

})();



},{"./Route":2,"./Utils":4}],4:[function(require,module,exports){
var GUID, Utils;

GUID = 10001;

module.exports = new (Utils = (function() {
  function Utils() {}

  Utils.prototype.overwrite = function(object) {
    var key, source, sources, _i, _len;
    sources = Array.prototype.slice.call(arguments, 0);
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (key in source) {
        object[key] = source[key];
      }
    }
    return object;
  };

  Utils.prototype.createFunctor = function(prototype, options) {
    var functor;
    functor = function() {
      return functor[functor.sync ? "trigger" : "triggerAsync"].apply(functor, arguments);
    };
    this.overwrite(functor, prototype, {
      multirouterGuid: GUID++
    });
    prototype.constructor.call(functor, options);
    return functor;
  };

  return Utils;

})());



},{}]},{},[1])(1)
});
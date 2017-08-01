'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* ==========================================================================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        Action
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ========================================================================== */

var _isempty = require('lodash/isempty');

var _isempty2 = _interopRequireDefault(_isempty);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _includes = require('lodash/includes');

var _includes2 = _interopRequireDefault(_includes);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _request = require('./utils/request');

var _request2 = _interopRequireDefault(_request);

var _argumentsParser = require('./utils/arguments-parser');

var _argumentsParser2 = _interopRequireDefault(_argumentsParser);

var _urlParser = require('./utils/url-parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Action = function () {
  function Action(Model, name, config, data, mappings, interceptors) {
    _classCallCheck(this, Action);

    this.Model = Model; // `Model` class
    this.name = name; // action name
    this.config = config; // action default config
    this.data = data; // `Model` instance data (usage: [action url construction, action request body])
    this.mappings = mappings; // for construction action url
    this.interceptors = interceptors; // `request` config and `response` data control
  }

  /**
   * Build `request config` 
   *
   * @param {Array} kwarg - List of arguments provided to action
   *
   * @return {Promise} config - Config vrapped in Promise for processing in interceptors
   * @structure {Promise} config - { url, options: { method, [body] }, [resolveFn, [rejectionFn]] }
   */

  _createClass(Action, [{
    key: 'configure',
    value: function configure() {
      var _this = this;

      for (var _len = arguments.length, kwargs = Array(_len), _key = 0; _key < _len; _key++) {
        kwargs[_key] = arguments[_key];
      }

      return new _promise2.default(function (resolve, reject) {
        // Parse action arguments
        var argsConfig = _argumentsParser2.default.apply(undefined, kwargs);

        // Build request url
        var apiUrl = (0, _urlParser.parseUrl)(_this.config.url, _this.mappings, _this.data);
        var apiUrlQuery = (0, _urlParser.parseUrlQuery)(apiUrl, argsConfig.params, _this.config.params);

        // Config
        var config = {
          url: (0, _urlParser.getPathFromUrl)(apiUrl) + '?' + apiUrlQuery,
          options: {
            method: _this.config.method || 'get'
          },
          resolveFn: argsConfig.resolveFn,
          rejectionFn: argsConfig.rejectionFn
        };

        // Request body
        if ((0, _includes2.default)(Action.httpMethodsWithBody, _this.config.method.toLowerCase())) {
          var body = !(0, _isempty2.default)(argsConfig.body) ? argsConfig.body : _this.data;

          if (!(0, _isempty2.default)(body)) {
            // Use `transformRequest`
            var transformedBody = (0, _isFunction2.default)(_this.config.transformRequest) ? _this.config.transformRequest(body) : body;

            config.options.body = JSON.stringify(transformedBody);
          }
        }

        resolve(config);
      });
    }

    /**
     * Build and fetch action request
     * 
     * @param {Array} kwarg - Array of arguments provided for action 
     *
     * @return {Promise} promise - Promise of action request
     */

  }, {
    key: 'promise',
    value: function promise() {
      var _this2 = this;

      var cfg = this.configure.apply(this, arguments);

      return this.interceptors.request(cfg) // Use `request` interceptor
      .then(function (_ref) {
        var url = _ref.url,
            options = _ref.options,
            resolveFn = _ref.resolveFn,
            rejectionFn = _ref.rejectionFn;

        var promise = (0, _request2.default)(url, options);

        // Make instance/instances from response
        promise = _this2.makeInstances(promise);

        // Use `response` interceptor
        promise = _this2.interceptors.response(promise);

        // Use `transformResponse`
        if ((0, _isFunction2.default)(_this2.config.transformResponse)) {
          promise = promise.then(_this2.config.transformResponse);
        }

        // Callbacks
        if ((0, _isFunction2.default)(resolveFn)) promise = promise.then(resolveFn);
        if ((0, _isFunction2.default)(rejectionFn)) promise = promise.catch(rejectionFn);

        return promise;
      });
    }

    /**
     * Make instance/instances from action response data
     *
     * @param {Promise} promise - Action response promise
     *
     * @return {Object|Array} data - Maybe instance/instances of `Model` class
     */

  }, {
    key: 'makeInstances',
    value: function makeInstances(promise) {
      var _this3 = this;

      return promise.then(function (data) {
        if ((0, _isArray2.default)(data)) {
          return (0, _map2.default)(data, function (i) {
            return new _this3.Model(i);
          });
        } else if ((0, _isObject2.default)(data)) {
          return new _this3.Model(data);
        }

        return data;
      });
    }
  }]);

  return Action;
}();

Action.httpMethodsWithBody = ['post', 'put', 'patch', 'delete'];
exports.default = Action;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* ==========================================================================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ActionsBuilder
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ========================================================================== */

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _Action = require('./Action');

var _Action2 = _interopRequireDefault(_Action);

var _Interceptors = require('./Interceptors');

var _Interceptors2 = _interopRequireDefault(_Interceptors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActionsBuilder = function () {
  function ActionsBuilder(Model, url) {
    var _this = this;

    var mappings = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var customActions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, ActionsBuilder);

    // `ReactResource` config
    this.resource = {
      url: url,
      mappings: mappings,
      customActions: customActions
    };

    // `Model` actions configs
    this.actions = (0, _reduce2.default)((0, _merge2.default)(customActions, ActionsBuilder.defaults), function (accumulator, cfg, name) {
      accumulator[name] = _this.configure(name, cfg);

      return accumulator;
    }, {});

    // `Model` interceptors
    this.interceptors = new _Interceptors2.default(Model);
  }

  /**
   * Merge default action config with `ReactResource` customActions config
   *
   * @param {String} name - Name of action
   * @param {Object} config - Default action config
   *
   * @return {Object} - Merged config
   */

  _createClass(ActionsBuilder, [{
    key: 'configure',
    value: function configure(name, config) {
      var _resource = this.resource,
          url = _resource.url,
          customActions = _resource.customActions;


      return (0, _merge2.default)({ url: url }, config, customActions[name]);
    }

    /**
     * Build class actions
     *
     * @param {Class} Model - `Model` class for creating class methods
     *
     * @return {Class} Model - `Model` class with class methods
     */

  }, {
    key: 'classMethods',
    value: function classMethods(Model) {
      var _this2 = this;

      var mappings = this.resource.mappings;


      (0, _each2.default)(this.actions, function (cfg, name) {
        // First argument can be `data` or successfull request `callback function`
        Model[name] = function () {
          for (var _len = arguments.length, kwargs = Array(_len), _key = 0; _key < _len; _key++) {
            kwargs[_key] = arguments[_key];
          }

          // Extract `data` from arguments and pass it as param to `Action` constructor
          var data = (0, _isFunction2.default)(kwargs[0]) ? {} : kwargs.shift();
          var action = new _Action2.default(Model, name, cfg, data, mappings, _this2.interceptors);

          return action.promise.apply(action, kwargs);
        };
      });

      return Model;
    }

    /**
     * Build instance actions
     *
     * @param {Object} data - `Model` instance data for request
     * @param {Class} Model - `Model` class for creating instance/prototype methods
     *
     * @return {Class} Model - `Model` class with instance/prototype methods
     */

  }, {
    key: 'instanceMethods',
    value: function instanceMethods(data, Model) {
      var _this3 = this;

      var mappings = this.resource.mappings;


      (0, _each2.default)(this.actions, function (cfg, name) {
        Model.prototype['$' + name] = function () {
          var action = new _Action2.default(Model, name, cfg, data, mappings, _this3.interceptors);

          return action.promise.apply(action, arguments);
        };
      });

      return Model;
    }
  }]);

  return ActionsBuilder;
}();

ActionsBuilder.defaults = {
  'query': { url: undefined, params: {}, method: 'get' },
  'get': { url: undefined, params: {}, method: 'get' },
  'create': { url: undefined, params: {}, method: 'post' },
  'update': { url: undefined, params: {}, method: 'put' },
  'delete': { url: undefined, params: {}, method: 'delete' }
};
exports.default = ActionsBuilder;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Interceptors
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * =============================================================================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Before you start creating interceptors, be sure to understand the deferred/promise APIs.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * For purposes of global error handling, authentication, or any kind of synchronous or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * able to intercept requests before they are handed to the server and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * responses before they are handed over to the application code that
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * initiated these requests.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * There are two kinds of interceptors (and two kinds of rejection interceptors):
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   * `request`: interceptors get called with a http `config` object. The function is free to
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     modify the `config` object or create a new one. The function needs to return the `config`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     object directly, or a promise containing the `config` or a new `config` object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     resolved with a rejection.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   * `response`: interceptors get called with http `response` object. The function is free to
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     modify the `response` object or create a new one. The function needs to return the `response`
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     object directly, or as a promise containing the `response` or a new `response` object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *     resolved with a rejection.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _isFunction = require('lodash/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interceptors = function () {
  function Interceptors(Model) {
    _classCallCheck(this, Interceptors);

    this.Model = Model;
  }

  _createClass(Interceptors, [{
    key: 'request',
    value: function request(config) {
      // Resource
      (0, _each2.default)(_index2.default.interceptors, function (i) {
        if ((0, _isFunction2.default)(i.request)) config = config.then(i.request);
        if ((0, _isFunction2.default)(i.requestError)) config = config.catch(i.requestError);
      });

      // Model
      (0, _each2.default)(this.Model.interceptors, function (i) {
        if ((0, _isFunction2.default)(i.request)) config = config.then(i.request);
        if ((0, _isFunction2.default)(i.requestError)) config = config.catch(i.requestError);
      });

      return config;
    }
  }, {
    key: 'response',
    value: function response(promise) {
      // Resource
      (0, _each2.default)(_index2.default.interceptors, function (i) {
        if ((0, _isFunction2.default)(i.response)) promise = promise.then(i.response);
        if ((0, _isFunction2.default)(i.responseError)) promise = promise.catch(i.responseError);
      });

      // Model
      (0, _each2.default)(this.Model.interceptors, function (i) {
        if ((0, _isFunction2.default)(i.response)) promise = promise.then(i.response);
        if ((0, _isFunction2.default)(i.responseError)) promise = promise.catch(i.responseError);
      });

      return promise;
    }
  }]);

  return Interceptors;
}();

exports.default = Interceptors;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchOptions = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* ==========================================================================
                                                                                                                                                                                                                                                                                 ReactResource
                                                                                                                                                                                                                                                                                 ========================================================================== */

exports.default = ReactResource;

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _isempty = require('lodash/isempty');

var _isempty2 = _interopRequireDefault(_isempty);

var _request = require('./utils/request');

var _ActionsBuilder = require('./ActionsBuilder');

var _ActionsBuilder2 = _interopRequireDefault(_ActionsBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import test from './test';

// Expose global 'whatwg-fetch' options
var fetchOptions = exports.fetchOptions = _request.defaults;

function ReactResource() {
  for (var _len = arguments.length, kwargs = Array(_len), _key = 0; _key < _len; _key++) {
    kwargs[_key] = arguments[_key];
  }

  var actionsBuilder = new (Function.prototype.bind.apply(_ActionsBuilder2.default, [null].concat([Model], kwargs)))();

  function Model() {
    var _this = this;

    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Model instance data
    if (!(0, _isempty2.default)(data)) {
      (0, _each2.default)(data, function (val, key) {
        return _this[key] = val;
      });
    }

    // Model instance actions
    actionsBuilder.instanceMethods(data, Model);

    return this;
  };

  // Model class interceptors
  Model.interceptors = [];

  // Model class actions
  actionsBuilder.classMethods(Model);

  return Model;
}

// Global interceptors
ReactResource.interceptors = [];

if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== undefined) {
  window.ReactResource = ReactResource;
  // test();
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = test;

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function test() {
  /* 
     Create `Model`
     ========================================================================== */

  var User = new _index2.default('/api/users/{:id}.json', { id: ':id' }, {
    // override `query` action config
    query: {
      //Default action params - enables pagination in response
      params: {
        limit: 10,
        offset: 0
      },

      /**
       * Transform paginated response from server.
       * Make `User` model instances from response data.
       *
       * @param {Object} response - `{count: 2, results: [userData1, userData2]}`
       *
       * @return {Object} - `{count: 2, results: [new User(userData1), new User(userData2)]}`
       */

      transformResponse: function transformResponse(response) {
        var transformedResponse = _extends({}, response, {
          results: (0, _map2.default)(response.results, function (userData) {
            return new User(userData);
          })
        });

        console.log('[User][QUERY][transformResponse] from: ', response);
        console.log('[User][QUERY][transformResponse] to: ', transformedResponse);

        return transformedResponse;
      }
    },

    // override `create` action config
    create: {
      transformRequest: function transformRequest(data) {
        // server requires json in format `{user: data}`
        var userJson = { user: data };

        console.log('[User][CREATE][transformRequest] from: ', data);
        console.log('[User][CREATE][transformRequest] to: ', userJson);

        return userJson;
      }
    }
  });

  var user = new User({ first_name: 'John', last_name: 'Doe' });
  user.$create({}, { lol: 'TEST' }, function (user) {
    console.warn('User', user);
  });
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = test;

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function test() {
  // GLOBAL interceptors
  _index2.default.interceptors.push({
    // Request
    request: function request(data) {
      console.log('ReactResource.interceptors - request', data);
      return data;
    },
    requestError: function requestError(rejection) {
      console.log('ReactResource.interceptors - requestError', rejection);
      return rejection;
    },

    // Response
    response: function response(_response) {
      console.log('ReactResource.interceptors - response', _response);
      return _response;
    },
    responseError: function responseError(rejection) {
      console.log('ReactResource.interceptors - responseError', rejection);
      return rejection;
    }
  });

  // Create MODEL
  var User = new _index2.default('/api/users/{:id}.json', { id: ':id' }, {
    // Override base action
    query: {
      params: {
        limit: 10,
        offset: 0
      }
    },

    get: {
      transformRequest: function transformRequest(data) {
        return data;
      },
      transformResponse: function transformResponse(data) {
        return data;
      }
    },

    create: {
      transformRequest: function transformRequest(data) {
        var returnValue = {
          user: data
        };
        console.log('Create transformRequest', data, returnValue);
        return returnValue;
      }
    },

    // Create custom action
    myAction: {
      method: 'get',
      url: '/api/users/{:id}/custom_action'
    }
  });

  // MODEL interceptors
  User.interceptors.push({
    // Request
    request: function request(config) {
      console.log('User.interceptors - request', config);
      return config;
    },
    requestError: function requestError(rejection) {
      console.log('User.interceptors - requestError', rejection);
      return rejection;
    },

    // Response
    response: function response(_response2) {
      console.log('User.interceptors - response', _response2);
      return _response2;
    },
    responseError: function responseError(rejection) {
      console.log('User.interceptors - responseError', rejection);
      return rejection;
    }
  });

  // Instance classes
  User.prototype.getName = function () {
    return [this.first_name, this.last_name].join(" ");
  };

  window.user = new User({ id: 5 });
  window.User = User;
}

function testClassInterceptors(argument) {
  // body...
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* ==========================================================================
                                                                                                                                                                                                                                                                                 Arguments parser
                                                                                                                                                                                                                                                                                 ========================================================================== */

exports.default = argumentsParser;

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _inrange = require('lodash/inrange');

var _inrange2 = _interopRequireDefault(_inrange);

var _isequal = require('lodash/isequal');

var _isequal2 = _interopRequireDefault(_isequal);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Defaults
var defaults = {
  params: {},
  body: {},
  resolveFn: undefined,
  rejectionFn: undefined
};

var argsParser = {
  // Model.action();
  0: function _() {},

  // Model.action([query]);
  // Model.action([resolveFn]);
  1: function _() {
    for (var _len = arguments.length, kwargs = Array(_len), _key = 0; _key < _len; _key++) {
      kwargs[_key] = arguments[_key];
    }

    if (areTypesEqual(['object'], kwargs)) {
      return { params: kwargs[0] };
    } else if (areTypesEqual(['function'], kwargs)) {
      return { resolveFn: kwargs[0] };
    }
  },

  // Model.action([query, [body]]);
  // Model.action([query, [resolveFn]]);
  // Model.action([resolveFn, [rejectionFn]]);
  2: function _() {
    for (var _len2 = arguments.length, kwargs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      kwargs[_key2] = arguments[_key2];
    }

    if (areTypesEqual(['object', 'object'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1] };
    } else if (areTypesEqual(['object', 'function'], kwargs)) {
      return { params: kwargs[0], resolveFn: kwargs[1] };
    } else if (areTypesEqual(['function', 'function'], kwargs)) {
      return { resolveFn: kwargs[0], rejectionFn: kwargs[1] };
    }
  },

  // Model.action([query, [body, [resolveFn]]]);
  // Model.action([query, [resolveFn, [rejectionFn]]]);
  3: function _() {
    for (var _len3 = arguments.length, kwargs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      kwargs[_key3] = arguments[_key3];
    }

    if (areTypesEqual(['object', 'object', 'function'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1], resolveFn: kwargs[2] };
    } else if (areTypesEqual(['object', 'function', 'function'], kwargs)) {
      return { params: kwargs[0], resolveFn: kwargs[1], rejectionFn: kwargs[2] };
    }
  },

  // Model.action([query, [body, [resolveFn, [rejectionFn]]]]);
  4: function _() {
    for (var _len4 = arguments.length, kwargs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      kwargs[_key4] = arguments[_key4];
    }

    if (areTypesEqual(['object', 'object', 'function', 'function'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1], resolveFn: kwargs[2], rejectionFn: kwargs[3] };
    }
  }
};

function argumentsParser() {
  for (var _len5 = arguments.length, kwargs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    kwargs[_key5] = arguments[_key5];
  }

  var parser = argsParser[kwargs.length];
  var argsConfig = parser ? parser.apply(undefined, kwargs) : {};

  return (0, _merge2.default)(argsConfig, defaults);
}

/* 
   Helpers
   ========================================================================== */

function areTypesEqual(pattern, kwargs) {
  if (pattern.length === kwargs.length) {
    var kwargsTypes = (0, _map2.default)(kwargs, function (i) {
      return typeof i === 'undefined' ? 'undefined' : _typeof(i);
    });

    return (0, _isequal2.default)(pattern, kwargsTypes);
  }

  return false;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = undefined;
exports.default = request;
exports.parseJSON = parseJSON;

require('whatwg-fetch');

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Expose default settings
 */

/* ==========================================================================
   Request
   ========================================================================== */

var defaults = exports.defaults = {
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} options   The options we want to pass to "fetch"
 *
 * @return {object}           An object containing either "data" or "error"
 */

function request(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return fetch(url, (0, _merge2.default)(options, defaults)).then(checkStatus).then(parseJSON).then(function (data) {
    return data;
  });
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */

function parseJSON(response) {
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */

function checkStatus(response) {
  // return response;
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  var error = new Error(response.statusText);
  error.response = response;

  throw error;
}
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* ==========================================================================
                                                                                                                                                                                                                                                                                 URL parser
                                                                                                                                                                                                                                                                                 ========================================================================== */

exports.parseUrl = parseUrl;
exports.parseUrlQuery = parseUrlQuery;
exports.getPathFromUrl = getPathFromUrl;
exports.serialize = serialize;

var _each = require('lodash/each');

var _each2 = _interopRequireDefault(_each);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* 
   Url
   ========================================================================== */

function parseUrl(url, mappings, data) {
  var outputUrl = url;

  // Replace mappings `api/{:id}` => `api/10`
  (0, _each2.default)(mappings, function (mapping, propertyName) {
    var propertyValue = data[propertyName];
    // Replace mapping key by source value if it exists
    if (propertyValue) {
      outputUrl = outputUrl.replace(new RegExp('{' + mapping + '}', 'g'), propertyValue);
    } else {
      // Delete mapping key from url
      outputUrl = outputUrl.replace(new RegExp('/?{' + mapping + '}', 'g'), '');
    }
  });

  // Delete unmatched mappings from url
  outputUrl = outputUrl.replace(/\/?\{\:.+\}/i, "");

  return outputUrl;
}

/* 
   URL Query string
   ========================================================================== */

function parseUrlQuery(url, argsParams, configParams) {
  var regex = /[?&]([^=#]+)=([^&#]*)/g;
  var urlParams = {};
  var match = void 0;

  while (match = regex.exec(url)) {
    urlParams[match[1]] = match[2];
  }

  return serialize((0, _merge2.default)(argsParams, configParams, urlParams));
}

/* 
   Helpers
   ========================================================================== */

function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}

function serialize(obj, prefix) {
  var str = [];
  var p = void 0;

  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var key = prefix ? prefix + '[' + p + ']' : p;
      var value = obj[p];

      str.push(value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === "object" ? serialize(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }
  }

  return str.join("&");
}

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* ==========================================================================
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        Action
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ========================================================================== */

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

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
          var body = !(0, _isEmpty2.default)(argsConfig.body) ? argsConfig.body : _this.data;

          if (!(0, _isEmpty2.default)(body)) {
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
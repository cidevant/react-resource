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
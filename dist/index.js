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

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

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
    if (!(0, _isEmpty2.default)(data)) {
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
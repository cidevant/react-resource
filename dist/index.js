'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchOptions = undefined;
exports.default = ReactResource;

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _request = require('./utils/request');

var _ActionsBuilder = require('./ActionsBuilder');

var _ActionsBuilder2 = _interopRequireDefault(_ActionsBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import test from './test';

// Expose global 'whatwg-fetch' options
var fetchOptions = exports.fetchOptions = _request.defaults; /* ==========================================================================
                                                                ReactResource
                                                                ========================================================================== */

function ReactResource() {
  for (var _len = arguments.length, kwargs = Array(_len), _key = 0; _key < _len; _key++) {
    kwargs[_key] = arguments[_key];
  }

  var actionsBuilder = new (Function.prototype.bind.apply(_ActionsBuilder2.default, [null].concat([Model], kwargs)))();

  function Model() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Model instance data
    (0, _assign2.default)(this, data);

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
ReactResource.transformers = [];

if (typeof window !== 'undefined') {
  window.ReactResource = ReactResource;
  // test();
}
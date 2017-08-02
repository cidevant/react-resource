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

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

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

    return (0, _isEqual2.default)(pattern, kwargsTypes);
  }

  return false;
}
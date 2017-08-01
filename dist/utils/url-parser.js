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
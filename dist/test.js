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
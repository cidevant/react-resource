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
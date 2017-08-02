import ReactResource from './index';

export default function test() {
  // GLOBAL interceptors
  ReactResource.interceptors.push({
    // Request
    request: function (data) {
      console.log('ReactResource.interceptors - request', data);
      return data;
    },
    requestError: function (rejection) {
      console.log('ReactResource.interceptors - requestError', rejection);
      return rejection;
    },

    // Response
    response: function(response) {
      console.log('ReactResource.interceptors - response', response);
      return response;
    },
    responseError: function (rejection) {
      console.log('ReactResource.interceptors - responseError', rejection);
      return rejection;
    },
  });

  // Create MODEL
  const User = new ReactResource('/api/users/{:id}.json', 
    { id: ':id' }, 
    {
      // Override base action
      query: {
        params: {
          limit: 10,
          offset: 0,
        },
      },

      get: {
        transformRequest: (data) => {
          return data;
        },
        transformResponse: (data) => {
          return data;
        },
      },

      create: {
        transformRequest: (data) => {
          const returnValue = {
            user: data,
          };
          console.log('Create transformRequest', data, returnValue);
          return returnValue;
        },
      },

      // Create custom action
      myAction: {
        method: 'get',
        url: '/api/users/{:id}/custom_action',
      },
    }
  );

  // MODEL interceptors
  User.interceptors.push({
    // Request
    request: function (config) {
      console.log('User.interceptors - request', config);
      return config;
    },
    requestError: function (rejection) {
      console.log('User.interceptors - requestError', rejection);
      return rejection;
    },

    // Response
    response: function(response) {
      console.log('User.interceptors - response', response);
      return response;
    },
    responseError: function (rejection) {
      console.log('User.interceptors - responseError', rejection);
      return rejection;
    },
  });

  // Instance classes
  User.prototype.getName = function() {
    return [this.first_name, this.last_name].join(" ");
  }

  window.user = new User({id: 5});
  window.User = User;
}

function testClassInterceptors(argument) {
  // body...
}

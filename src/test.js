import ReactResource from './index';

export default function test() {
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
  const User = new ReactResource('/api/enums/?format=json&test={:id}', 
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

      // Create custom action
      myAction: {
        method: 'get',
        url: '/users/{:id}/custom_action/?format=json',
      },
    }
  );

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

  User.prototype.getRoles = function() {
    return this.roles;
  }
  
  const user = new User({ id: 1 });
  user.$get((u) => {
    console.log('user.$get', u);
  });

  window.User = User;
}

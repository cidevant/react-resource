import ReactResource from './index';

export default function test() {

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

  User.prototype.getRoles = function() {
    return this.roles;
  }
  
  const user = new User({ id: 1 });
  user.$get((u) => {
    console.log('RESPONSE', u);
    console.log('GETROLES', u.getRoles());
  });

  window.User = User;
}

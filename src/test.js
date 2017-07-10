import ReactResource from './index';

export default function test() {

  // Create MODEL
  const User = new ReactResource('/api/enums/?format=json', 
    { id: ':id' }, 
    {
      // Override base action
      query: {
        params: {
          limit: 10,
          offset: 0,
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
    console.log('INSTANCE', u);
  });

  User.get((i) => {
    console.log('CLASS', i);
    window.user = i;
  })

  window.User = User;
}

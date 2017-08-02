import ReactResource from './index';
import map from 'lodash/map';
export default function test() {
  /* 
     Create `Model`
     ========================================================================== */

  const User = new ReactResource('/api/users/{:id}.json', 
    { id: ':id' }, 
    {
      // override `query` action config
      query: {
        //Default action params - enables pagination in response
        params: {
          limit: 10,
          offset: 0,
        },

        /**
         * Transform paginated response from server.
         * Make `User` model instances from response data.
         *
         * @param {Object} response - `{count: 2, results: [userData1, userData2]}`
         *
         * @return {Object} - `{count: 2, results: [new User(userData1), new User(userData2)]}`
         */
        
        transformResponse: (response) => {
          const transformedResponse = {
            ...response,
            results: map(response.results, (userData) => new User(userData)),
          };

          console.log('[User][QUERY][transformResponse] from: ', response);
          console.log('[User][QUERY][transformResponse] to: ', transformedResponse);

          return transformedResponse;
        },
      },

      // override `create` action config
      create: {
        transformRequest: (data) => {
          // server requires json in format `{user: data}`
          const userJson = { user: data };

          console.log('[User][CREATE][transformRequest] from: ', data);
          console.log('[User][CREATE][transformRequest] to: ', userJson);

          return userJson;
        },
      },
    }
  );


  const user = new User({first_name: 'John', last_name: 'Doe'});
  user.$create({}, {lol: 'TEST'},(user) => {
    console.warn('User', user)
  });

}

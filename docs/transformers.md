# Transformers

There are two types of transformers:

* `request` - The transform function takes the http request body and returns its transformed (typically serialized) version.
  Usually used when sending data to server in specific format.

* `response` - The transform function takes the http response body and returns its transformed (typically deserialized) version.
  Usually used for making `Model` instances from unusual server response format (pagination)

## Examples

```
import ReactResource from 'react-resource';

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

User.create({first_name: 'John', last_name: 'Doe'}, (response) => {
  console.warn('[User][CREATE][response]', response);
}).then(() => {
  User.query((response) => {
    console.warn('[User][QUERY][response]', response);
  })
});

/**
 * Console output:
 * 
 * [User][CREATE][transformRequest] from:  Object {first_name: "John", last_name: "Doe"}
 * [User][CREATE][transformRequest] to:  Object {user: Object}
 * [User][CREATE][response] User {id: 3, first_name: "John", last_name: "Doe", ...}

 * [User][QUERY][transformResponse] from: Object {count: 3, results: [Object, Object, Object]}
 * [User][QUERY][transformResponse] to: Object {count: 3, results: [User, User, User]}
 * [User][QUERY][response] Object {count: 3, results: [User, User, User]}
 */

```

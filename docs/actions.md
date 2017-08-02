# Actions

Action describes the request to be made and how it should be processed. 

## Default actions

```jsx
// { actionName: actionConfig }
{ 
  'query': { method: 'GET' },
  'get': { method: 'GET' },
  'create': { method: 'POST' },
  'update': { method: 'PUT' },
  'delete': { method: 'DELETE' },
}
```

## Action config

* **method** – `{string}` – HTTP method (e.g. `GET`, `POST`, etc)
* **url** – `{string}` – Absolute or relative URL of the resource that is being requested.
* **params** – `{Object}` – Params object will be turned to `?key1=value1&key2=value2` after the url.
* **transformRequest** – `function(data)` – The transform function takes the http request body and returns its transformed (typically serialized) version.
* **transformResponse** – `function(data)` – The transform function takes the http response body and returns its transformed (typically deserialized) version.

## Action definitions

Each action is defined as:

* __Class method__

  ```jsx
  // Create `User` model class
  const User = new ReactResource('/api/users/{:id}', {id: ':id'});

  // Call `get` action on class
  User.get({id: 1})
  ```

* __Instance method__

  > Prefixed with `$` dollar sign

  ```jsx
  // Create `User` model class
  const User = new ReactResource('/api/users/{:id}', {id: ':id'});

  // Create `User` instance
  const user = new User({id: 1});

  // Call `get` action on instance
  user.$get()
  ```

## Action arguments

* __initObject__ - {Object} - data of `Model` instance
* __params__ - {Object} - action url query params
* __body__ - {Object} - action request body. 
* __resolveFn__ - {function(response)} - successfull request callback function
* __rejectFn__ - {function(rejection)} - rejected request callback function

There are two types of arguments list:

* __Full__ (first argument is __Object__)

  ```jsx
  // Class method action
  Model.create(initObject, [params, [body, [resolveFn, [rejectFn]]]])

  // Instance method action
  model = new Model(initObject);
  model.$create(params, [body, [resolveFn, [rejectFn]]])
  ```

* __Callbacks__ (first argument is __Function__)

  ```jsx
  // Class method action
  Model.query(resolveFn, [rejectFn])

  // Instance method action
  model = new Model();
  model.$query(resolveFn, [rejectFn])
  ```

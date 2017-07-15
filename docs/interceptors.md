# Interceptors

> Copied from AngularJs (1.3) source code comments

Before you start creating interceptors, be sure to understand the deferred/promise APIs.

For purposes of global error handling, authentication, or any kind of synchronous or
asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
able to intercept requests before they are handed to the server and
responses before they are handed over to the application code that
initiated these requests.

There are two kinds of interceptors (and two kinds of rejection interceptors):

* `request`: interceptors get called with a http `config` object. The function is free to
  modify the `config` object or create a new one. The function needs to return the `config`
  object directly, or a promise containing the `config` or a new `config` object.
> `config` = `{ url, options: { method, body }, resolveFn, rejectionFn }`
* `requestError`: interceptor gets called when a previous interceptor threw an error or
  resolved with a rejection.
* `response`: interceptors get called with http `response` object. The function is free to
  modify the `response` object or create a new one. The function needs to return the `response`
  object directly, or as a promise containing the `response` or a new `response` object.
* `responseError`: interceptor gets called when a previous interceptor threw an error or
  resolved with a rejection.

Also there are two levels of interceptors:

* __Global__: used for intercepting all requests of all `Models`
* __Model class__: used for intercepting every `Model` action request

## Examples

```jsx
import ReactResource from './index';

/* 
   Create `Model`
   ========================================================================== */

const User = new ReactResource('/api/users/{:id}', { id: ':id' });

/* 
   Global interceptors
   ========================================================================== */

ReactResource.interceptors.push({
  request: function (config) {
    console.log('[INTERCEPTOR][Global][request]', config);
    return config;
  },
  requestError: function (rejection) {
    console.log('[INTERCEPTOR][Global][requestError]', rejection);
    return rejection;
  },
  response: function(response) {
    console.log('[INTERCEPTOR][Global][response]', response);
    return response;
  },
  responseError: function (rejection) {
    console.log('[INTERCEPTOR][Global][responseError]', rejection);
    return rejection;
  },
});

/* 
   `Model` class interceptors
   ========================================================================== */

User.interceptors.push({
  request: function (config) {
    console.log('[INTERCEPTOR][User][request]', config);
    return config;
  },
  requestError: function (rejection) {
    console.log('[INTERCEPTOR][User][requestError]', rejection);
    return rejection;
  },
  response: function(response) {
    console.log('[INTERCEPTOR][User][response]', response);
    return response;
  },
  responseError: function (rejection) {
    console.log('[INTERCEPTOR][User][responseError]', rejection);
    return rejection;
  },
});

User.get({id: 1});

/**
 * Console output:
 *
 * 1) [INTERCEPTOR][Global][request] Object {url: "/api/users/1?", options: {method: "get"}, resolveFn: undefined, rejectionFn: undefined}
 * 2) [INTERCEPTOR][User][request] Object {url: "/api/users/1?", options: {method: "get"}, resolveFn: undefined, rejectionFn: undefined}
 * 3) [INTERCEPTOR][Global][response] Model {id: 1, ...}
 * 4) [INTERCEPTOR][User][response] Model {id: 1, ...}
 */

```

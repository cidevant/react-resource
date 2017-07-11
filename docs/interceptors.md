# Interceptors

> Copied from AngularJs source code comments

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
* `requestError`: interceptor gets called when a previous interceptor threw an error or
  resolved with a rejection.
* `response`: interceptors get called with http `response` object. The function is free to
  modify the `response` object or create a new one. The function needs to return the `response`
  object directly, or as a promise containing the `response` or a new `response` object.
* `responseError`: interceptor gets called when a previous interceptor threw an error or
  resolved with a rejection.


## Examples

```
import ReactResource from 'react-resource';

// Global interceptors
ReactResource.interceptors.push({
  request: function (config) {
    console.log('ReactResource.interceptors - request', config);
    return config;
  },
  requestError: function (rejection) {
    console.log('ReactResource.interceptors - requestError', rejection);
    return rejection;
  },
  response: function(response) {
    console.log('ReactResource.interceptors - response', response);
    return response;
  },
  responseError: function (rejection) {
    console.log('ReactResource.interceptors - responseError', rejection);
    return rejection;
  },
});

const User = new ReactResource('/api/users/{:id}/?format=json', { id: ':id' });

// Resource interceptors
User.interceptors.push({
  request: function (config) {
    console.log('User.interceptors - request', config);
    return config;
  },
  requestError: function (rejection) {
    console.log('User.interceptors - requestError', rejection);
    return rejection;
  },
  response: function(response) {
    console.log('User.interceptors - response', response);
    return response;
  },
  responseError: function (rejection) {
    console.log('User.interceptors - responseError', rejection);
    return rejection;
  },
});

User.get({id: 1});

// -> ReactResource.interceptors - request ...
// -> User.interceptors - request ...
// -> ReactResource.interceptors - response ...
// -> User.interceptors - response ...
```

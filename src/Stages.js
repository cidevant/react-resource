/* 
 * Interceptors
 * =============================================================================
 *
 * Before you start creating interceptors, be sure to understand the deferred/promise APIs.
 *
 * For purposes of global error handling, authentication, or any kind of synchronous or
 * asynchronous pre-processing of request or postprocessing of responses, it is desirable to be
 * able to intercept requests before they are handed to the server and
 * responses before they are handed over to the application code that
 * initiated these requests.
 *
 * There are two kinds of interceptors (and two kinds of rejection interceptors):
 *
 *   * `request`: interceptors get called with a http `config` object. The function is free to
 *     modify the `config` object or create a new one. The function needs to return the `config`
 *     object directly, or a promise containing the `config` or a new `config` object.
 *   * `requestError`: interceptor gets called when a previous interceptor threw an error or
 *     resolved with a rejection.
 *   * `response`: interceptors get called with http `response` object. The function is free to
 *     modify the `response` object or create a new one. The function needs to return the `response`
 *     object directly, or as a promise containing the `response` or a new `response` object.
 *   * `responseError`: interceptor gets called when a previous interceptor threw an error or
 *     resolved with a rejection.
 *
 */

import ReactResource from './index';
import each from 'lodash/each';
import isFunction from 'lodash/isFunction';

export default class Stages {
  constructor(Model, which) {
    this.Model = Model;
    this.which = which;
  }

  request(config) {
    // Resource
    each(ReactResource[this.which], (i) => {
      if (isFunction(i.request)) config = config.then(i.request);
      if (isFunction(i.requestError)) config = config.catch(i.requestError);
    });

    // Model
    each(this.Model[this.which], (i) => {
      if (isFunction(i.request)) config = config.then(i.request);
      if (isFunction(i.requestError)) config = config.catch(i.requestError);
    });

    return config;
  };

  response(promise) {
    // Resource
    each(ReactResource[this.which], (i) => {
      if (isFunction(i.response)) promise = promise.then(i.response);
      if (isFunction(i.responseError)) promise = promise.catch(i.responseError);
    });

    // Model
    each(this.Model[this.which], (i) => {
      if (isFunction(i.response)) promise = promise.then(i.response);
      if (isFunction(i.responseError)) promise = promise.catch(i.responseError);
    });

    return promise;
  }
}

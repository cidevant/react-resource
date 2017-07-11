/* 
 * Interceptors
 * =============================================================================
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
 */

import ReactResource from './index';
import each from 'lodash/each';

export default class Interceptors {
  constructor(Model) {
    this.Model = Model;
  }

  request(config) {
    // Resource
    each(ReactResource.interceptors, (i) => {
      if (i.request) config = config.then(i.request);
      if (i.requestError) config = config.catch(i.requestError);
    });

    // Model
    each(this.Model.interceptors, (i) => {
      if (i.request) config = config.then(i.request);
      if (i.requestError) config = config.catch(i.requestError);
    });

    return config;
  };

  response(promise) {
    // Resource
    each(ReactResource.interceptors, (i) => {
      if (i.response) promise = promise.then(i.response);
      if (i.responseError) promise = promise.catch(i.responseError);
    });

    // Model
    each(this.Model.interceptors, (i) => {
      if (i.response) promise = promise.then(i.response);
      if (i.responseError) promise = promise.catch(i.responseError);
    });

    return promise;
  }
}

/* ==========================================================================
   Action
   ========================================================================== */

import isEmpty from 'lodash/isempty';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import includes from 'lodash/includes';
import map from 'lodash/map';
import each from 'lodash/each';
import Promise from 'promise';
import request from './utils/request';
import argumentsParser from './utils/arguments-parser';
import { parseUrl, parseUrlQuery, getPathFromUrl } from './utils/url-parser';
// import ReactResource from './index';

export default class Action {
  static httpMethodsWithBody = ['post', 'put', 'patch', 'delete'];

  constructor(Model, name, config, data, mappings) {
    this.Model = Model; // class for making instances
    this.name = name;
    this.config = config;
    this.data = data; // for url and request body
    this.mappings = mappings; // for url
  }

  /**
   * Make config promise for request.
   * Promise is used for ability to use request interceptors.
   *
   * @param {Array} kwarg - List of arguments provided to action
   *
   * @return {Promise} config - Promise with generated config
   */

  configure(...kwargs) {
    const configPromise = new Promise((resolve, reject) => {
      // Transform request data
      const data = isFunction(this.config.transformRequest)
        ? this.config.transformRequest(this.data)
        : this.data;

      const argsConfig = argumentsParser(...kwargs);
      const apiUrl = parseUrl(this.config.url, this.mappings, data);
      const apiUrlQuery = parseUrlQuery(apiUrl, argsConfig.params, this.config.params);
      const config = {
        url: `${getPathFromUrl(apiUrl)}?${apiUrlQuery}`,
        options: {
          method: this.config.method || 'get',
        },
        resolveFn: argsConfig.resolveFn,
        rejectionFn: argsConfig.rejectionFn,
      };

      // Append body
      if (includes(Action.httpMethodsWithBody, this.config.method.toLowerCase())) {
        const body = !isEmpty(argsConfig.body) ? argsConfig.body : data;

        if (!isEmpty(body)) config.options.body = body;
      }

      resolve(config);
    });

    // Request interceptors
    return this.requestInterceptors(configPromise);
  }

  /**
   * Build and fetch action request
   * 
   * @param {Array} kwarg - Array of arguments provided for action 
   *
   * @return {Promise} promise - Promise of action request
   */

  promise(...kwargs) {
    return this.configure(...kwargs)
      .then(({ url, options, resolveFn, rejectionFn }) => {
        let promise = request(url, options);
        
        // Response interceptors
        promise = this.responseInterceptors(promise);

        // Make instance/instances from request response
        promise = this.tryInstantiate(promise);

        // Transform response data
        if (isFunction(this.config.transformResponse)) {
          promise = promise.then(this.config.transformResponse);
        }

        // Callbacks
        if (isFunction(resolveFn)) promise = promise.then(resolveFn);
        if (isFunction(rejectionFn)) promise = promise.catch(rejectionFn);

        return promise;
      });
  }

  /**
   * Try to make instance/instances from action response data
   *
   * @param {Object/Array} {data} - Action response json data
   *
   * @return {Object/Array} data - Maybe instance/instances of Model class
   */

  tryInstantiate(promise) {
    return promise.then((data) => {
      const isDataArray = isArray(data);

      if (isDataArray && this.config.isArray) {
        return map(data, (i) => new this.Model(i));
      } else if (!isDataArray && isObject(data) && !this.config.isArray) {
        return new this.Model(data);
      }
      
      return data;
    });
  }

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

  requestInterceptors(config) {
    each(this.Model.interceptors, (i) => {
      if (i.request) config = config.then(i.request);
      if (i.requestError) config = config.catch(i.requestError);
    });

    return config;
  }

  responseInterceptors(promise) {
    each(this.Model.interceptors, (i) => {
      if (i.response) promise = promise.then(i.response);
      if (i.responseError) promise = promise.catch(i.responseError);
    });

    return promise;
  }
}

/* ==========================================================================
   Action
   ========================================================================== */

import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import includes from 'lodash/includes';
import map from 'lodash/map';
import Promise from 'promise';
import request from './utils/request';
import argumentsParser from './utils/arguments-parser';
import { parseUrl, parseUrlQuery, getPathFromUrl } from './utils/url-parser';

export default class Action {
  static httpMethodsWithBody = ['post', 'put', 'patch', 'delete'];

  constructor(Model, name, config, data, mappings, interceptors) {
    this.Model = Model; // `Model` class
    this.name = name; // action name
    this.config = config; // action default config
    this.data = data; // `Model` instance data (usage: [action url construction, action request body])
    this.mappings = mappings; // for construction action url
    this.interceptors = interceptors; // `request` config and `response` data control
  }

  /**
   * Build `request config`
   *
   * @param {Array} kwarg - List of arguments provided to action
   *
   * @return {Promise} config - Config vrapped in Promise for processing in interceptors
   * @structure {Promise} config - { url, options: { method, [body] }, [resolveFn, [rejectionFn]] }
   */

  configure(...kwargs) {
    return new Promise((resolve, reject) => {
      // Parse action arguments
      const argsConfig = argumentsParser(...kwargs);

      // Build request url
      const apiUrl = parseUrl(this.config.url, this.mappings, this.data);
      const apiUrlQuery = parseUrlQuery(apiUrl, argsConfig.params, this.config.params);

      // Config
      const config = {
        url: `${getPathFromUrl(apiUrl)}?${apiUrlQuery}`,
        options: {
          method: this.config.method || 'get',
        },
        resolveFn: argsConfig.resolveFn,
        rejectionFn: argsConfig.rejectionFn,
      };

      // Request body
      if (includes(Action.httpMethodsWithBody, this.config.method.toLowerCase())) {
        const body = !isEmpty(argsConfig.body) ? argsConfig.body : this.data;

        if (!isEmpty(body)) {
          // Use `transformRequest`
          const transformedBody = isFunction(this.config.transformRequest)
            ? this.config.transformRequest(body)
            : body;

          config.options.body = JSON.stringify(transformedBody);
        }
      }

      resolve(config);
    });
  }

  /**
   * Build and fetch action request
   *
   * @param {Array} kwarg - Array of arguments provided for action
   *
   * @return {Promise} promise - Promise of action request
   */

  promise(...kwargs) {
    const cfg = this.configure(...kwargs);

    return this.interceptors
      .request(cfg) // Use `request` interceptor
      .then(({ url, options, resolveFn, rejectionFn }) => {
        let promise = request(url, options);

        // Make instance/instances from response
        promise = this.makeInstances(promise);

        // Use `response` interceptor
        promise = this.interceptors.response(promise);

        // Use `transformResponse`
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
   * Make instance/instances from action response data
   *
   * @param {Promise} promise - Action response promise
   *
   * @return {Object|Array} data - Maybe instance/instances of `Model` class
   */

  makeInstances(promise) {
    return promise.then((data) => {
      if (isArray(data)) {
        return map(data, (i) => new this.Model(i));
      } else if (isObject(data)) {
        return new this.Model(data);
      }

      return data;
    });
  }
}

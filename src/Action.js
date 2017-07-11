/* ==========================================================================
   Action
   ========================================================================== */

import isEmpty from 'lodash/isempty';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import includes from 'lodash/includes';
import map from 'lodash/map';
import request from './utils/request';
import argumentsParser from './utils/arguments-parser';
import { parseUrl, parseUrlQuery, getPathFromUrl } from './utils/url-parser';

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
   * Make config for request
   *
   * @param {Array} kwarg - List of arguments provided to action
   *
   * @return {Object} config - Generated config
   */

  configure(...kwargs) {
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

    return config;
  }

  /**
   * Build and fetch action request
   * 
   * @param {Array} kwarg - Array of arguments provided for action 
   *
   * @return {Promise} promise - Promise of action request
   */

  promise(...kwargs) {
    const { url, options, resolveFn, rejectionFn } = this.configure(...kwargs);
    let promise = request(url, options);
    
    // Make instance/instances from request response
    promise = promise.then(this.tryInstantiate.bind(this));

    // Transform response data
    if (isFunction(this.config.transformResponse)) {
      promise = promise.then(this.config.transformResponse);
    }

    // Callbacks
    if (isFunction(resolveFn)) promise = promise.then(resolveFn);
    if (isFunction(rejectionFn)) promise = promise.catch(rejectionFn);

    return promise;
  }

  /**
   * Try to make instance/instances from action response data
   *
   * @param {Object/Array} {data} - Action response json data
   *
   * @return {Object/Array} data - Maybe instance/instances of Model class
   */

  tryInstantiate(data) {
    const isDataArray = isArray(data);
    if (isDataArray && this.config.isArray) {
      return map(data, (i) => new this.Model(i));
    } else if (!isDataArray && isObject(data) && !this.config.isArray) {
      return new this.Model(data);
    }
    
    return data;
  }
}

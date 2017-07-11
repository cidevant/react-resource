/* ==========================================================================
   ActionsBuilder
   ========================================================================== */

import reduce from 'lodash/reduce';
import each from 'lodash/each';
import merge from 'lodash/merge';
import isFunction from 'lodash/isFunction';
import Action from './Action';

export default class ActionsBuilder {
  static defaults = {
    'query': { url: undefined, params: {}, method: 'get', isArray: true },
    'get': { url: undefined, params: {}, method: 'get', isArray: false },
    'create': { url: undefined, params: {}, method: 'post', isArray: false },
    'update': { url: undefined, params: {}, method: 'put', isArray: false },
    'delete': { url: undefined, params: {}, method: 'delete', isArray: false },
  };

  constructor(url, mappings, customActions) {
    // Resource config
    this.resource = {
      url, 
      mappings, 
      customActions,
    };

    // Configured actions
    this.actions = reduce(
      merge(customActions, ActionsBuilder.defaults), 
      (accumulator, cfg, name) => {
        accumulator[name] = this.configure(name, cfg);

        return accumulator;
      },
      {}
    );
  }
  
  /**
   * Merge default action config with ReactResource customActions config
   *
   * @param {String} name - Name of action
   * @param {Object} arg - Default action config
   *
   * @return {Object} - Merged config
   */

  configure(name, config) {
    const { url, customActions } = this.resource;

    return merge(
      { url },
      config,
      customActions[name]
    );
  }

  /**
   * Build class actions
   *
   * @param {Class} Model - Target class for creating class methods
   *
   * @return {Class} Model - Target class with class methods
   */

  classMethods(Model) {
    const { mappings } = this.resource;

    each(this.actions, (cfg, name) => {
      /**
       * First argument of class action is usually data,
       * but sometimes you can provide resolve callback function.
       */
       
      Model[name] = (...kwargs) => {
        const data = isFunction(kwargs[0]) ? {} : kwargs.shift();
        const action = new Action(Model, name, cfg, data, mappings);

        return action.promise(...kwargs);
      };
    });

    return Model;
  }

  /**
   * Build instance actions
   *
   * @param {Object} data - Instance data
   * @param {Class} Model - Target class for creating instance/prototype methods
   *
   * @return {Class} Model - Target class with instance/prototype methods
   */

  instanceMethods(data, Model) {
    const { mappings } = this.resource;

    each(this.actions, (cfg, name) => {
      Model.prototype[`$${name}`] = (...kwargs) => {
        const action = new Action(Model, name, cfg, data, mappings);
        
        return action.promise(...kwargs);
      };
    });

    return Model;
  }
}

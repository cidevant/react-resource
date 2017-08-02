/* ==========================================================================
   ReactResource
   ========================================================================== */

import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';
import { defaults } from './utils/request';
import ActionsBuilder from './ActionsBuilder';
// import test from './test';

// Expose global 'whatwg-fetch' options
export const fetchOptions = defaults;

export default function ReactResource(...kwargs) {
  const actionsBuilder = new ActionsBuilder(Model, ...kwargs);

  function Model(data = {}) {
    // Model instance data
    if (!isEmpty(data)) {
      each(data, (val, key) => this[key] = val);
    }

    // Model instance actions
    actionsBuilder.instanceMethods(data, Model);

    return this;
  };

  // Model class interceptors
  Model.interceptors = [];

  // Model class actions
  actionsBuilder.classMethods(Model);

  return Model;
}

// Global interceptors
ReactResource.interceptors = [];

if (typeof window !== undefined) {
  window.ReactResource = ReactResource;
  // test();
}

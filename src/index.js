/* ==========================================================================
   ReactResource
   ========================================================================== */

import each from 'lodash/each';
import isEmpty from 'lodash/isempty';
import { defaults } from './utils/request';
import ActionsBuilder from './ActionsBuilder';
// import test from './test';

// Expose global 'whatwg-fetch' options
export const fetchOptions = defaults;

export default function ReactResource(...kwargs) {
  const actionsBuilder = new ActionsBuilder(...kwargs);

  function ReactResourceModel(data = {}) {
    // Instantiate data
    if (!isEmpty(data)) {
      each(data, (val, key) => this[key] = val);
    }

    // Instance actions
    actionsBuilder.instanceMethods(data, ReactResourceModel);

    return this;
  };

  // Model interceptors
  ReactResourceModel.interceptors = [];

  // Class actions
  actionsBuilder.classMethods(ReactResourceModel);

  return ReactResourceModel;
}

// Global interceptors
ReactResource.interceptors = [];

if (typeof window !== undefined) {
  window.ReactResource = ReactResource;
  // test();
}

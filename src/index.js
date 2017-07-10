/* ==========================================================================
   ReactResource
   ========================================================================== */

import each from 'lodash/each';
import isEmpty from 'lodash/isempty';
import { defaults } from './utils/request';
import ActionsBuilder from './ActionsBuilder';

export const fetchOptions = defaults;

export default function ReactResource(url, mappings = {}, customActions = {}) {
  const actionsBuilder = new ActionsBuilder(url, mappings, customActions);

  function ReactResourceModel(data = {}) {
    // Instantiate data
    if (!isEmpty(data)) {
      each(data, (val, key) => this[key] = val);
    }

    // Instance actions
    actionsBuilder.instanceMethods(data, ReactResourceModel);

    return this;
  };

  // Class actions
  actionsBuilder.classMethods(ReactResourceModel);

  return ReactResourceModel;
}

if (typeof window !== undefined) {
  window.ReactResource = ReactResource;
}

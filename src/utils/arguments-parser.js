/* ==========================================================================
   Arguments parser
   ========================================================================== */

import merge from 'lodash/merge';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';

// Defaults
const defaults = {
  params: {},
  body: {},
  resolveFn: undefined,
  rejectionFn: undefined,
};

const argsParser = {
  // Model.action();
  0: () => {},

  // Model.action([query]);
  // Model.action([resolveFn]);
  1: (...kwargs) => {
    if (areTypesEqual(['object'], kwargs)) {
      return { params: kwargs[0] };
    } else if (areTypesEqual(['function'], kwargs)) {
      return { resolveFn: kwargs[0] };
    }
  },

  // Model.action([query, [body]]);
  // Model.action([query, [resolveFn]]);
  // Model.action([resolveFn, [rejectionFn]]);
  2: (...kwargs) => {
    if (areTypesEqual(['object', 'object'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1] };
    } else if (areTypesEqual(['object', 'function'], kwargs)) {
      return { params: kwargs[0], resolveFn: kwargs[1] };
    } else if (areTypesEqual(['function', 'function'], kwargs)) {
      return { resolveFn: kwargs[0], rejectionFn: kwargs[1] };
    }
  },

  // Model.action([query, [body, [resolveFn]]]);
  // Model.action([query, [resolveFn, [rejectionFn]]]);
  3: (...kwargs) => {
    if (areTypesEqual(['object', 'object', 'function'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1], resolveFn: kwargs[2] };
    } else if (areTypesEqual(['object', 'function', 'function'], kwargs)) {
      return { params: kwargs[0], resolveFn: kwargs[1], rejectionFn: kwargs[2] };
    }
  },

  // Model.action([query, [body, [resolveFn, [rejectionFn]]]]);
  4: (...kwargs) => {
    if (areTypesEqual(['object', 'object', 'function', 'function'], kwargs)) {
      return { params: kwargs[0], body: kwargs[1], resolveFn: kwargs[2], rejectionFn: kwargs[3] };
    }
  },
};

export default function argumentsParser(...kwargs) {
  const parser = argsParser[kwargs.length];
  const argsConfig = parser ? parser(...kwargs) : {};

  return merge(argsConfig, defaults);
}

/*
   Helpers
   ========================================================================== */

function areTypesEqual(pattern, kwargs) {
  if (pattern.length === kwargs.length) {
    const kwargsTypes = map(kwargs, (i) => typeof i);

    return isEqual(pattern, kwargsTypes);
  }

  return false;
}

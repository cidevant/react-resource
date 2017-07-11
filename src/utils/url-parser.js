/* ==========================================================================
   URL parser
   ========================================================================== */

import each from 'lodash/each';
import merge from 'lodash/merge';

/* 
   Url
   ========================================================================== */

export function parseUrl(url, mappings, data) {
  let outputUrl = url;

  // Replace mappings `api/{:id}` => `api/10`
  each(mappings, (mapping, propertyName) => {
    const propertyValue = data[propertyName];
    // Replace mapping key by source value if it exists
    if(propertyValue) {
      outputUrl = outputUrl.replace(new RegExp(`\{${mapping}\}`, 'g'), propertyValue);
    } else {
      // Delete mapping key from url
      outputUrl = outputUrl.replace(new RegExp(`\/?\{${mapping}\}`, 'g'), ''); 
    }
  });

  // Delete unmatched mappings from url
  outputUrl = outputUrl.replace(/\/?\{\:.+\}/i, "");

  return outputUrl;
}

/* 
   URL Query string
   ========================================================================== */

export function parseUrlQuery(url, argsParams, configParams) {
  let regex = /[?&]([^=#]+)=([^&#]*)/g;
  let urlParams = {};
  let match;

  while(match = regex.exec(url)) {
    urlParams[match[1]] = match[2];
  }

  return serialize(merge(argsParams, configParams, urlParams));
}

/* 
   Helpers
   ========================================================================== */

export function getPathFromUrl(url) {
  return url.split(/[?#]/)[0];
}

export function serialize(obj, prefix) {
  const str = [];
  let p;

  for(p in obj) {
    if (obj.hasOwnProperty(p)) {
      const key = prefix ? `${prefix}[${p}]` : p;
      const value = obj[p];

      str.push(
        (value !== null && typeof value === "object") 
          ? serialize(value, key)
          : encodeURIComponent(key) + "=" + encodeURIComponent(value)
      );
    }
  }
  
  return str.join("&");
}

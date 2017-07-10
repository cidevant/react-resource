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
    // Replace mapping key by source value if exists source value
    if(propertyValue) {
      outputUrl = outputUrl.replace(new RegExp(`\{${mapping}\}`, 'g'), propertyValue);
    } else {
      // Delete mapping key from url
      outputUrl = outputUrl.replace(new RegExp(`\/?\{${mapping}\}`, 'g'), ''); 
    }
  });

  // Clear URL from unmatched mappings
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
  var str = [], p;
  for(p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

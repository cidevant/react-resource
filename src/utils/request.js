/* ==========================================================================
   Request
   ========================================================================== */

import 'whatwg-fetch';
import merge from 'lodash/merge';

/**
 * Expose default settings
 */

export const defaults = {
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} options   The options we want to pass to "fetch"
 *
 * @return {object}           An object containing either "data" or "error"
 */

export default function request(url, options = {}) {
  return fetch(url, merge(options, defaults))
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => (data));
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */

export function parseJSON(response) {
  if (!isJSON(response.headers)) {
    return response.text();
  } else {
    return response.json();
  }
}

/**
 * Verifies that the content returned is JSON
 *
 * @param  {object} headers from the network response
 *
 * @return {boolean} Whether the content-type includes JSON or not
 */

function isJSON(headers) {
  return headers.get('content-type').match(/json/i);
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */

function checkStatus(response) {
  // return response;
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;

  throw error;
}

/* ==========================================================================
   [COMPONENT] React-Resource
   --------------------------------------------------------------------------
   Component for creating http restful requests by using Promises.
   Written to symbiose with RefluxJs async actions.
   ========================================================================== */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = ReactResource;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _promise = require('promise');

var _promise2 = _interopRequireDefault(_promise);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _lodashEach = require('lodash/each');

var _lodashEach2 = _interopRequireDefault(_lodashEach);

var _lodashCloneDeep = require('lodash/cloneDeep');

var _lodashCloneDeep2 = _interopRequireDefault(_lodashCloneDeep);

var _lodashIsEmpty = require('lodash/isEmpty');

var _lodashIsEmpty2 = _interopRequireDefault(_lodashIsEmpty);

var _lodashIsNull = require('lodash/isNull');

var _lodashIsNull2 = _interopRequireDefault(_lodashIsNull);

var _lodashIsUndefined = require('lodash/isUndefined');

var _lodashIsUndefined2 = _interopRequireDefault(_lodashIsUndefined);

var _lodashStartsWith = require('lodash/startsWith');

var _lodashStartsWith2 = _interopRequireDefault(_lodashStartsWith);

// ------------------------------------------------------------------------------
// Resource class creator

function ReactResource(url, mappings, actionsConfig) {
  var resourceConfig = new ResourceConfig(url, mappings, actionsConfig);

  function Resource(initObject) {
    HelpersAndParsers.copyPureAttributes(initObject, this);
    ActionsBuilder.createInstanceActions(resourceConfig, this);
  }
  ActionsBuilder.createClassActions(resourceConfig, Resource);

  return Resource;
}

// Interceptors container and setter
ReactResource.interceptors = [];
ReactResource.add_interceptor = function (interceptorObj) {
  if (typeof interceptorObj == 'object' && (typeof interceptorObj.response == 'function' || typeof interceptorObj.rejection == 'function')) {
    ReactResource.interceptors.push(interceptorObj);
  }
};

// -----------------------------------------------------------------------------
// Builds Class and Instance actions on provided Resource

var ActionsBuilder = (function () {
  function ActionsBuilder() {
    _classCallCheck(this, ActionsBuilder);
  }

  // -----------------------------------------------------------------------------
  // Resource config creator

  _createClass(ActionsBuilder, null, [{
    key: 'createClassActions',
    value: function createClassActions(resourceConfig, resourceClass) {
      (0, _lodashEach2['default'])(Object.keys(resourceConfig.actionsConfig), function (actionName) {
        resourceClass[actionName] = ActionsBuilder.buildActionFromConfig(actionName, resourceConfig, {});
      });
    }
  }, {
    key: 'createInstanceActions',
    value: function createInstanceActions(resourceConfig, resourceInstance) {
      (0, _lodashEach2['default'])(Object.keys(resourceConfig.actionsConfig), function (actionName) {
        resourceInstance["$" + actionName] = ActionsBuilder.buildActionFromConfig(actionName, resourceConfig, resourceInstance);
      });
    }
  }, {
    key: 'buildActionFromConfig',
    value: function buildActionFromConfig(actionName, resourceConfig) {
      var ModelInstance = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var promiseConfig = HelpersAndParsers.parseArgs.apply(HelpersAndParsers, [actionName, resourceConfig, ModelInstance].concat(args));
        return ActionsBuilder.buildPromiseFromAction(actionName, resourceConfig, promiseConfig);
      };
    }
  }, {
    key: 'buildPromiseFromAction',
    value: function buildPromiseFromAction(actionName, resourceConfig, promiseConfig) {
      var actionConfig = resourceConfig.actionsConfig[actionName];
      return new _promise2['default'](function (resolvePromiseFn, rejectPromiseFn) {
        var newRequest = _superagent2['default'],
            actionMethod = actionConfig.method.toUpperCase();
        // Create
        switch (actionMethod) {
          case 'GET':
            newRequest = newRequest.get(promiseConfig.url);
            break;
          case 'POST':
            newRequest = newRequest.post(promiseConfig.url);
            break;
          case 'PUT':
          case 'PATCH':
            newRequest = newRequest.put(promiseConfig.url);
            break;
          case 'DELETE':
            newRequest = newRequest.del(promiseConfig.url);
            break;
        }
        // JSON
        newRequest.set('Accept', 'application/json');

        // queryParams
        newRequest.query(merge((0, _lodashCloneDeep2['default'])(actionConfig.params), promiseConfig.queryParams));

        // bodyData
        if (!(0, _lodashIsEmpty2['default'])(promiseConfig.bodyData) && ACTIONS_WITH_BODY.indexOf(actionMethod) > -1) {
          newRequest.send(promiseConfig.bodyData);
        }

        // Send
        newRequest.end(function (err, res) {
          if (err === null) {

            // Process interceptors - response functions
            (0, _lodashEach2['default'])(ReactResource.interceptors, function (interceptor) {
              if (typeof interceptor.response == 'function') interceptor.response(res);
            });

            resolvePromiseFn(res && res.body);
            if (promiseConfig.resolveFn && typeof promiseConfig.resolveFn == 'function') {
              promiseConfig.resolveFn(res && res.body);
            }
          } else {

            // Process interceptors - rejection functions
            (0, _lodashEach2['default'])(ReactResource.interceptors, function (interceptor) {
              if (typeof interceptor.rejection == 'function') interceptor.rejection(err, res);
            });

            rejectPromiseFn(res && res.body || err);
            if (promiseConfig.rejectFn && typeof promiseConfig.rejectFn == 'function') {
              promiseConfig.rejectFn(res && res.body || err);
            }
          }
        });
      });
    }
  }]);

  return ActionsBuilder;
})();

var ResourceConfig = (function () {
  function ResourceConfig(url) {
    var mappings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var extraActionsConfig = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, ResourceConfig);

    if (!url) throw Error("Cant create resource config without url");
    this.url = url;
    this.mappings = mappings;
    this.extraActionsConfig = extraActionsConfig;
    this.defaultActionsConfig = (0, _lodashCloneDeep2['default'])(DEFAULT_ACTIONS_CONFIG);
    this.actionsConfig = {};
    this.buildActionsConfig();
  }

  // -----------------------------------------------------------------------------
  // Helpers and parsers for url and arguments

  // Merge default config and user defined config

  _createClass(ResourceConfig, [{
    key: 'buildActionsConfig',
    value: function buildActionsConfig() {
      var _this = this;

      var mergedConfigKeys = HelpersAndParsers.uniqueArray(Object.keys(this.defaultActionsConfig).concat(Object.keys(this.extraActionsConfig)));
      (0, _lodashEach2['default'])(mergedConfigKeys, function (actionName) {
        var defaultActionConfig = _this.defaultActionsConfig[actionName],
            extraActionConfig = _this.extraActionsConfig[actionName];
        // Copy config from template (default actions config)
        if (defaultActionConfig) _this.actionsConfig[actionName] = defaultActionConfig;
        // Override config attributes by user defined config
        if (extraActionConfig) {
          (0, _lodashEach2['default'])(Object.keys(extraActionConfig), function (extraActionConfigKey) {
            if (!_this.actionsConfig[actionName]) _this.actionsConfig[actionName] = {};
            _this.actionsConfig[actionName][extraActionConfigKey] = extraActionConfig[extraActionConfigKey];
          });
        }
        // Check required attributes in actionConfig
        _this.checkActionConfig(actionName);
      });
    }
  }, {
    key: 'checkActionConfig',
    value: function checkActionConfig(actionName) {
      var actionConfig = this.actionsConfig[actionName];
      if ((0, _lodashIsEmpty2['default'])(actionConfig.url)) {
        this.actionsConfig[actionName].url = this.url;
      }
      if ((0, _lodashIsEmpty2['default'])(actionConfig.params)) {
        this.actionsConfig[actionName].params = HelpersAndParsers.extractQueryParams(this.actionsConfig[actionName].url);
      }
      if ((0, _lodashIsEmpty2['default'])(actionConfig.method)) {
        this.actionsConfig[actionName].method = 'GET';
      }
      if ((0, _lodashIsNull2['default'])(actionConfig.isArray) || (0, _lodashIsUndefined2['default'])(actionConfig.isArray)) {
        this.actionsConfig[actionName].isArray = false;
      }
    }
  }]);

  return ResourceConfig;
})();

var HelpersAndParsers = (function () {
  function HelpersAndParsers() {
    _classCallCheck(this, HelpersAndParsers);
  }

  // -----------------------------------------------------------------------------
  // Constants

  _createClass(HelpersAndParsers, null, [{
    key: 'parseArgs',

    // Parse action arguments
    value: function parseArgs(actionName, resourceConfig) {
      var ModelInstance = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var promiseConfig = (0, _lodashCloneDeep2['default'])(HelpersAndParsers.getDefaultPromiseConfig()),
          actionConfig = resourceConfig.actionsConfig && resourceConfig.actionsConfig[actionName],
          actionMethod = actionConfig && actionConfig.method.toUpperCase();

      // WITH BODY

      for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        args[_key2 - 3] = arguments[_key2];
      }

      if (ACTIONS_WITH_BODY.indexOf(actionMethod) > -1) {
        HelpersAndParsers.WithBodyData.apply(HelpersAndParsers, [actionName, resourceConfig, promiseConfig, ModelInstance].concat(args));

        if (!(0, _lodashIsEmpty2['default'])(promiseConfig.source) && (0, _lodashIsEmpty2['default'])(promiseConfig.bodyData)) {
          HelpersAndParsers.copyPureAttributes(promiseConfig.source, promiseConfig.bodyData);
        }
      } else

        // NO BODY
        if (ACTIONS_WITHOUT_BODY.indexOf(actionMethod) > -1) {
          HelpersAndParsers.NoBodyData.apply(HelpersAndParsers, [actionName, resourceConfig, promiseConfig, ModelInstance].concat(args));
        } else {
          throw Error("Dont know how to build HTTP request.", actionName, actionMethod);
        }

      promiseConfig.url = HelpersAndParsers.parseUrlWithMapping(actionConfig, resourceConfig, promiseConfig);
      return promiseConfig;
    }

    // Parser for methods WITH BodyContent
    // const ACTIONS_WITH_BODY
  }, {
    key: 'WithBodyData',
    value: function WithBodyData(actionName, resourceConfig, promiseConfig, ModelInstance) {
      var isClassMethod = (0, _lodashIsEmpty2['default'])(ModelInstance);
      // instance method - should insert INSTANCE in source
      if (!isClassMethod) {
        promiseConfig.source = ModelInstance;
      }

      for (var _len3 = arguments.length, args = Array(_len3 > 4 ? _len3 - 4 : 0), _key3 = 4; _key3 < _len3; _key3++) {
        args[_key3 - 4] = arguments[_key3];
      }

      switch (args.length) {
        case 5:
          if (!isClassMethod) throw Error("Instance method can't have 5 arguments");
          // class - someAction(source, queryParams, bodyData, resolveFn, rejectFn)
          if (typeof args[0] == 'object' && typeof args[1] == 'object' && typeof args[2] == 'object' && typeof args[3] == 'function' && typeof args[4] == 'function') {
            promiseConfig.source = args[0];
            promiseConfig.queryParams = args[1];
            promiseConfig.bodyData = args[2];
            promiseConfig.resolveFn = args[3];
            promiseConfig.rejectFn = args[4];
          } else {
            throw Error("Arguments types mismatch!");
          }
          break;
        case 4:
          if (typeof args[0] == 'object' && typeof args[1] == 'object' && typeof args[2] == 'function' && typeof args[3] == 'function') {
            // class - someAction(source, queryParams, resolveFn, rejectFn)
            if (isClassMethod) {
              promiseConfig.source = args[0];
              promiseConfig.queryParams = args[1];
            } else {
              // instance - someAction(queryParams, bodyData, resolveFn, rejectFn)
              promiseConfig.queryParams = args[0];
              promiseConfig.bodyData = args[1];
            }
            promiseConfig.resolveFn = args[2];
            promiseConfig.rejectFn = args[3];
          } else if (typeof args[0] == 'object' && typeof args[1] == 'object' && typeof args[2] == 'object' && typeof args[3] == 'function') {
            // class - someAction(source, queryParams, bodyData, resolveFn)
            if (isClassMethod) {
              promiseConfig.source = args[0];
              promiseConfig.queryParams = args[1];
              promiseConfig.bodyData = args[3];
              promiseConfig.resolveFn = args[4];
            } else {
              throw Error("Arguments types mismatch!");
            }
          } else {
            throw Error("Arguments types mismatch!");
          }
          break;
        case 3:
          if (isClassMethod) {
            promiseConfig.source = args[0];
            // class - someAction(source, resolveFn,   rejectFn)
            if (typeof args[1] == 'function' && typeof args[2] == 'function') {
              promiseConfig.resolveFn = args[1];
              promiseConfig.rejectFn = args[2];
            } else
              // class - someAction(source, queryParams, resolveFn)
              if (typeof args[1] == 'object' && typeof args[2] == 'function') {
                promiseConfig.queryParams = args[1];
                promiseConfig.rejectFn = args[2];
              } else
                // class - someAction(source, queryParams, bodyData)
                if (typeof args[1] == 'object' && typeof args[2] == 'object') {
                  promiseConfig.queryParams = args[1];
                  promiseConfig.bodyData = args[2];
                } else {
                  throw Error("Arguments types mismatch!");
                }
          } else {
            promiseConfig.queryParams = args[0];
            // instance - someAction(queryParams, bodyData, resolveFn)
            if (typeof args[1] == 'object' && typeof args[2] == 'function') {
              promiseConfig.bodyData = args[1];
              promiseConfig.resolveFn = args[2];
            } else
              // instance - someAction(queryParams, resolveFn, rejectFn)
              if (typeof args[1] == 'function' && typeof args[2] == 'function') {
                promiseConfig.resolveFn = args[1];
                promiseConfig.rejectFn = args[2];
              } else {
                throw Error("Arguments types mismatch!");
              }
          }
          break;
        case 2:
          // someAction(resolveFn, rejectFn)
          if (typeof args[0] == 'function' && typeof args[1] == 'function') {
            promiseConfig.resolveFn = args[0];
            promiseConfig.rejectFn = args[1];
          } else {
            if (isClassMethod) {
              // class    - someAction(source, resolveFn)
              if (typeof args[0] == 'object' && typeof args[1] == 'function') {
                promiseConfig.source = args[0];
                promiseConfig.resolveFn = args[1];
              } else
                // class    - someAction(source, queryParams)
                if (typeof args[0] == 'object' && typeof args[1] == 'object') {
                  promiseConfig.source = args[0];
                  promiseConfig.queryParams = args[1];
                } else {
                  throw Error("Arguments types mismatch!");
                }
            } else {
              // instance - someAction(queryParams, resolveFn)
              if (typeof args[0] == 'object' && typeof args[1] == 'function') {
                promiseConfig.queryParams = args[0];
                promiseConfig.resolveFn = args[1];
              } else
                // instance - someAction(queryParams, bodyData)
                if (typeof args[0] == 'object' && typeof args[1] == 'object') {
                  promiseConfig.queryParams = args[0];
                  promiseConfig.bodyData = args[1];
                } else {
                  throw Error("Arguments types mismatch!");
                }
            }
          }
          break;
        case 1:
          if (typeof args[0] == 'object') {
            // class    - someAction(source)
            if (isClassMethod) {
              promiseConfig.source = args[0];
            }
            // instance - someAction(queryParams)
            else {
                promiseConfig.queryParams = args[0];
              }
          } else {
            // someAction(resolveFn)
            if (typeof args[0] == 'function') {
              promiseConfig.resolveFn = args[0];
            } else {
              throw Error("Arguments types mismatch!");
            }
          }
          break;
      }
    }

    // Parser for methods WITHOUT BodyContent
    // const ACTIONS_WITHOUT_BODY
  }, {
    key: 'NoBodyData',
    value: function NoBodyData(actionName, resourceConfig, promiseConfig, ModelInstance) {
      var isClassMethod = (0, _lodashIsEmpty2['default'])(ModelInstance),
          actionConfig = resourceConfig.actionsConfig[actionName];

      // instance method - should insert INSTANCE in source
      if (!isClassMethod) {
        promiseConfig.source = ModelInstance;
      }

      for (var _len4 = arguments.length, args = Array(_len4 > 4 ? _len4 - 4 : 0), _key4 = 4; _key4 < _len4; _key4++) {
        args[_key4 - 4] = arguments[_key4];
      }

      switch (args.length) {
        case 4:
          if (!isClassMethod) throw Error("Instance method can't have 4 arguments");
          // class - someAction(source, queryParams, resolveFn, rejectFn)
          if (typeof args[0] == 'object' && typeof args[1] == 'object' && typeof args[2] == 'function' && typeof args[3] == 'function') {
            promiseConfig.source = args[0];
            promiseConfig.queryParams = args[1];
            promiseConfig.resolveFn = args[2];
            promiseConfig.rejectFn = args[3];
          } else {
            throw Error("Arguments types mismatch!");
          }
          break;
        case 3:
          if (isClassMethod) {
            // someAction(source, queryParams, resolveFn)
            if (typeof args[0] == 'object' && typeof args[1] == 'object' && typeof args[2] == 'function') {
              promiseConfig.source = args[0];
              promiseConfig.queryParams = args[1];
              promiseConfig.resolveFn = args[2];
            } else
              // someAction(source, resolveFn, rejectFn)
              if (typeof args[0] == 'object' && typeof args[1] == 'function' && typeof args[2] == 'function') {
                promiseConfig.source = args[0];
                promiseConfig.resolveFn = args[1];
                promiseConfig.rejectFn = args[2];
              } else {
                throw Error("Arguments types mismatch!");
              }
          } else {
            // someAction(queryParams, resolveFn, rejectFn)
            if (typeof args[0] == 'object' && typeof args[1] == 'function' && typeof args[2] == 'function') {
              promiseConfig.queryParams = args[0];
              promiseConfig.resolveFn = args[1];
              promiseConfig.rejectFn = args[2];
            } else {
              throw Error("Arguments types mismatch!");
            }
          }
          break;
        case 2:
          // someAction(resolveFn, rejectFn)
          if (typeof args[0] == 'function' && typeof args[1] == 'function') {
            promiseConfig.resolveFn = args[0];
            promiseConfig.rejectFn = args[1];
          } else {
            if (isClassMethod) {
              // class - someAction(source, queryParams)
              if (typeof args[0] == 'object' && typeof args[1] == 'object') {
                promiseConfig.source = args[0];
                promiseConfig.queryParams = args[1];
              } else
                // class - someAction(source, resolveFn)
                if (typeof args[0] == 'object' && typeof args[1] == 'function') {
                  promiseConfig.source = args[0];
                  promiseConfig.resolveFn = args[1];
                } else {
                  throw Error("Arguments types mismatch!");
                }
            } else {
              // instance - someAction(queryParams, resolveFn)
              if (typeof args[0] == 'object' && typeof args[1] == 'function') {
                promiseConfig.queryParams = args[0];
                promiseConfig.resolveFn = args[1];
              } else {
                throw Error("Arguments types mismatch!");
              }
            }
          }
          break;
        case 1:
          if (typeof args[0] == 'object') {
            // class    - someAction(source)      (if mapping present)
            // class    - someAction(queryParams) (without mapping)
            if (isClassMethod) {
              if (actionConfig.isArray == false) {
                promiseConfig.source = args[0];
              } else {
                promiseConfig.queryParams = args[0];
              }
            }
            // instance - someAction(queryParams)
            else {
                promiseConfig.queryParams = args[0];
              }
          } else
            // class    - someAction(resolveFn)
            // instance - someAction(resolveFn)
            if (typeof args[0] == 'function') {
              promiseConfig.resolveFn = args[0];
            } else {
              throw Error("Arguments types mismatch!");
            }
          break;
      }
    }

    // Parse action url and replace mappings with source values
  }, {
    key: 'parseUrlWithMapping',
    value: function parseUrlWithMapping(actionConfig, resourceConfig, promiseConfig) {
      var outputUrl = clone(actionConfig.url);
      // Loop mappings, collect values from source, replace in url if exists
      for (var object_key in resourceConfig.mappings) {
        var sourceValue = promiseConfig.source[object_key];
        // Replace mapping key by source value if exists source value
        if (sourceValue) {
          outputUrl = outputUrl.replace(new RegExp('{' + resourceConfig.mappings[object_key] + '}', 'g'), sourceValue);
        }
        // Delete mapping key from url
        else {
            outputUrl = outputUrl.replace(new RegExp('/?{' + resourceConfig.mappings[object_key] + '}', 'g'), "");
          }
      }
      // Clear URL from unmatched mappings
      outputUrl = outputUrl.replace(/\/?\{\:.+\}/i, "");
      return outputUrl;
    }

    // Default Promise config
  }, {
    key: 'getDefaultPromiseConfig',
    value: function getDefaultPromiseConfig() {
      return {
        url: undefined,
        source: {},
        queryParams: {},
        bodyData: {},
        resolveFn: function resolveFn() {},
        rejectFn: function rejectFn() {}
      };
    }

    // Copy attributes from SourceObject to TargetObject
    // Dont copy attributes prefixed with `$` (ex: $create)
  }, {
    key: 'copyPureAttributes',
    value: function copyPureAttributes(sourceObject) {
      var targetObject = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (typeof sourceObject == 'object') {
        (0, _lodashEach2['default'])(Object.keys(sourceObject), function (sourceAttribute) {
          if ((0, _lodashStartsWith2['default'])(sourceAttribute, '$') == false) {
            targetObject[sourceAttribute] = sourceObject[sourceAttribute];
          }
        });
      }
      return targetObject;
    }

    // Extract QueryParams from URL
  }, {
    key: 'extractQueryParams',
    value: function extractQueryParams() {
      var inputUrl = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      var regex = /[?&]([^=#]+)=([^&#]*)/g,
          params = {},
          match = undefined;
      while (match = regex.exec(inputUrl)) {
        params[match[1]] = match[2];
      }
      return params;
    }

    // Make array unique
  }, {
    key: 'uniqueArray',
    value: function uniqueArray() {
      var array = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      var a = array.concat();
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j]) a.splice(j--, 1);
        }
      }
      return a;
    }
  }]);

  return HelpersAndParsers;
})();

var DEFAULT_ACTIONS_CONFIG = {
  'query': { url: null, params: {}, method: 'GET', isArray: true },
  'get': { url: null, params: {}, method: 'GET', isArray: false },
  'create': { url: null, params: {}, method: 'POST', isArray: false },
  'update': { url: null, params: {}, method: 'PUT', isArray: false },
  'delete': { url: null, params: {}, method: 'DELETE', isArray: false }
};
var ACTIONS_WITH_BODY = ['POST', 'PUT', 'PATCH', 'DELETE'];
var ACTIONS_WITHOUT_BODY = ['GET'];
module.exports = exports['default'];

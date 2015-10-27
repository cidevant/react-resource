/* ==========================================================================
   [COMPONENT] React-Resource
   --------------------------------------------------------------------------
   Component for creating http restful requests by using Promises.
   Written to symbiose with RefluxJs async actions.
   ========================================================================== */

import Promise      from 'promise';
import request      from 'superagent';
import _            from 'lodash';

// ------------------------------------------------------------------------------
// Resource class creator

export default function ReactResource(url, mappings, actionsConfig) {
  var resourceConfig = new ResourceConfig(url, mappings, actionsConfig);

  function Resource(initObject) {
    HelpersAndParsers.copyPureAttributes(initObject, this);
    ActionsBuilder.createInstanceActions(resourceConfig, this);
  }
  ActionsBuilder.createClassActions(resourceConfig, Resource);

  return Resource;
}

// -----------------------------------------------------------------------------
// Builds Class and Instance actions on provided Resource

class ActionsBuilder {
  static createClassActions(resourceConfig, resourceClass){
    _.forEach(Object.keys(resourceConfig.actionsConfig), (actionName) => {
      resourceClass[actionName] = ActionsBuilder.buildActionFromConfig(actionName, resourceConfig, {});
    });
  }

  static createInstanceActions(resourceConfig, resourceInstance){
    _.forEach(Object.keys(resourceConfig.actionsConfig), (actionName) => {
      resourceInstance["$" + actionName] = ActionsBuilder.buildActionFromConfig(actionName,
                                                                                resourceConfig,
                                                                                resourceInstance);
    });
  }

  static buildActionFromConfig(actionName, resourceConfig, ModelInstance = {}) {
    return (...args) => {
      let promiseConfig = HelpersAndParsers.parseArgs(actionName,
                                                    resourceConfig,
                                                    ModelInstance,
                                                    HelpersAndParsers.getDefaultPromiseConfig(),
                                                    ...args);
      return ActionsBuilder.buildPromiseFromAction(actionName, resourceConfig, promiseConfig);
    }
  }

  static buildPromiseFromAction(actionName, resourceConfig, promiseConfig) {
    let actionConfig = resourceConfig.actionsConfig[actionName];
    return new Promise((resolvePromiseFn, rejectPromiseFn)=>{
      let newRequest = request,
          actionMethod = actionConfig.method.toUpperCase();
      // Create
      switch(actionMethod) {
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
      _.isEmpty(promiseConfig.queryParams) ?
        newRequest.query(actionConfig.params) :
        newRequest.query(promiseConfig.queryParams);
      // bodyData
      if(!_.isEmpty(promiseConfig.bodyData) &&
         ACTIONS_WITH_BODY.indexOf(actionMethod) > -1) {
        newRequest.send(promiseConfig.bodyData);
      }
      // Send
      newRequest.end(function(err, res){
        if(err === null) {
          resolvePromiseFn(res && res.body);
          if(promiseConfig.resolveFn && (typeof promiseConfig.resolveFn == 'function')){
            promiseConfig.resolveFn(res && res.body);
          }
        } else {
          rejectPromiseFn((res && res.body) || err);
          if(promiseConfig.rejectFn && (typeof promiseConfig.rejectFn == 'function')){
            promiseConfig.rejectFn((res && res.body) || err);
          }
        }
      });
    });
  }
}

// -----------------------------------------------------------------------------
// Resource config creator

class ResourceConfig {
  constructor(url, mappings = {}, extraActionsConfig = {}){
    if(!url) throw Error("Cant create resource config without url");
    this.url                    = url;
    this.mappings               = mappings;
    this.extraActionsConfig     = extraActionsConfig;
    this.defaultActionsConfig   = _.cloneDeep(DEFAULT_ACTIONS_CONFIG);
    this.actionsConfig          = {};
    this.buildActionsConfig();
  }

  buildActionsConfig(){
    // Merge default config and user defined config
    let mergedConfigKeys         = HelpersAndParsers.uniqueArray(Object.keys(this.defaultActionsConfig)
                                                                     .concat(Object.keys(this.extraActionsConfig)));
    _.forEach(mergedConfigKeys, (actionName) => {
      let defaultActionConfig    = this.defaultActionsConfig[actionName],
          extraActionConfig      = this.extraActionsConfig[actionName];
      // Copy config from template (default actions config)
      if(defaultActionConfig) this.actionsConfig[actionName] = defaultActionConfig;
      // Override config attributes by user defined config
      if(extraActionConfig) {
        _.forEach(Object.keys(extraActionConfig), (extraActionConfigKey) => {
          if(!this.actionsConfig[actionName]) this.actionsConfig[actionName] = {};
          this.actionsConfig[actionName][extraActionConfigKey] = extraActionConfig[extraActionConfigKey];
        });
      }
      // Process action HTTP params
      this.checkActionConfig(actionName);
    });
  }

  checkActionConfig(actionName) {
    let actionConfig = this.actionsConfig[actionName];
    if(_.isEmpty(actionConfig.url)) {
      this.actionsConfig[actionName].url = this.url;
    }
    if(_.isEmpty(actionConfig.params)) {
      this.actionsConfig[actionName].params = HelpersAndParsers.extractQueryParams(this.actionsConfig[actionName].url);
    }
    if(_.isEmpty(actionConfig.method)) {
      this.actionsConfig[actionName].method = 'GET';
    }
  }
}

// -----------------------------------------------------------------------------
// Helpers and parsers for url and arguments

class HelpersAndParsers {
  // Parse action arguments
  static parseArgs(actionName, resourceConfig, ModelInstance = {}, promiseConfig, ...args){
    let actionMethod = resourceConfig.actionsConfig &&
                       resourceConfig.actionsConfig[actionName] &&
                       resourceConfig.actionsConfig[actionName].method.toUpperCase();
    if(ACTIONS_WITH_BODY.indexOf(actionMethod) > -1) {
      HelpersAndParsers.WithBodyData(promiseConfig, ModelInstance, ...args);
      if(!_.isEmpty(promiseConfig.source) &&
          _.isEmpty(promiseConfig.bodyData)) {
        HelpersAndParsers.copyPureAttributes(promiseConfig.source, promiseConfig.bodyData);
      }
    } else
    if(ACTIONS_WITHOUT_BODY.indexOf(actionMethod) > -1) {
      HelpersAndParsers.NoBodyData(promiseConfig, ModelInstance, ...args);
    } else {
      throw Error("Dont know how to build HTTP request.", actionName, actionMethod);
    }
    promiseConfig.url = HelpersAndParsers.parseUrlWithMapping(resourceConfig.url,
                                                            resourceConfig.mappings,
                                                            promiseConfig.source);
    return promiseConfig;
  }

  // Parser for methods WITH BodyContent
  // const ACTIONS_WITH_BODY
  static WithBodyData(promiseConfig, ModelInstance, ...args) {
    let isClassMethod = _.isEmpty(ModelInstance);
    // instance method - should insert INSTANCE in source
    if(!isClassMethod) { promiseConfig.source = ModelInstance; }
    switch(args.length){
      case 5:
        if(!isClassMethod) throw Error("Instance method can't have 5 arguments");
        // class - someAction(source, queryParams, bodyData, resolveFn, rejectFn)
        if(typeof args[0] == 'object' &&
           typeof args[1] == 'object' &&
           typeof args[2] == 'object' &&
           typeof args[3] == 'function' &&
           typeof args[4] == 'function') {
          promiseConfig.source = args[0];
          promiseConfig.queryParams = args[1];
          promiseConfig.bodyData = args[2];
          promiseConfig.resolveFn = args[3];
          promiseConfig.rejectFn = args[4];
        } else { throw Error("Arguments types mismatch!"); }
      break;
      case 4:
        if(typeof args[0] == 'object' &&
           typeof args[1] == 'object' &&
           typeof args[2] == 'function' &&
           typeof args[3] == 'function') {
          // class - someAction(source, queryParams, resolveFn, rejectFn)
          if(isClassMethod) {
            promiseConfig.source = args[0];
            promiseConfig.queryParams = args[1];
          } else {
          // instance - someAction(queryParams, bodyData, resolveFn, rejectFn)
            promiseConfig.queryParams = args[0];
            promiseConfig.bodyData = args[1];
          }
          promiseConfig.resolveFn = args[2];
          promiseConfig.rejectFn = args[3];
        } else
        if(typeof args[0] == 'object' &&
           typeof args[1] == 'object' &&
           typeof args[2] == 'object' &&
           typeof args[3] == 'function') {
          // class - someAction(source, queryParams, bodyData, resolveFn)
          if(isClassMethod) {
            promiseConfig.source = args[0];
            promiseConfig.queryParams = args[1];
            promiseConfig.bodyData = args[3];
            promiseConfig.resolveFn = args[4];
          } else { throw Error("Arguments types mismatch!"); }
        } else { throw Error("Arguments types mismatch!"); }
      break;
      case 3:
        if(isClassMethod) {
          promiseConfig.source = args[0];
          // class - someAction(source, resolveFn,   rejectFn)
          if(typeof args[1] == 'function' &&
             typeof args[2] == 'function') {
            promiseConfig.resolveFn = args[1];
            promiseConfig.rejectFn = args[2];
          } else
          // class - someAction(source, queryParams, resolveFn)
          if(typeof args[1] == 'object' &&
             typeof args[2] == 'function') {
            promiseConfig.queryParams = args[1];
            promiseConfig.rejectFn = args[2];
          } else
          // class - someAction(source, queryParams, bodyData)
          if(typeof args[1] == 'object' &&
             typeof args[2] == 'object') {
            promiseConfig.queryParams = args[1];
            promiseConfig.bodyData = args[2];
          } else { throw Error("Arguments types mismatch!"); }
        } else {
          promiseConfig.queryParams = args[0];
          // instance - someAction(queryParams, bodyData, resolveFn)
          if(typeof args[1] == 'object' &&
             typeof args[2] == 'function') {
            promiseConfig.bodyData = args[1];
            promiseConfig.resolveFn = args[2];
          } else
          // instance - someAction(queryParams, resolveFn, rejectFn)
          if(typeof args[1] == 'function' &&
             typeof args[2] == 'function') {
            promiseConfig.resolveFn = args[1];
            promiseConfig.rejectFn = args[2];
          } else { throw Error("Arguments types mismatch!"); }
        }
      break;
      case 2:
        // someAction(resolveFn, rejectFn)
        if(typeof args[0] == 'function' && typeof args[1] == 'function') {
          promiseConfig.resolveFn = args[0];
          promiseConfig.rejectFn = args[1];
        } else {
          if(isClassMethod) {
            // class    - someAction(source, resolveFn)
            if(typeof args[0] == 'object' && typeof args[1] == 'function') {
              promiseConfig.source = args[0];
              promiseConfig.resolveFn = args[1];
            } else
            // class    - someAction(source, queryParams)
            if(typeof args[0] == 'object' && typeof args[1] == 'object') {
              promiseConfig.source = args[0];
              promiseConfig.queryParams = args[1];
            } else { throw Error("Arguments types mismatch!"); }
          } else {
            // instance - someAction(queryParams, resolveFn)
            if(typeof args[0] == 'object' && typeof args[1] == 'function') {
              promiseConfig.queryParams = args[0];
              promiseConfig.resolveFn = args[1];
            } else
            // instance - someAction(queryParams, bodyData)
            if(typeof args[0] == 'object' && typeof args[1] == 'object') {
              promiseConfig.queryParams = args[0];
              promiseConfig.bodyData = args[1];
            } else {
              throw Error("Arguments types mismatch!");
            }
          }
        }
      break;
      case 1:
        if(typeof args[0] == 'object') {
          // class    - someAction(source)
          if(isClassMethod) { promiseConfig.source = args[0]; }
          // instance - someAction(queryParams)
          else { promiseConfig.queryParams = args[0]; }
        } else {
          // someAction(resolveFn)
          if(typeof args[0] == 'function') {
            promiseConfig.resolveFn = args[0];
          } else { throw Error("Arguments types mismatch!"); }
        }
      break;
    }
  }

  // Parser for methods WITHOUT BodyContent
  // const ACTIONS_WITHOUT_BODY
  static NoBodyData(promiseConfig, ModelInstance, ...args) {
    let isClassMethod = _.isEmpty(ModelInstance);
    // instance method - should insert INSTANCE in source
    if(!isClassMethod) { promiseConfig.source = ModelInstance; }
    switch(args.length){
      case 4:
        if(!isClassMethod) throw Error("Instance method can't have 4 arguments")
        // class - someAction(source, queryParams, resolveFn, rejectFn)
        if(typeof args[0] == 'object' &&
           typeof args[1] == 'object' &&
           typeof args[2] == 'function' &&
           typeof args[3] == 'function') {
          promiseConfig.source = args[0];
          promiseConfig.queryParams = args[1];
          promiseConfig.resolveFn = args[2];
          promiseConfig.rejectFn = args[3];
        } else { throw Error("Arguments types mismatch!"); }
      break;
      case 3:
        if(isClassMethod) {
          // someAction(source, queryParams, resolveFn)
          if(typeof args[0] == 'object' &&
             typeof args[1] == 'object' &&
             typeof args[2] == 'function') {
            promiseConfig.source = args[0];
            promiseConfig.queryParams = args[1];
            promiseConfig.resolveFn = args[2];
          } else
          // someAction(source, resolveFn, rejectFn)
          if (typeof args[0] == 'object' &&
              typeof args[1] == 'function' &&
              typeof args[2] == 'function') {
            promiseConfig.source = args[0];
            promiseConfig.resolveFn = args[1];
            promiseConfig.rejectFn = args[2];
          } else { throw Error("Arguments types mismatch!"); }
        } else {
          // someAction(queryParams, resolveFn, rejectFn)
          if(typeof args[0] == 'object' &&
             typeof args[1] == 'function' &&
             typeof args[2] == 'function') {
            promiseConfig.queryParams = args[0];
            promiseConfig.resolveFn = args[1];
            promiseConfig.rejectFn = args[2];
          } else { throw Error("Arguments types mismatch!"); }
        }
      break;
      case 2:
        // someAction(resolveFn, rejectFn)
        if(typeof args[0] == 'function' && typeof args[1] == 'function') {
          promiseConfig.resolveFn = args[0];
          promiseConfig.rejectFn = args[1];
        } else {
          if(isClassMethod) {
            // class - someAction(source, queryParams)
            if(typeof args[0] == 'object' && typeof args[1] == 'object') {
              promiseConfig.source = args[0];
              promiseConfig.queryParams = args[1];
            } else
            // class - someAction(source, resolveFn)
            if(typeof args[0] == 'object' && typeof args[1] == 'function') {
              promiseConfig.source = args[0];
              promiseConfig.resolveFn = args[1];
            } else { throw Error("Arguments types mismatch!"); }
          } else {
            // instance - someAction(queryParams, resolveFn)
            if(typeof args[0] == 'object' && typeof args[1] == 'function') {
              promiseConfig.queryParams = args[0];
              promiseConfig.resolveFn = args[1];
            } else { throw Error("Arguments types mismatch!"); }
          }
        }
      break;
      case 1:
        if(typeof args[0] == 'object') {
          // class    - someAction(source)
          if(isClassMethod){ promiseConfig.source = args[0]; }
          // instance - someAction(queryParams)
          else { promiseConfig.queryParams = args[0]; }
        } else
        // class    - someAction(resolveFn)
        // instance - someAction(resolveFn)
        if(typeof args[0] == 'function') {
          promiseConfig.resolveFn = args[0];
        } else { throw Error("Arguments types mismatch!"); }
      break;
    }
  }

  // Parse action url and replace mappings with source values
  static parseUrlWithMapping(url, mappings, source) {
    let outputUrl = _.clone(url);
    // Loop mappings, collect values from source, replace in url if exists
    for(var object_key in mappings) {
      let sourceValue = source[object_key];
      // Replace mapping key by source value if exists source value
      if(sourceValue) {
        outputUrl = outputUrl.replace(new RegExp(`\{${mappings[object_key]}\}`, 'g'), sourceValue);
      }
      // Delete mapping key from url
      else { outputUrl = outputUrl.replace(new RegExp(`\/?\{${mappings[object_key]}\}`, 'g'), ""); }
    }
    // Clear URL from unmatched mappings
    return outputUrl.replace(/\/?\{\:.+\}/i, "");
  }

  // Default Promise config
  static getDefaultPromiseConfig() {
    return {
      url: undefined,
      source: {},
      queryParams: {},
      bodyData: {},
      resolveFn: ()=>{},
      rejectFn: ()=>{}
    };
  }

  // Copy attributes from SourceObject to TargetObject
  // Dont copy attributes prefixed with `$` (ex: $create)
  static copyPureAttributes(sourceObject, targetObject = {}) {
    if(typeof sourceObject == 'object') {
      _.forEach(Object.keys(sourceObject), sourceAttribute => {
        if(_.startsWith(sourceAttribute, '$') == false) {
          targetObject[sourceAttribute] = sourceObject[sourceAttribute];
        }
      });
    }
    return targetObject;
  }

  // Extract QueryParams from URL
  static extractQueryParams(inputUrl){
    let regex   = /[?&]([^=#]+)=([^&#]*)/g,
        params  = {},
        match;
    while(match = regex.exec(inputUrl)) {
        params[match[1]] = match[2];
    }
    return params;
  }

  // Make array unique
  static uniqueArray(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
       for(var j=i+1; j<a.length; ++j) {
           if(a[i] === a[j])
               a.splice(j--, 1);
       }
    }
    return a;
  }
}

// -----------------------------------------------------------------------------
// Constants

const DEFAULT_ACTIONS_CONFIG = {
  'query':   {url: null, params: {}, method:'GET'    },
  'get':     {url: null, params: {}, method:'GET'    },
  'create':  {url: null, params: {}, method:'POST'   },
  'update':  {url: null, params: {}, method:'PUT'    },
  'delete':  {url: null, params: {}, method:'DELETE' }
};
const ACTIONS_WITH_BODY    = ['POST', 'PUT', 'PATCH', 'DELETE'];
const ACTIONS_WITHOUT_BODY = ['GET'];

# React Resource
A factory which creates a resource object that lets you interact with RESTful server-side data sources.

The returned resource object has action methods which provide high-level behaviors without the need to interact with the low level http service (superagent).

## Usage

### Creating "ResourceClass"

`var ResourceClass = new ReactResource(url, [mappings, [customActions]])`

Input:
* __url__: string - Api endpoint url
```js
'/api/users/{:urlVariable}'
```
* __mappings__: object - Replace variables in url by object values
```js
{ instanceObjectAttribute: ":urlVariable"}
```
* __customActions__: object - Custom actions config
```js
{
  actionName: {
    url: "string",
    method: "string",
    params: {
      defaultParam: "defaultValue"
    }
  }
}
```

Output:

* __ResourceClass__: function - instance constructor function with default actions (ClassMethods)

### Class Methods vs. Instance Methods

There are 5 default actions:
```
{ 'query':    {method:'GET'},
  'get':      {method:'GET'},
  'create':   {method:'POST'},
  'update':   {method:'PUT'},
  'delete':   {method:'DELETE'} };
```

##### ClassMethods

`var promise = User.get([initObject, [queryParams, [bodyParams, [resolveFn, [rejectFn]]]]])`

##### InstanceMethods

Are prefixed with `$` dollar sign. You dont have to pass `initObject`, because you have already
instatiated "ResourceClass".

`var promise = new User(initObject).$get([queryParams, [bodyParams, [resolveFn, [rejectFn]]]])`

##### Promise resolve and reject function

If we send functions os first argument, we ommit resource settings and directly passing arguments functions to `new Promise(arguments)`.

```js
var promise = User.query(responseFn)

/* or */

var promise = User.query(responseFn, rejectFn)
```

## Examples

#### Basic (ClassMethods vs InstanceMethods)

```js
import ReactResource    from 'react-resource';

var User = new ReactResource('/api/users/{:id}', {id: ':id'}),
    userReal,
    successResponseCallback = function(response){
      userReal = response;
      console.log("User promise resolved with data", response);
    };

// 1) Resource class method call
var promise = User.get({id: 10}, successResponseCallback);

promise.then(function(response){
  console.log("Say hello to user", response);
});

/* or */

// 2) Resource instance method (prefixed with `$`) call
var userInstance = new User({id: 10});
var promise = userInstance.$get();

promise.then(successResponseCallback)
```

#### RefluxJs integration

```js
import React            from 'react';
import Reflux           from 'reflux';
import ReactResource    from 'react-resource';

var User = new ReactResource('/api/users/{:id}', {id: ':id'});

var HomeActions = Reflux.createActions({
  'loadUsers':                 {asyncResult: true}
});

HomeActions.loadUsers.listenAndPromise( User.query );

var HomeComponent = React.createClass({
  mixins: [
    Reflux.listenTo(HomeActions.loadUsers.completed, 'onLoadUsersCompleted')
  ],

  getInitialState(){
    return { users: [] };
  },

  componentDidMount() {
    HomeActions.loadUsers();
  },

  onLoadUsersCompleted(response){
    this.setState({users: response})
  },

  render(){
    return (
      <div>Users count: {this.state.users && this.state.users.length}</div>
    )
  }
});

```

#### Override default and custom actions
```js
import ReactResource    from 'react-resource';

var User = new ReactResource('/api/users/{:id}', {id: ':id'}, {
  // 1) Override default settings of default actions
  query: {
    params: {
      offset: 0,
      limit: 10
    }
  },
  // 2) Create new action
  myCustomAction: {
    url: "/api/custom_action",
    method: "PUT",
    params: {
      defaultParam1: "Hello",
      defaultParam2: "World"
    }
  }
});

// 1) url: /api/users?offset=0&limit=10
var promise = User.query();

/* or */

// 2) url: /api/custom_action?defaultParam1=Hello&defaultParam2=World

// 2.1) Class method call
var promise = User.myCustomAction({});

// 2.1) Instance method call
var userInstance = new User({});
var promise = userInstance.$myCustomAction();
```
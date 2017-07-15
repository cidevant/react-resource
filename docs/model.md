# Model class

First of all, we have to create our `Model` class from `ReactResource` factory:

`const ModelName = new ReactResource(url, [mappings, [actions]])`

* __url__ - {string} - Api endpoint url
  `'/api/users/{:urlVariable}/?format=json'`

* __mappings__ - {Object} - Replace variables in __url__ by values of model instance
  `{ instanceAttribute: ':urlVariable'}`

* __actions__ - {Object} - Add new actions or override default ones
  `{ actionName: actionConfig }`


## Custom instance methods

Also we can extend `Model` with custom instance/prototype methods

> Don't use __ARROW FUNCTION__! 
> Use __FUNCTION DEFINITION__ instead!

```jsx
import ReactResource from 'react-resource';

/**
 * Model class definition
 */

const User = new ReactResource('/api/users/{:id}.json', { id: ':id' })

/**
 * Custom instance method
 */

// [OK] 
User.prototype.getName = function() {
  return [this.first_name, this.last_name].join(" ");
};

// [WRONG] Will not work!
User.prototype.getName = () => [this.first_name, this.last_name].join(" ");

/**
 * Get user
 */

User.get({ id: 1 }, (user) => {
  console.log('User name is', user.getName());
});
```

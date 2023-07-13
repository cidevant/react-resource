# React Resource

A factory which creates a resource object (`Model` class) that lets you interact with RESTful server-side data sources.

The returned resource object (`Model` class) has action methods which provide high-level behaviors without the need to interact with the low level http service (`whatwg-fetch`).

## Install 

```
npm install react-resource --save
```

## Documentation

1. [Model class](docs/model.md)
1. [Actions](docs/actions.md)
1. [Interceptors](docs/interceptors.md)
1. [Transformers](docs/transformers.md)
1. [File upload](docs/file-upload.md)

## Example

```js
import ReactResource from 'react-resource';

// Model class definition
const User = new ReactResource('/api/users/{:id}.json', { id: ':id' })

// Custom instance method
User.prototype.getName = function() {
  return [this.first_name, this.last_name].join(" ");
};

// Action `create` as class method
User.create({first_name: 'John', last_name: 'Doe'}, (user) => {
  console.log('[CLASS]', user.getName());
});

// Action `create` as instance method
const user = new User({first_name: 'Johnny', last_name: 'Bravo'});
const promise = user.$create((user) => {
  console.log('[INSTANCE]', user.getName());
});
```

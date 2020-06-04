# objutil

Javascript Object util methods with deep traverse, with ES6 tree shaking methods: get/set/unset/remove object path, visit, assign(extend), merge, remove, defaults, pick, filter, isEqual. Customize the APIs into one file.

[![Build Status](https://travis-ci.org/futurist/objutil.svg?branch=master)](https://travis-ci.org/futurist/objutil)
<a href='https://coveralls.io/github/futurist/objutil?branch=master'><img src='https://coveralls.io/repos/github/futurist/objutil/badge.svg?branch=master' alt='Coverage Status' /></a>
[![npm](https://img.shields.io/npm/v/objutil.svg "Version")](https://www.npmjs.com/package/objutil)


## Why?

Compared with `Array`, javascript missing the `Object` utils, think `Array.prototype.filter, Array.prototype.map` conterpart of `Object`

Unlike **lodash**, `objutil` **only** provide methods for `Object`, like `Object.pick`, `Object.defaults`, `Object.get` etc, small and customizable

#### Features

1. Small, **dynamically generate API** using [tree shaking](http://javascriptplayground.com/blog/2016/02/better-bundles-rollup/) to select only the methods you want, remove unused code for size optimization

 >  [lodash](https://github.com/lodash/lodash/), `_.assign` and `_.defaults`: **31KB** <kbd>VS</kbd> `objutil version`: **0.7KB!**

2. **Deep by default**: all methods is deeply operation, like below:

  ```javascript
  pick(
      { a:2, b:{c:3, e:5}, d:4 },  //src object
      { b:{c:1}, d:1 }   // selection
  )
  // => { b:{c:3}, d:4 }
  ```

## How?

If you don't need **dynamically generate API**, all methods is **out of box**, nothing needed.

If you need generate API for yourself, do below:

1. Install [rollup](https://github.com/rollup/rollup): `npm install -g rollup`

2. Select the API by below command line:

  ``` javascript
  rollup -c --api assign,defaults
  ```

  ``` javascript
  rollup -c --api 'isPrimitive as isP, isIterable as isT'
  // then use objutil.isP as `isPrimitive`, etc.
  ```

  Or add below line in **your npm scripts** of `package.json`:

  ``` javascript
  scripts: {
    ...
    "objutil": "rollup -c ./node_modules/objutil/rollup.config.js --api assign,pick"
  }
  ```

  This will tree shake the lib, leave only `objutil.assign, objutil.defaults` methods

## Install

- NPM

``` shell
npm install objutil
```

- Browser

``` shell
<script src="https://unpkg.com/objutil"></script>
```

## Quick Start:

Think below initial vars:

``` javascript
var a = {
  x:1,
  y:{
    w:1,
    z:2
  }
}

var b= {
  y:{
    z:10,
    u:'name'
  }
}
```

Use with objutil:

```javascript
var {merge, remove} = require('objutil')
merge(a,b)
remove(a,b)
```

## API

### visit( obj, fn )

> **Visit each obj node (key:value pair), with fn({val, key, path, col})**

**val & key** is current value and key pair

**path** is the current object path for the key,

**col** is the current collection object

`[]` indicate the root path,
`['a', 'b']` is the path of node `x:1` in `{ a: { b: {x:1} } }`

`visit( {a:2, b:{c:3}}, (v) => console.log(v.key, v.val, v.path) )`

```javascript
// prints
a 2 []
b {c:3} []
c 3 ['b']
```


### get( obj, pathArray, isThrow )

> **Get object value from pathArray. When not found, throw error if isThrow is true, else return [undefined, 1]**

The result, if NOT isThrow, is the form: `[data, errorCode]`, errorCode===1, indicate: `not found`.

If path exists, return `[data]`, indicate no error.

If isThrow, return `data` when found, return `Error('NotFound')` when not found.

`get( a, ['y', 'z'] )`

```javascript
//result is
[2]

//throw error when not found
get(a, ['x', 'y'], true)

//return with error code
get(a, ['x', 'y'])
[undefined, 1]

```


### got( obj, propArray, defaultValue )

> **Search each path in propArray, return first value found, or defaultValue if none found.**

Where you can use `get`, you can use `got`, which also give you `fallback` into different path and defaultValue.

`got( {prop: {value: 1}}, ['prop1', 'prop2'], 3 )`

``` javascript
//result is
3
```

`got( {prop: {value: 1}}, 'prop.value' )`

``` javascript
//result is
1
```

### set( obj, pathArray, value, descriptor )

> **Set object value from pathArray. When there's non-object in the path, throw error, return the final object**

Set `pathArray` in `obj` to `value`, when the path not exist or all the intermediate is object.

When **descriptor** is object, will modify the prop according `Object.defineProperty`

When found non-object value in intermediate, throw `Error('cannot set non-object path')`

`set( {}, ['y', 'z'], 23 )`

``` javascript
//result is
{ y: { z: 23 } }

// but below will return Error object
set( { y:1 }, ['y', 'z'], 23 )
//result is
Error('cannot set non-object path')
```

`set( {}, 'a', 2, {e:0, w:0, c:1} )`

``` javascript
{a:2}  // a is configurable, but not enumerable and writable
```

*OR:*

`set( {}, 'a', 2, {configurable:false, enumerable:false, writable:false} )`

*OR SAME AS ABOVE:*

`set( {}, 'a', 2, {} )`

``` javascript
{a:2}  // a is not configurable, enumerable and writable
```

### ensure( obj, pathArray, defaultValue )

> **Like `set`, but only `set` when pathArray not exists**

Set `pathArray` in `obj` to `defaultValue`, only when path not exists.

Return `undefined` if path exists, and do nothing, else return `obj`

`obj = ensure( {}, ['y', 'z'], 1 )`

``` javascript
//result is
obj = { y: { z: 1 } }

ret = ensure( obj, ['y', 'z'], 2 )
// ret===undefined
// obj==={ y: { z: 1 } }
// obj unchanged

```

### unset( obj, pathArray )

> **Unset object value from pathArray. When there's non-object in the path, return undefined, or true/false as result**

`unset( {prop: {value: 1}}, 'prop.value' )`

``` javascript
//result is
true
```

### assign( obj, ...args )

> **Shallow assign args properties into obj, from left to right order.**

Roughly equal to `lodash.assign` and `Object.assign`

`assign( a, b, {w:3} )`

```javascript
//result=>
{
  x:1,
  y:{
    z:10,
    u:'name'
  },
  w:3
}
```

### merge( obj, ...args )

> **Deeply merge args properties into obj, from left to right order.**

Roughly equal to `lodash.merge`

`merge( a, b, {y:{v:3}} )`

```javascript
//result=>
{
  x:1,
  y:{
    v:3,
    w:1,
    z:10,
    u:'name'
  }
}
```

### defaults( obj, ...args )

> **deeply merge args key/val into obj, left to right, only when it's not existing in obj**

Roughly equal to `lodash.defaultsDeep` (**deeply lodash.defaults**)

`defaults( {}, {a:1}, {a:2, b:5 } )`

```javascript
//result=>
{
  a:1,
  b:5
}
```

### remove( obj, removeObj, [force] )

> **Deeply delete removeObj(if force or key has a truthy value) from obj, optionally set to newValue if present**

`remove( a, { y:{z:true} } )`

```javascript
//result=>
{
  x:1,
  y:{
    w:1
  }
}
```

### pick( obj, pickObject, force)

> **Like remove, but return the reversed new object(not mutate obj). Deeply keep from pickObject (if force or key has a truthy value) from obj**

If obj is `primitive types`, then always return `{}`

`pick( a, {x:true, y:{z:true} } )`

```javascript
//result=>
{
  x:1,
  y:{
    z:2
  }
}
```

### filter( obj, predicate)

> **return array of key path(dot notation) that passed predicate**

predicate: `fn({val, key, path, col}) -> true/false`

```javascript
expect(lib.filter({a:1, b:{c:2, d:3}, e:4}, function(v) {
  return v.path=='' && v.val % 2
})).deep.eql(['a'])
```

### isEqual( objA, objB )

> **deeply compare objA and objB for equality**

`isEqual( {a:1, b:2}, {a:1, b:2 } )`

```javascript
//result=> true
```

### forEach( obj, callback )

> **callback: fn(value, key, obj) -> false?, return false will exit iteration**

`forEach( {a:1, b:2}, function(val, key){ console.log(val, key) } )`

```javascript
// 1, 'a'
// 2, 'b'
```

### map( obj, callback )

> **callback: fn(value, key, obj) -> val, return array of val**

Like `Array.prototype.map` does for Object

`map( {a:1, b:2}, (val, key)=>key+val )`

```javascript
['a1', 'b2']
```

### some( obj, callback )

> **callback: fn(value, key, obj) -> true/false, return true/false**

Like `Array.prototype.some` does for Object

`some( {a:1, b:2}, (val, key)=>val>1 )`

```javascript
true
```


### every( obj, callback )

> **callback: fn(value, key, obj) -> true/false, return true/false**

Like `Array.prototype.every` does for Object

`every( {a:1, b:2}, (val, key)=>val>1 )`

```javascript
false
```


### deepIt( a, b, callback )

> **Iterate b with deeply sync props of a, and callback(objA, objB, key)**

```javascript
deepIt( a, b, function(objA,objB,key){
    objA[key] = objB[key]
} )
// ---> same result of assign(a,b)
```

### MIT
.

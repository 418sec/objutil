define(['exports'], function (exports) { 'use strict';

/*jslint node: true */
var ERR_NULL_TARGET = 'null target';

// better type check
var is = function (val, type) { return {}.toString.call(val) === '[object ' + type + ']' };
var own = function (obj, key) { return {}.hasOwnProperty.call(obj, key) };

function isIterable (v) {
  return is(v, 'Object') || is(v, 'Array') || is(v, 'Map')
}

function isPrimitive (val) {
  return !/obj|func/.test(typeof val) || !val
}

function deepIt (a, b, callback, path) {
  path = path || [];
  if (isPrimitive(b)) return a
  for (var key in b) {
    if (!own(b, key)) continue
    // return false stop the iteration
    if (callback(a, b, key, path) === false) break
    if (isIterable(b[key]) && isIterable(a[key])) {
      deepIt(a[key], b[key], callback, path.concat(key));
    }
  }
  return a
}

function getPath(path) {
  if (typeof path === 'string') path = path.split('.');
  return path
}

/**
 * Get data from obj, using path
 * @param {} obj
 * @param {} path
 * @param {} errNotFound
 * @returns {}
 */
function get (obj, path, errNotFound) {
  var n = obj;
  path = getPath(path);
  for (var i = 0, len = path.length; i < len; i++) {
    if (!isIterable(n) || !(path[i] in n)) { return errNotFound ? new Error('NotFound') : [undefined, 1] } // [data, errorCode>0]
    n = n[path[i]];
  }
  return errNotFound ? n : [n]
}

// ensure path exists
function ensure (obj, path, defaultValue) {
  path = getPath(path);
  var arr = get(obj, path);
  if(arr[1]) return set(obj, path, defaultValue)
}

function unset (obj, path) {
  path = getPath(path);
  var len = path.length;
  if (!isIterable(obj) || !len) return
  var arr = get(obj, path.slice(0,-1));
  if(arr[1] || !isIterable(arr[0])) return false
  return delete arr[0][path[len-1]]
}

function set (obj, path, value) {
  path = getPath(path);
  if (!isIterable(obj) || !path.length) return obj
  var n = obj;
  for (var i = 0, len = path.length - 1; i < len; i++) {
    if (!isIterable(n[path[i]])) {
      if (path[i] in n) return new Error('cannot set non-object path')
      else n[path[i]] = {};
    }
    n = n[path[i]];
  }
  n[path[i]] = value;
  return obj
}

function visit (obj, fn) {
  return deepIt(obj, obj, function (a, b, key, path) {
    // value, key, collection, path
    return fn(a[key], key, path, a)
  })
}

function invert (obj) {
  var newObj = {};
  deepIt(newObj, obj, function (a, b, key) {
    if (isPrimitive(b[key])) a[b[key]] = key;
  });
  return newObj
}

function _assignHelper (target, arg, cb) {
  if (target == null) { // TypeError if undefined or null
    throw new TypeError(ERR_NULL_TARGET)
  }
  for (var i = 1, len = arg.length; i < len; i++) {
    deepIt(target, arg[i], cb);
  }
  return target
}

function assign (target, arg) { // length==2
  return _assignHelper(target, arguments, function (a, b, key, path) {
    a[key] = b[key];
  })
}

function merge(target, arg) { // length==2
  return _assignHelper(target, arguments, function (a, b, key, path) {
    var bval = b[key];
    if (bval !== undefined && isPrimitive(bval)) a[key] = bval;
    else if (!(key in a)) a[key] = bval ? bval.constructor() : bval;
  })
}

function defaults (target, arg) { // length==2
  target = target || {};
  return _assignHelper(target, arguments, function (a, b, key, path) {
    if (!(key in a)) a[key] = b[key];
  })
}

function filter (obj, predicate) {
  var ret = [];
  deepIt(obj, obj, function(a, b, key, path) {
    if(predicate(a[key], key, path, a)) ret.push(path.concat(key).join('.'));
  });
  return ret
}

/** Usage: _exlucde(obj, {x:{y:2, z:3} } ) will delete x.y,x.z on obj
 *  when isSet, will set value to a instead of delete
 */
// _exclude( {a:1,b:{d:{ c:2} } }, { b:{d:{ c:1} } } )
function remove (x, y, force) {
  return deepIt(x, y, function (a, b, key) {
    if (isPrimitive(b[key]) && (force || b[key])) delete a[key];
  })
}

function pick (obj, props, force) {
  var o = {};
  return deepIt(o, props, function (a, b, key, path) {
    var d, c = get(obj, path.concat(key));
    // c[1] > 0: not found from obj
    if (!(force || b[key]) || c[1]) return
    d = c[0];  // c[0] is the data
    if (!isPrimitive(d)) a[key] = d.constructor();
    if (isPrimitive(b[key])) a[key] = d;
  })
}

function isEqual (x, y, isStrict) {
  var equal = true;
  // if b===null, then don't iterate, so here compare first
  if (isPrimitive(x) || isPrimitive(y)) return isStrict ? x === y : x == y
  deepIt(x, y, function (a, b, key) {
    if ((isPrimitive(a[key]) || isPrimitive(b[key])) && (isStrict ? b[key] !== a[key] : b[key] != a[key])) {
      return (equal = false)
    }
  });
  return equal
}

exports.is = is;
exports.own = own;
exports.isIterable = isIterable;
exports.isPrimitive = isPrimitive;
exports.deepIt = deepIt;
exports.get = get;
exports.set = set;
exports.unset = unset;
exports.ensure = ensure;
exports.invert = invert;
exports.assign = assign;
exports.extend = assign;
exports.merge = merge;
exports.remove = remove;
exports.pick = pick;
exports.defaults = defaults;
exports.isEqual = isEqual;
exports.visit = visit;
exports.filter = filter;

});

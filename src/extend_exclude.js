
var type = {}.toString
var own = {}.hasOwnProperty
var OBJECT = type.call({})

function _deepIt (a, b, callback) {
  if (a == null || b == null) {
    return a
  }
  for ( var key in b) {
    if (!own.call(b, key)) continue
    if (type.call(b[key]) == OBJECT) {
      if (type.call(a[key]) != OBJECT) {
        callback(a, b, key)
      } else {
        a[key] = _deepIt(a[key], b[key], callback)
      }
    } else {
      callback(a, b, key)
    }
  }
  return a
}

function _extend (x, y) {
  return _deepIt(x, y, function (a, b, key) {
    a[key] = b[key]
  })
}

/*Usage: _exlucde(obj, {x:{y:1, z:1} }, [null] ) will delete x.y,x.z on obj, or set to newVal if present */
// _exclude( {a:1,b:{d:{ c:2} } }, { b:{d:{ c:1} } } )
function _exclude (x, y, newVal) {
  var args = arguments
  return _deepIt(x, y, function (a, b, key) {
    if (typeof b[key] !== 'object' && b[key]) {
      args.length == 3 ? a[key] = newVal : delete a[key]
    } else {
      a[key] = b[key]
    }
  })
}

export default {
  _deepIt: _deepIt,
  _extend: _extend,
  _exclude: _exclude
}

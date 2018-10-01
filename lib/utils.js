/**
 * helper function to build all properties like lodash's _.set function
 * 
 * set(object, ['x', 'y', 'z'], 'default')
 * console.log(object.x.y.z);
 *  => default
 * 
 * @param {object} obj object to build properties for
 * @param {array} keys list of keys to nest
 * @param {any} value value to set
 */
export function set(obj, keys, value) {
  obj[keys[0]] = obj[keys[0]] || {};
  const tmp = obj[keys[0]];

  if (keys.length > 1) {
    keys.shift();
    set(tmp, keys, value);
  }
  else {
    obj[keys[0]] = value;
  }

  return obj;
}

/**
 * helper function to get value from a nest object like lodash's ._get function
 * 
 * get({ x: { y: 0 } }, ['x', 'y', 'z'], undefined)
 * => undefined
 * 
 * @param {object} obj object to get properties from
 * @param {array} keys list of keys to use
 * @param {any} (optional) def default value if nothing was found
 */
export function get(obj, keys, def = undefined) {
  const tmp = obj[keys[0]];

  if (keys.length > 1 && tmp) {
    keys.shift();
    return get(tmp, keys) || def;
  }

  return tmp || def;
}
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['vuex-dot'] = {})));
}(this, (function (exports) { 'use strict';

  /*!
   * isobject <https://github.com/jonschlinkert/isobject>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */

  var isobject = function isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
  };

  /*!
   * get-value <https://github.com/jonschlinkert/get-value>
   *
   * Copyright (c) 2014-2018, Jon Schlinkert.
   * Released under the MIT License.
   */



  var getValue = function(target, path, options) {
    if (!isobject(options)) {
      options = { default: options };
    }

    if (!isValidObject(target)) {
      return typeof options.default !== 'undefined' ? options.default : target;
    }

    if (typeof path === 'number') {
      path = String(path);
    }

    const isArray = Array.isArray(path);
    const isString = typeof path === 'string';
    const splitChar = options.separator || '.';
    const joinChar = options.joinChar || (typeof splitChar === 'string' ? splitChar : '.');

    if (!isString && !isArray) {
      return target;
    }

    if (isString && path in target) {
      return isValid(path, target, options) ? target[path] : options.default;
    }

    let segs = isArray ? path : split(path, splitChar, options);
    let len = segs.length;
    let idx = 0;

    do {
      let prop = segs[idx];
      if (typeof prop === 'number') {
        prop = String(prop);
      }

      while (prop && prop.slice(-1) === '\\') {
        prop = join([prop.slice(0, -1), segs[++idx] || ''], joinChar, options);
      }

      if (prop in target) {
        if (!isValid(prop, target, options)) {
          return options.default;
        }

        target = target[prop];
      } else {
        let hasProp = false;
        let n = idx + 1;

        while (n < len) {
          prop = join([prop, segs[n++]], joinChar, options);

          if ((hasProp = prop in target)) {
            if (!isValid(prop, target, options)) {
              return options.default;
            }

            target = target[prop];
            idx = n - 1;
            break;
          }
        }

        if (!hasProp) {
          return options.default;
        }
      }
    } while (++idx < len && isValidObject(target));

    if (idx === len) {
      return target;
    }

    return options.default;
  };

  function join(segs, joinChar, options) {
    if (typeof options.join === 'function') {
      return options.join(segs);
    }
    return segs[0] + joinChar + segs[1];
  }

  function split(path, splitChar, options) {
    if (typeof options.split === 'function') {
      return options.split(path);
    }
    return path.split(splitChar);
  }

  function isValid(key, target, options) {
    if (typeof options.isValid === 'function') {
      return options.isValid(key, target);
    }
    return true;
  }

  function isValidObject(val) {
    return isobject(val) || Array.isArray(val) || typeof val === 'function';
  }

  /**
   * Maps subject (Target or TargetExposition) or some field of it into `vm` compatible getter/setter pair
   * @param {Target,TargetExposition} subject
   * @param {String} field
   * @param {Boolean} sendTarget send
   * @return {{get: (function(): *), set: (function(): *)}}
   */
  function map(subject, field, sendTarget) {
    const fieldGetter = function () {
      return getValue(this, subject.path + '.' + field);
    };
    const targetGetter = function () {
      return getValue(this, subject.path);
    };
    const result = {
      get: field ? fieldGetter : targetGetter
    };
    const method = !!subject.action ? 'dispatch' : !!subject.mutation ? 'commit' : null;
    const storeAction = !!subject.action ? subject.action : !!subject.mutation ? subject.mutation : null;
    if (!!method) subject.hook(
      field ?
        sendTarget ?
          (store, value, key, target) => store[method](storeAction, { target, key, value }) : // target sending requested
          (store, value, key) => store[method](storeAction, { [ key ]: value }) : // not requested
        (store, value) => store[method](storeAction, value)); // just single instance dot-notated property mapped
    if (subject.dispatcher) result.set =
      field ?
        sendTarget ?
          function (value) {
            subject.dispatcher.call(this, this.$store, value, field, targetGetter.call(this));
          } :
          function (value) {
            subject.dispatcher.call(this, this.$store, value, field);
          } :
        function (value) {
          subject.dispatcher.call(this, this.$store, value);
        };
    return result;
  }
  var map_1 = map;

  /**
   * Exposes some properties of target object into computed properties compatible bunch
   * of getters or/and setters
   */
  class TargetExposition {
    /**
     *
     * @param {Target} target
     * @param {Array} projection
     */
    constructor(target, projection) {
      this.target = target;
      this.projection = projection;
      this.sendTarget = false;
    }
    
    /**
     * Sets `mutation` to be commited on exposed field change
     * if `sendTarget` is `false` `action` shall be called in format:
     *
     * `commit(mutation, {[key_of_exposed_field]: value})`
     *
     * otherwise, if `sendTarget` is set to `true`
     *
     * `commit(mutation, { target, key, value})`
     *
     * **Hint**: That's just syntax sugar for `hook()` method.
     * @param {String} mutation name of mutation
     * @param {Boolean} sendTarget send target to action
     * @return {TargetExposition}
     */
    commit(mutation, sendTarget = false) {
      this.target.commit(mutation);
      this.sendTarget = sendTarget || false;
      return this;
    }
    
    /**
     * Sets `action` to be dispatched on exposed field change
     * if `sendTarget` is `false` `action` shall be called in format:
     *
     * `dispatch(action, {[key_of_exposed_field]: value})`
     *
     * otherwise, if `sendTarget` is set to `true`
     *
     * `dispatch(action, { target, key, value})`
     *
     * **Hint**: That's just syntax sugar for `hook()` method.
     * @param {String} action name of action
     * @param {Boolean} sendTarget send target to action
     * @return {TargetExposition}
     */
    dispatch(action, sendTarget = false) {
      this.target.dispatch(action);
      this.sendTarget = sendTarget || false;
      return this;
    }
    
    /**
     * set dispatcher callback
     * @param {TargetExposition~dispatcher} dispatcher
     * @param {Boolean} sendTarget
     * @return {TargetExposition}
     */
    hook(dispatcher, sendTarget) {
      this.target.hook(dispatcher);
      this.sendTarget = sendTarget || false;
      return this;
    }
    
    /**
     * @callback TargetExposition~dispatcher
     * @param {Store} store `vuex` store
     * @param {*} value changed value
     * @param {String} key key of changed field
     * @param {*} target parent object of changed field
     */
    
    /**
     * generates map of getters or/and setters for specified projection
     * @return {Object}
     */
    map() {
      const result = {};
      const { target, sendTarget } = this;
      this.projection.forEach(field => {
        let camelCasedField = (field.indexOf('.') === -1) ? field : field.replace(/\.(.)/g, (all, matched) => matched.toUpperCase());
        result[camelCasedField] = map_1(target, field, sendTarget);
      });
      return result;
    }
  }
  var TargetExposition_1 = TargetExposition;

  /**
   * Target mapper
   */
  class Target {
    /**
     * @param {string} path dot-notation path to some property of your vm instance
     */
    constructor(path) {
      this.path = path;
      this.action = null;
      this.mutation = null;
      this.dispatcher = null;
    }
    
    /**
     * Shall be used if you need to map into your computed properties some properties of object,
     * selected as target, also with ability to attach action dispatcher or hook callback on each property change.
     * Both `dispatch()` and `hook()` can provide also object mapped by Target instance to callee, while setting
     * second argument is true (more you can read at their documentation)
     * @param {array} projection fields to be exposed
     * @returns {TargetExposition}
     */
    expose(projection) {
      return new TargetExposition_1(this, projection);
    }
    
    /**
     * In fact that's syntax sugar for `hook()` method.
     * Sets `action` to be dispatched on mapped property change
     * `action` shall be called in format:
     *
     * `dispatch(action, newValue)`
     * @param {string} action action name
     * @returns {Target}
     */
    commit(mutation) {
      this.mutation = mutation;
      return this;
    }
    
    /**
     * In fact that's syntax sugar for `hook()` method.
     * Sets `action` to be dispatched on mapped property change
     * `action` shall be called in format:
     *
     * `dispatch(action, newValue)`
     * @param {string} action action name
     * @returns {Target}
     */
    dispatch(action) {
      this.action = action;
      return this;
    }
    
    /**
     * Set hook that should be run on mapped property change.
     * Hook shall be run with such arguments
     * @param {Target~dispatcher} dispatcher
     * @returns {Target}
     */
    hook(dispatcher) {
      this.dispatcher = dispatcher;
      return this;
    }
    
    /**
     * @callback Target~dispatcher
     * @param {Store} store `vuex` store
     * @param {mixed} value
     */
    
    /**
     * returns computed property pair of getters or/and setters for specified projection
     * If alias is set it can be used with spread operator setting provided alias as computed property name
     * @param {String} alias name of computed field target to be accessible
     * @returns {*}
     */
    map(alias) {
      if (!alias) return map_1(this);
      return { [ alias ]: map_1(this) };
    }
  }

  var Target_1 = Target;

  /**
   * returns Target instance with specified path
   * @param {string} path dotted path to target property of your component instance
   * @returns {Target}
   */
  const take = path => new Target_1(path);
  /**
   * returns Target instance with specified state path
   * @param namespace
   * @param path
   * @return {Target}
   */
  const takeState = (namespace, path) => {
    if (typeof path === 'undefined') path = namespace;
    else path = `${namespace.replace('/', '.')}.${path}`;
    const fullPath = `$store.state.${path}`;
    return new Target_1(fullPath);
  };
  var vuexDot = { take, takeState };
  var vuexDot_1 = vuexDot.take;
  var vuexDot_2 = vuexDot.takeState;

  exports.default = vuexDot;
  exports.take = vuexDot_1;
  exports.takeState = vuexDot_2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

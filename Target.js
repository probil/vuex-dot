const TargetExposition = require('./TargetExposition');
const map = require('./map');

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
    return new TargetExposition(this, projection);
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
    if (!alias) return map(this);
    return { [ alias ]: map(this) };
  }
}

module.exports = Target;

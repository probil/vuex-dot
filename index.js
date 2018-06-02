const Target = require('./Target');
/**
 * returns Target instance with specified path
 * @param {string} path dotted path to target property of your component instance
 * @returns {Target}
 */
const take = path => new Target(path);
module.exports = take;

// eslint-disable-next-line no-unused-vars
const { HTMLToken } = require('./tokens');

/**
 * @param {*} value
 * @param {{ enter: function(*): * }} options
 * @return {*}
 */
function traverseToken(value, options) {
  if (value instanceof HTMLToken) {
    return traverse(value, options);
  }

  if (value instanceof Array) {
    return value.map((valueItem) => {
      return traverseToken(valueItem, options);
    });
  }

  return value;
}

/**
 * @param {*} ast
 * @param {{ enter: function(*): * }} options
 * @return {HTMLToken} ast
 */
function traverse(ast, options) {
  if (!ast) {
    throw new Error('[markup-lint]: traverse did not receive ast');
  }

  options.enter(ast);

  Object.keys(ast).forEach((key) => {
    return traverseToken(ast[key], options);
  });

  return ast;
}

module.exports = traverse;

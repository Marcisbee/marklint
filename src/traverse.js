const errorMessage = require('./utils/error-message');
const { HTMLToken } = require('./types');

/**
 * @param {HTMLMarkupType} value
 * @param {{ enter: function(AnyHTMLType): AnyHTMLType }} options
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
 * @param {HTMLMarkupType} ast
 * @param {{ enter: function(AnyHTMLType): AnyHTMLType }} options
 * @return {HTMLMarkupType} ast
 */
function traverse(ast, options) {
  if (!ast) {
    throw errorMessage('Traverse method did not receive ast');
  }

  options.enter(ast);

  Object.keys(ast).forEach((key) => {
    traverseToken(ast[key], options);
  });

  return ast;
}

module.exports = traverse;

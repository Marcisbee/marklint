/**
 * @param {string} message
 * @return  {Error}
 */
function errorMessage(message) {
  return new Error(`[markup-lint]: ${message}`);
}

module.exports = errorMessage;

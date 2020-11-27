/**
 * @param {string} message
 * @return  {Error}
 */
function errorMessage(message) {
  return new Error(`[marklint]: ${message}`);
}

module.exports = errorMessage;

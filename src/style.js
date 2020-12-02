/**
 * @param {string} text
 * @param {string[]} styles
 * @return {string[]}
 */
function style(text, styles = []) {
  return [
    ...styles,

    text,
    '\x1b[0m',
  ];
}

module.exports = style;

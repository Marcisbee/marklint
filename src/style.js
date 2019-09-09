/**
 * @param {string} text
 * @param {string[]} styles
 * @return {Function}
 */
function style(text, styles = []) {
  return () => {
    styles.forEach((style) => {
      process.stdout.write(style);
    });

    process.stdout.write(text);

    // Reset styles
    process.stdout.write('\x1b[0m');
    return text;
  };
}

module.exports = style;

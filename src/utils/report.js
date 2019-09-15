const THEME = require('../../theme');
const snippet = require('../snippet');
const style = require('../style');
const parse = require('../parser');
const traverse = require('../traverse');

const errorMessage = require('./error-message');

const PREFIX = {
  success: '<strong>✔</strong> ',
  error: '<strong>✖</strong> ',
  warning: '<strong>!</strong> ',
  info: '<strong>ℹ</strong> ',
  default: '',
};

/**
 * @param {'error' | 'warning' | 'info' | 'success' | 'default'} severity
 * @param {string} string
 */
function stylizeString(severity, string) {
  const newString = `\n${PREFIX[severity]}${string}\n`;
  const ast = parse(newString);

  const stylingList = [
    THEME.severity[severity],
  ];

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLOpeningElement') {
        const name = path.name.name;
        const style = THEME.inlineStyles[name];

        stylingList.push(style);
        return;
      }

      if (path.type === 'HTMLClosingElement') {
        stylingList.pop();
        return;
      }

      if (path.type === 'HTMLText') {
        const styles = stylingList
          .filter((s) => s)
          .reduce((acc, s) => acc.concat(s), []);

        style(path.raw, styles)();

        return;
      }
    },
  });
}

/**
 * @param {Record<string, *>} config
 */
function report(config) {
  if (!config) {
    throw errorMessage('Report function did not receive any config');
  }

  if (config.type === 'log') {
    const { severity, message } = config;

    stylizeString(severity, message);
  }

  if (config.type === 'snippet') {
    const { snippet: { ast, start, end } } = config;

    process.stdout.write('\n');
    snippet(ast, start, end).forEach((fn) => fn());
    process.stdout.write('\n');
  }
}

module.exports = report;

const THEME = require('../../theme');
const snippet = require('../snippet');
const style = require('../style');
const parse = require('../parser');
const traverse = require('../traverse');

const errorMessage = require('./error-message');

const PREFIX = {
  success: ' <strong>✔</strong> ',
  error: ' <strong>✖</strong> ',
  warning: ' <strong>!</strong> ',
  info: ' <strong>ℹ</strong> ',
  default: '',
};

const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';

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

  let pureText = false;

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLOpeningElement') {
        const name = path.name.name;

        if (name === 'a') {
          const url = path.attributes
            .find((s) => s.type === 'HTMLAttribute' && s.name.name === 'href');

          if (url.type === 'HTMLAttribute') {
            process.stdout.write([
              OSC,
              '8',
              SEP,
              SEP,
              url.value.value,
              BEL,
            ].join(''));

            pureText = true;
          }

          return;
        }

        const styleChunk = THEME.inlineStyles[name];

        stylingList.push(styleChunk);
        return;
      }

      if (path.type === 'HTMLClosingElement') {
        const name = path.name.name;

        if (name === 'a') {
          process.stdout.write([
            OSC,
            '8',
            SEP,
            SEP,
            BEL,
          ].join(''));

          pureText = false;

          return;
        }

        stylingList.pop();
        return;
      }

      if (path.type === 'HTMLText') {
        if (path.parent().type !== 'HTMLElement' && path.parent().type !== 'HTMLMarkup') {
          return;
        }

        if (pureText) {
          process.stdout.write(path.raw);

          return;
        }

        const styles = stylingList
          .filter((s) => s)
          .reduce((acc, s) => acc.concat(s), []);

        style(path.raw, styles)();

        return;
      }

      return ast;
    },
  });
}

/**
 * @param {AnyReportType} config
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

  if (config.type === 'inspect') {
    const { data } = config;

    process.stdout.write('\n');
    process.stdout.write(JSON.stringify(data, null, '  '));
    process.stdout.write('\n');
  }
}

module.exports = report;

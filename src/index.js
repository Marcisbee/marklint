const tokenize = require('./tokenize');
const traverse = require('./traverse');
const snippet = require('./snippet');

// eslint-disable-next-line require-jsdoc
class ErrorHandler {
  /**
   * @param {string[]} defaultConfig
   * @param {function} handler
   */
  constructor(defaultConfig, handler) {
    this.config = (...args) => {
      return Object.assign([], defaultConfig, args);
    };
    this.handler = handler;
  }
}

/**
 * @TODO : Make report function based on Sembec rome error reporter
 * @param {any} type
 * @param {any} message
 */
// function report(type, message) {

// }

const errorHandling = {
  'no-unclosed-tag': new ErrorHandler(['error', 'always'],
    (ast, path, [type, _setting]) => {
      if (path.type === 'HTMLElement') {
        if (path.openingElement.name.name !== path.closingElement.name.name) {
          // ✔ - success symbol
          // ✖ - error symbol
          // ⚠ - warning symbol
          // ℹ - info symbol
          console[type](
            `${colors.fg.red}${colors.bold}%s${colors.reset}${colors.fg.red}%s${colors.bold}%s${colors.reset}`,
            '✖ ',
            'Expected a corresponding HTML closing tag for ',
            `${path.openingElement.name.name}.`,
            ' (no-unclosed-tag)'
          );

          console.log();
          console.log(snippet(ast.raw, path.openingElement.name.start, path.openingElement.name.end));

          console.log(`${colors.bold}%s${colors.reset}`, '\n   1 ⎸',
            '<html>');
          console.log(`${colors.bold}%s${colors.reset}`, '   2 ⎸',
            '  <body>');
          console.log(`${colors.fg.red}${colors.bold}%s${colors.reset}${colors.bold}%s${colors.reset}`, ' >', ' 3 ⎸',
            '    <section>');
          console.log(`${colors.bold}%s${colors.fg.red}%s${colors.reset}`, '     ⎸', '      ^^^^^^^');
          console.log(`${colors.bold}%s${colors.reset}`, '   4 ⎸',
            '      <br/>');
          console.log(`${colors.bold}%s${colors.reset}`, '   5 ⎸',
            '    </WrongName>\n');
          console[type](
            `${colors.fg.blue}${colors.bold}%s${colors.reset}${colors.fg.blue}%s${colors.bold}%s${colors.reset}`,
            'ℹ ',
            'But found a closing tag of ',
            `${path.closingElement.name.name}.`
          );

          console.log();
          console.log(snippet(ast.raw, path.closingElement.name.start, path.closingElement.name.end));

          console.log(`${colors.bold}%s${colors.reset}`, '\n   3 ⎸',
            '    <section>');
          console.log(`${colors.bold}%s${colors.reset}`, '   4 ⎸',
            '      <br/>');
          console.log(`${colors.fg.red}${colors.bold}%s${colors.reset}${colors.bold}%s${colors.reset}`, ' >', ' 5 ⎸',
            '    </WrongName>');
          console.log(`${colors.bold}%s${colors.fg.red}%s${colors.reset}`, '     ⎸', '       ^^^^^^^^^');
          console.log(`${colors.bold}%s${colors.reset}`, '   6 ⎸',
            '  </body>');
          console.log(`${colors.bold}%s${colors.reset}`, '   7 ⎸',
            '</html>\n');
          // console[type]('3:1 - No unclosed tags. (no-unclosed-tag)');
        }
      }
    }
  ),
};

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};

/**
 * @param {any} fileName
 * @param {any} content
 * @param {Record<string, any>} rules
 */
function lint(fileName, content, rules) {
  const ast = tokenize(content);

  console.log(
    `${colors.underscore}${colors.bold}%s${colors.reset}`, fileName, '\n');

  traverse(ast, {
    enter: (path) => {
      Object.keys(rules).forEach((rule) => {
        const ruleHandler = errorHandling[rule];
        if (typeof ruleHandler === 'undefined') {
          throw new Error(`[markup-lint]: Unknown rule "${rule}"`);
        }

        const { config, handler } = ruleHandler;

        handler(ast, path, ...config(rules[rule]));
      });
    },
  });

  // console.log({
  //   ast,
  //   // @ts-ignore
  //   openingElement: ast.children[0].children[1].openingElement,
  //   // @ts-ignore
  //   closingElement: ast.children[0].children[1].closingElement,
  // });
}


const rules = {
  'no-unclosed-tag': ['error', 'always'],
  // 'indent': ['error', 2, { outerIIFEBody: 0 }],
};

const fileIndex =
`<html>
  <body>
    <section>
      text
    </WrongName>
  </body>
</html>
`;

lint('index.html', fileIndex, rules);

const tokenize = require('./tokenize');
const traverse = require('./traverse');

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
function report(type, message) {

}

const errorHandling = {
  'no-unclosed-tag': new ErrorHandler(['error', 'always'],
    (path, [type, _setting]) => {
      if (path.type === 'HTMLElement') {
        if (path.openingElement.name.name !== path.closingElement.name.name) {
          console[type]('3:1 - No unclosed tags. (no-unclosed-tag)');
        }
      }
    }
  ),
};

/**
 * @param {any} fileName
 * @param {any} content
 * @param {Record<string, any>} rules
 */
function lint(fileName, content, rules) {
  const ast = tokenize(content);

  console.log(fileName, '\n');

  traverse(ast, {
    enter: (path) => {
      Object.keys(rules).forEach((rule) => {
        const ruleHandler = errorHandling[rule];
        if (typeof ruleHandler === 'undefined') {
          throw new Error(`[markup-lint]: Unknown rule "${rule}"`);
        }

        const { config, handler } = ruleHandler;

        handler(path, ...config(rules[rule]));
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
    text
  </booty>
</html>
`;

lint('index.html', fileIndex, rules);

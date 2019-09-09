const tokenize = require('./tokenize');
const traverse = require('./traverse');
const snippet = require('./snippet');
const style = require('./style');
const THEME = require('../theme');

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
 * @TODO : Make report function that handles errors, warns and suggestions
 * @param {Record<string, any>} config
 */
// function report(config) {
//   const {
//     errors,
//     warnings,
//     suggestions,
//   } = config;

//   if (errors instanceof Array) {
//     errors.forEach(({ text }) => {
//       error
//     });
//   }

//   console.log(config);
// }

const errorHandling = {
  'no-unclosed-tag': new ErrorHandler(['error', 'always'],
    (ast, path, [type, _setting]) => {
      if (path.type === 'HTMLElement') {
        const openTag = path.openingElement;
        const closeTag = path.closingElement;
        if (!openTag.selfClosing &&
          openTag.name.name !== (closeTag && closeTag.name.name)) {
          const openTagName = openTag.name;
          const closeTagName = closeTag && closeTag.name;

          // ✔ - success symbol
          // ✖ - error symbol
          // ⚠ - warning symbol
          // ℹ - info symbol
          style('\n✖ ', THEME.errorPrefix)();
          style('Expected a corresponding HTML closing tag for ',
            THEME.errorText)();
          style(`${openTagName.name}`, THEME.errorVariable)();
          style('.\n\n', THEME.errorText)();
          // style(' (no-unclosed-tag)\n\n')();

          snippet(ast, openTagName.start, openTagName.end)
            .forEach((fn) => fn());

          // @TODO: Run list of self closing tags and give suggestion to fix
          // style('\nℹ ', THEME.infoPrefix)();
          // style('Should this tag be self closing?\n\n', THEME.infoText)();

          if (!closeTagName) {
            return;
          }

          style('\nℹ ', THEME.infoPrefix)();
          style('But found a closing tag of ', THEME.infoText)();
          style(`${closeTagName.name}`, THEME.infoVariable)();
          style('.\n\n', THEME.infoText)();

          snippet(ast, closeTagName.start, closeTagName.end)
            .forEach((fn) => fn());
          style('\n')();

          // @TODO: Pass it to summary function
          // @TODO: Create summary of linting
          //        - files parsed
          //        - errors found (max something)
          //        - warnings found (max something)
          //        - time taken
          // @example `✖ 2 problems (2 errors, 0 warnings)`
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

  style(`${fileName}\n`, THEME.fileName)();

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
    <section param="name">
      text
    </WrongName>
  </body>
</html>
`;

lint('index.html', fileIndex, rules);

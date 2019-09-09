const tokenize = require('./tokenize');
const traverse = require('./traverse');
const snippet = require('./snippet');
const style = require('./style');
const THEME = require('../theme');

// eslint-disable-next-line require-jsdoc
class ErrorHandler {
  /**
   * @param {*[]} defaultConfig
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
    (ast, path, [type, _setting] = []) => {
      if (path.type === 'HTMLElement') {
        const openTag = path.openingElement;
        const closeTag = path.closingElement;
        if (!openTag.selfClosing &&
          openTag.name.name !== (closeTag && closeTag.name.name)) {
          const openTagName = openTag.name;
          const closeTagName = closeTag && closeTag.name;

          // ✔ - success symbol
          // ✖ - error symbol
          // ! - warning symbol
          // ℹ - info symbol
          if (type === 'error') {
            style('\n✖ ', THEME.errorPrefix)();
            style('Expected a corresponding HTML closing tag for ',
              THEME.errorText)();
            style(`${openTagName.name}`, THEME.errorVariable)();
            style('.\n\n', THEME.errorText)();
            // style(' (no-unclosed-tag)\n\n')();
          }

          if (type === 'warning') {
            style('\n! ', THEME.warningPrefix)();
            style('Expected a corresponding HTML closing tag for ',
              THEME.warningText)();
            style(`${openTagName.name}`, THEME.warningVariable)();
            style('.\n\n', THEME.warningText)();
            // style(' (no-unclosed-tag)\n\n')();
          }

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
  'props-indent': new ErrorHandler(['error', 2],
    (ast, path, [type, indentSize] = []) => {
      if (path.type === 'HTMLOpeningElement' && path.attributes.length > 0) {
        const attributes = path.attributes
          .filter((attribute) => attribute.type === 'HTMLText');

        attributes.forEach((attribute) => {
          const correctionStart = (attribute.raw.match(/^\n/) || '').length;
          const correctIndent = new Array(indentSize).fill(' ').join('');

          if (attribute.raw !== `\n${correctIndent}`) {
            if (type === 'error') {
              style('\n✖ ', THEME.errorPrefix)();
              style('Expected an indent of ', THEME.errorText)();
              style(`${indentSize}`, THEME.errorVariable)();
              style(' instead got ', THEME.errorText)();
              style(`${attribute.raw.length - correctionStart}`,
                THEME.errorVariable)();
              style('.\n\n', THEME.errorText)();
              // style(' (no-unclosed-tag)\n\n')();
            }

            snippet(ast, attribute.start + correctionStart, attribute.end)
              .forEach((fn) => fn());
            style('\n')();
          }
        });
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
        const ruleConfig = config(rules[rule]);

        if (ruleConfig[0]) {
          handler(ast, path, ...ruleConfig);
        }
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
  'props-indent': ['error', 2],
  // 'indent': ['error', 2, { outerIIFEBody: 0 }],
};

// @TODO: Handle these https://www.w3.org/TR/html401/struct/global.html#h-7.5.4
// const fileIndex =
// `<!-- Example of data from the client database: -->
// <!-- Name: Stephane Boyera, Tel: (212) 555-1212, Email: sb@foo.org -->

// <DIV id="client-boyera" class="client">
// <P><SPAN class="client-title">Client information:</SPAN>
// <TABLE class="client-data">
// <TR><TH>Last name:<TD>Boyera</TR>
// </TABLE>
// </DIV>
// `;

const fileIndex =
`<a
  class="foo"
    href="https://google.com">
    text
</MessedUpTagName>`;

// @TODO: Fix this case where prop inlines html style text
// const fileIndex =
// `<base
//   class="<b></b>"
//   href="<%= htmlWebpackPlugin.options.metadata.baseUrl %>"
// >`;

lint('index.html', fileIndex, rules);

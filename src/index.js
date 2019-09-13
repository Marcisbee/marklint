const tokenize = require('./tokenize');
const traverse = require('./traverse');
const style = require('./style');
const THEME = require('../theme');

const ruleHandling = {
  'no-unclosed-tag': require('./rules/no-unclosed-tag'),
  'attr-indent': require('./rules/attr-indent'),
};

/**
 * @TODO: Create markdown for error messages
 * for example:
 * "Expected a ... closing tag for <emphasis>variable</emphasis>."
 *
 * ```js
 * [
 *   {
 *     "type": "log",
 *     "severity": "info",
 *     "message": "Hello world!"
 *   },
 *   {
 *     "type": "snippet",
 *     "snippet": snippet()
 *   }
 * ]
 * ```
 */

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
      Object.keys(rules)
        .forEach((rule) => {
          const ruleHandler = ruleHandling[rule];

          if (typeof ruleHandler === 'undefined') {
            throw new Error(`[markup-lint]: Unknown rule "${rule}"`);
          }

          const { config, handler } = ruleHandler;
          const ruleConfig = config(rules[rule]);

          if (rules[rule]) {
            handler(ast, path, ruleConfig);
          }
        });
    },
  });
}


/**
 * ---------------- MANUAL TESTING UNDER HERE --------------------
 */

/** @type {Record<string, RuleConfig>} */
const rules = {
  'no-unclosed-tag': {
    severity: 'error',
    options: [],
  },
  'attr-indent': {
    severity: 'error',
    options: [2],
  },
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
`


 asd  <a class="foo"
          href="https://google.com"
        home>  <--- @TODO FIX HERE
    text
</MessedUpTagName>`;

// @TODO: Fix this case where prop inlines html style text
// const fileIndex =
// `<base
//   class="<b></b>"
//   href="<%= htmlWebpackPlugin.options.metadata.baseUrl %>"
// >`;

console.time('Parsing');
lint('index.html', fileIndex, rules);
console.timeEnd('Parsing');

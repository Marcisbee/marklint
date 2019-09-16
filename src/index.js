const errorMessage = require('./utils/error-message');
const parse = require('./parser');
const traverse = require('./traverse');
const report = require('./utils/report');

const ruleHandling = {
  'no-unclosed-tag': require('./rules/no-unclosed-tag'),
  'attr-indent': require('./rules/attr-indent'),
};

/**
 * @param {Diagnostics} diagnostics
 * @param {string} content
 * @param {Record<string, any>} rules
 */
function lint(diagnostics, content, rules) {
  const ast = parse(content);

  traverse(ast, {
    enter: (path) => {
      Object.keys(rules)
        .forEach((rule) => {
          const ruleHandler = ruleHandling[rule];

          if (typeof ruleHandler === 'undefined') {
            throw errorMessage(`Unknown rule "${rule}"`);
          }

          const { config, handler } = ruleHandler;
          const ruleConfig = config(rules[rule]);

          if (rules[rule]) {
            const localDiagnostics = {
              rule,
              error: [],
              warning: [],
            };

            handler(localDiagnostics, ast, path, ruleConfig);

            diagnostics.error.push(...localDiagnostics.error);
            diagnostics.warning.push(...localDiagnostics.warning);
          }
        });

      return path;
    },
  });

  return ast;
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
        home>
    text
</MessedUpTagName>`;

// @TODO: Fix this case where prop inlines html style text
// const fileIndex =
// `<base
//   class="<b></b>"
//   href="<%= htmlWebpackPlugin.options.metadata.baseUrl %>"
// >`;

const filePath = 'index.html';

/** @type {Diagnostics} */
const diagnostics = {
  filePath,
  error: [],
  warning: [],
};

// console.time('Parsing');
lint(diagnostics, fileIndex, rules);
// console.timeEnd('Parsing');

report({
  type: 'log',
  severity: 'default',
  message: `<link>${filePath}</link>`,
});

diagnostics.error.forEach((issue) => {
  issue.details.forEach((detail) => {
    report(detail);
  });

  issue.advice.forEach((advice) => {
    report(advice);
  });
});

diagnostics.warning.forEach((issue) => {
  issue.details.forEach((detail) => {
    report(detail);
  });

  issue.advice.forEach((advice) => {
    report(advice);
  });
});

report({
  type: 'log',
  severity: 'error',
  message: `Found ${diagnostics.error.length} problems and ${diagnostics.warning.length} warnings.\n`,
});

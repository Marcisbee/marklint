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
 * @param {DiagnosticsTypes} type
 * @param {Function} action
 */
function calculateTime(diagnostics, type, action) {
  diagnostics.time[type].start = new Date().getTime();
  action();
  diagnostics.time[type].end = new Date().getTime();
}

/**
 * @param {Diagnostics} diagnostics
 * @param {string} content
 * @param {Record<string, any>} rules
 */
function lint(diagnostics, content, rules) {
  let ast = null;

  calculateTime(diagnostics, 'parser', () => {
    ast = parse(content);
  });

  calculateTime(diagnostics, 'traverse', () => {
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
  time: {
    parser: {
      start: null,
      end: null,
    },
    traverse: {
      start: null,
      end: null,
    },
    all: {
      start: null,
      end: null,
    },
  },
};

calculateTime(diagnostics, 'all', () => {
  lint(diagnostics, fileIndex, rules);
});

report({
  type: 'log',
  severity: 'default',
  message: `<a href="${filePath}">${filePath}</a>`,
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
  severity: 'info',
  message: `Parser: ${diagnostics.time.parser.end - diagnostics.time.parser.start}ms;
   Traverse: ${diagnostics.time.traverse.end - diagnostics.time.traverse.start}ms;
   Overall: ${diagnostics.time.all.end - diagnostics.time.all.start}ms;`,
});

report({
  type: 'log',
  severity: 'error',
  message: `Found ${diagnostics.error.length} problems and ${diagnostics.warning.length} warnings.\n`,
});

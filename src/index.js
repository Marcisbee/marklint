const directory = require('./directory');
const errorMessage = require('./utils/error-message');
const parse = require('./parser');
const traverse = require('./traverse');
const report = require('./utils/report');

const ruleHandling = {
  'no-void-tag-close': require('./rules/no-void-tag-close'),
  'no-flow-tag-close': require('./rules/no-flow-tag-close'),
  'no-unclosed-tag': require('./rules/no-unclosed-tag'),
  'attr-indent': require('./rules/attr-indent'),
  'attr-closing-bracket': require('./rules/attr-closing-bracket'),
  'closing-tag': require('./rules/closing-tag'),
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
        Object.keys(ruleHandling)
          .forEach((rule) => {
            const ruleHandler = ruleHandling[rule];

            if (typeof ruleHandler === 'undefined') {
              throw errorMessage(`Unknown rule "${rule}"`);
            }

            const { config, handler } = ruleHandler;
            const ruleConfig = config(rules[rule]);

            if (rules[rule] && rules[rule].severity !== 'off' || true) {
              /** @type {LocalDiagnostics} */
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
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Record<string, RuleConfig>} rules
 * @return {Diagnostics}
 */
function diagnoticRun(filePath, fileContent, rules) {
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
    lint(diagnostics, fileContent, rules);
  });

  return diagnostics;
}


/**
 * ---------------- MANUAL TESTING UNDER HERE --------------------
 */

const rootPath = 'html';

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
  'attr-closing-bracket': {
    severity: 'error',
    options: ['newline'],
  },
  'no-void-tag-close': {
    severity: 'warning',
    options: [true],
  },
  'no-flow-tag-close': {
    severity: 'warning',
    options: [true],
  },
  'closing-tag': {
    severity: 'warning',
    options: [],
  },
};

/** @type {Diagnostics[]} */
const diagnostics = [];
/** @type {(() => void)[]} */
const queue = [];

process.stdout.write(`\r\x1b[KFetching markup files`);

try {
  directory(rootPath, (filePath, read) => {
    queue.push(() => {
      process.stdout.write(`\r\x1b[KParsing ${filePath}`);

      diagnostics.push(
        diagnoticRun(filePath, read(), rules)
      );

      const next = queue.shift();

      if (typeof next === 'function') {
        next();
      }
    });
  }, {
    include: [
      '*.html',
      '*.htm',
      // '*.vue',
    ],
  });
} catch (e) { }

process.stdout.write(`\r\x1b[KRunning diagnostics..`);

const fn = queue.shift();

if (typeof fn !== 'function') {
  process.stdout.write(`\r\x1b[K`);
  report({
    type: 'log',
    severity: 'warning',
    message: `No markup files found in directory "${rootPath}"\n`,
  });
} else {
  fn();

  process.stdout.write(`\r\x1b[K`);

  report({
    diagnostics,
    type: 'diagnostics',
  });
}

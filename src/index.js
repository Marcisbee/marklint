const arg = require('arg');
const path = require('path');

const directory = require('./directory');
const errorMessage = require('./utils/error-message');
const parse = require('./parser');
const traverse = require('./traverse');
const report = require('./utils/report');
const { resolve, join } = require('path');
const print = require('./utils/print');

const ruleHandling = {
  'alt-require': require('./rules/alt-require'),
  'attr-lowercase': require('./rules/attr-lowercase'),
  'attr-value-not-empty': require('./rules/attr-value-not-empty'),
  'no-void-tag-close': require('./rules/no-void-tag-close'),
  'no-flow-tag-close': require('./rules/no-flow-tag-close'),
  'no-unclosed-tag': require('./rules/no-unclosed-tag'),
  'attr-format': require('./rules/attr-format'),
  'attr-closing-bracket': require('./rules/attr-closing-bracket'),
  'tag-indent': require('./rules/tag-indent'),
  'comment-format': require('./rules/comment-format'),
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
function diagnosticRun(filePath, fileContent, rules) {
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

const defaultPath = path.resolve(__dirname, '.');

/** @type {Record<string, RuleConfig>} */
const defaultRules = {
  'alt-require': {
    severity: 'error',
    options: [],
  },
  'attr-lowercase': {
    severity: 'error',
    options: {
      ignore: ['viewBox'],
    },
  },
  'attr-value-not-empty': {
    severity: 'error',
    options: {
      ignore: ['disabled'],
    },
  },
  'no-unclosed-tag': {
    severity: 'error',
    options: [],
  },
  'attr-format': {
    severity: 'error',
    options: {},
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
  'tag-indent': {
    severity: 'warning',
    options: {},
  },
  'comment-format': {
    severity: 'warning',
    options: {},
  },
};

/**
 * @typedef {Object} Config
 * @property {boolean=} fix
 * @property {string[]=} include
 * @property {string[]=} exclude
 * @property {Record<string, RuleConfig>=} rules
 */

/** @type {Config} */
const defaultConfig = {
  fix: false,
  include: [
    '*.html',
    '*.htm',
    // '*.vue',
  ],
  exclude: [
    'node_modules/**',
  ],
  rules: defaultRules,
};

/**
 * @param {string[]} rootPaths
 * @param {Config} userConfig
 */
function main(
  rootPaths = [defaultPath],
  userConfig = {},
) {
  const rules = userConfig.rules || defaultRules;
  /** @type {Diagnostics[]} */
  const diagnostics = [];
  /** @type {(() => void)[]} */
  const queue = [];

  const config = Object.assign({}, defaultConfig, userConfig);

  process.stdout.write(`\r\x1b[KFetching markup files`);

  try {
    directory(rootPaths, (filePath, read) => {
      queue.push(() => {
        const pathEnding = filePath.slice(-60);
        const printPath = pathEnding.length < filePath.length ? `...${pathEnding}` : pathEnding;
        process.stdout.write(`\r\x1b[KParsing ${printPath}`);

        diagnostics.push(
          diagnosticRun(filePath, read(), rules),
        );

        const next = queue.shift();

        if (typeof next === 'function') {
          next();
        }
      });
    }, {
      include: config.include,
      exclude: config.exclude,
    });
  } catch (e) {
    process.stdout.write(`\r\x1b[K`);
    print(
      report({
        type: 'log',
        severity: 'error',
        message: `${e.message}\n`,
      }),
    );
    process.exit(1);
  }

  process.stdout.write(`\r\x1b[KRunning diagnostics..`);

  const fn = queue.shift();

  if (typeof fn !== 'function') {
    process.stdout.write(`\r\x1b[K`);
    print(
      report({
        type: 'log',
        severity: 'warning',
        message: `No markup files found in "${rootPaths.join('", "')}"\n`,
      }),
    );
  } else {
    fn();

    process.stdout.write(`\r\x1b[K`);

    report({
      diagnostics,
      type: 'diagnostics',
      fix: config.fix,
    });
  }
};

/**
 * Runs linter
 */
module.exports = function validator() {
  const args = arg({
    // Types
    '--version': Boolean,
    '--fix': Boolean,
    '--config': String,
    '--include': [String],
    '--exclude': [String],

    // Aliases
    '-v': '--version',
    '-c': '--config',
    '-i': '--include',
    '-e': '--exclude',
  });

  if (args['--version']) {
    // @ts-ignore
    const packageJson = require('../package.json');
    console.log(`v${packageJson.version}`);
    process.exit(0);
  }

  const userConfig = {};
  if (args['--include']) {
    userConfig.include = args['--include'];
  }

  if (args['--exclude']) {
    userConfig.exclude = args['--exclude'];
  }

  if (args['--config']) {
    userConfig.config = args['--config'];
  }

  if (args['--fix']) {
    userConfig.fix = args['--fix'];
  }

  try {
    const configLocation = resolve(userConfig.config || join(resolve('.'), 'marklint.config.json'));
    Object.assign(defaultConfig, require(configLocation) || {});
  } catch (_) {
    print(
      report({
        type: 'log',
        severity: 'warning',
        message: `No config "marklint.config.json" file found${userConfig.config ? ` at "${userConfig.config}"` : ''}.`,
      }),
    );
  }

  const rootPath = resolve('.');
  const paths = args._.length ? args._ : [rootPath];
  const config = { ...defaultConfig, ...userConfig };

  main(paths, config);
};

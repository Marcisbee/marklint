const THEME = require('../../theme');
const snippet = require('../snippet');
const style = require('../style');
const parse = require('../parser');
const traverse = require('../traverse');
const generator = require('../generator');

const errorMessage = require('./error-message');
const { writeFileSync } = require('fs');

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

  const out = [];

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLOpeningElement') {
        const name = path.name.name;

        if (name === 'a') {
          const url = path.attributes
            .find((s) => s.type === 'HTMLAttribute' && s.name.name === 'href');

          if (url.type === 'HTMLAttribute') {
            out.push([
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
          out.push([
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
          out.push(path.value);

          return;
        }

        const styles = stylingList
          .filter((s) => s)
          .reduce((acc, s) => acc.concat(s), []);

        out.push(...style(path.value, styles));

        return;
      }

      return ast;
    },
  });

  return out;
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

    return stylizeString(severity, message);
  }

  if (config.type === 'snippet') {
    const { snippet: { ast, start, end } } = config;

    return [
      '\n',
      ...snippet(ast, start, end),
    ];
  }

  if (config.type === 'inspect') {
    const { data } = config;

    return [
      '\n',
      JSON.stringify(data, null, '  '),
      '\n',
    ];
  }

  if (config.type === 'diagnostics') {
    const { diagnostics, fix } = config;

    let fixes = 0;
    let errors = 0;
    let warnings = 0;

    const outputReports = [];

    diagnostics.forEach((diagnostic) => {
      const localErrors = diagnostic.error.length;
      const localWarnings = diagnostic.warning.length;

      errors += localErrors;
      warnings += localWarnings;

      if (localErrors === localWarnings && localErrors === 0) return;

      let localReports = [];

      let newAst;
      let localFixes = 0;

      diagnostic.error.forEach((issue) => {
        if (fix && issue.applyFix) {
          issue.applyFix();
          newAst = issue.getAst();
          errors -= 1;
          localFixes += 1;
          return;
        }

        issue.details.forEach((detail) => {
          localReports.push(...report(detail));
        });

        issue.advice.forEach((advice) => {
          localReports.push(...report(advice));
        });
      });

      diagnostic.warning.forEach((issue) => {
        if (fix && issue.applyFix) {
          issue.applyFix();
          newAst = issue.getAst();
          warnings -= 1;
          localFixes += 1;
          return;
        }

        issue.details.forEach((detail) => {
          localReports.push(...report(detail));
        });

        issue.advice.forEach((advice) => {
          localReports.push(...report(advice));
        });
      });

      if (fix && newAst) {
        const newHtml = generator(newAst);
        writeFileSync(diagnostic.filePath, newHtml.code);

        fixes += localFixes;
      }

      if (localReports.length > 0) {
        localReports = report({
          type: 'log',
          severity: 'default',
          message: `<a href="${diagnostic.filePath}">${diagnostic.filePath}</a>`,
        }).concat(localReports);
      }

      outputReports.push(...localReports);
    });

    // @TODO: Do diagnostics report on performance & time
    //   report({
    //     type: 'log',
    //     severity: 'info',
    //     message: `Parser: ${diagnostics.time.parser.end - diagnostics.time.parser.start}ms;
    //  Traverse: ${diagnostics.time.traverse.end - diagnostics.time.traverse.start}ms;
    //  Overall: ${diagnostics.time.all.end - diagnostics.time.all.start}ms;`,
    //   });

    const fixLog = fix ? ` and total of ${fixes} fixes applied` : '';

    outputReports.push(
      ...report({
        type: 'log',
        severity: 'info',
        message: `Parsed ${diagnostics.length} markup files${fixLog}.`,
      }),
    );

    process.stdout.write(outputReports.flat().join(''));

    if (errors === 0 && warnings === 0) {
      process.stdout.write(
        report({
          type: 'log',
          severity: 'success',
          message: `Found no problems.\n`,
        }).flat().join(''),
      );
      process.exit(0);
    }

    if (errors === 0 && warnings > 0) {
      process.stdout.write(
        report({
          type: 'log',
          severity: 'warning',
          message: `Found ${warnings} warnings.\n`,
        }).flat().join(''),
      );
      process.exit(0);
    }

    if (errors > 0) {
      process.stdout.write(
        report({
          type: 'log',
          severity: 'error',
          message: `Found ${errors} errors and <color-yellow>${warnings} warnings</color-yellow>.\n`,
        }).flat().join(''),
      );
      process.exit(1);
    }
  }
}

module.exports = report;

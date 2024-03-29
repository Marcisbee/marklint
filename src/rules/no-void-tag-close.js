const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [true],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options: [close] }) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLOpeningElement') {
    if (close && path.voidElement && !path.selfClosing) {
      const openTagName = path.name;

      /** @type {DiagnosticsReport} */
      const report = {
        type: diagnostics.rule,
        details: [],
        advice: [],
        applyFix: null,
        getAst: () => ast,
      };

      report.details.push({
        type: 'log',
        severity,
        suffix: diagnostics.rule,
        message: `Expected void element <strong>${openTagName.name}</strong> to be self closed.`,
      });

      const locIssue = getLOC(ast.raw, openTagName.start, openTagName.end);

      report.details.push({
        type: 'snippet',
        snippet: {
          ast,
          start: locIssue.start,
          end: locIssue.end,
        },
      });

      diagnostics[severity].push(report);

      /**
       * Apply the fix
       */
      report.applyFix = () => {
        path.selfClosing = true;
      };
    }

    if (!close && path.voidElement && path.selfClosing) {
      const openTagName = path.name;

      /** @type {DiagnosticsReport} */
      const report = {
        type: diagnostics.rule,
        details: [],
        advice: [],
        applyFix: null,
        getAst: () => ast,
      };

      report.details.push({
        type: 'log',
        severity,
        suffix: diagnostics.rule,
        message: `Expected void element <strong>${openTagName.name}</strong> to not be self closed.`,
      });

      const locIssue = getLOC(ast.raw, openTagName.start, openTagName.end);

      report.details.push({
        type: 'snippet',
        snippet: {
          ast,
          start: locIssue.start,
          end: locIssue.end,
        },
      });

      diagnostics[severity].push(report);

      /**
       * Apply the fix
       */
      report.applyFix = () => {
        path.selfClosing = false;
      };
    }
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

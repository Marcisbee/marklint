const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');
const { HTMLAttribute } = require('../types');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: {},
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity }) => {
  if (severity === 'off') return;

  if (path instanceof HTMLAttribute && path.name.name === 'style') {
    const attributeName = path.name;

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
      message: `Unexpected <strong>${attributeName.name}</strong> attribute used.`,
    });

    const locIssue = getLOC(ast.raw, attributeName.start, attributeName.end);

    report.details.push({
      type: 'snippet',
      snippet: {
        ast,
        start: locIssue.start,
        end: locIssue.end,
      },
    });

    diagnostics[severity].push(report);
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;


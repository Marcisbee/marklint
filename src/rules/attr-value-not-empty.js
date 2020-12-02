const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');
const { HTMLAttribute } = require('../types');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: {
    ignore: ['disabled'],
  },
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options }) => {
  if (severity === 'off') return;

  if (path instanceof HTMLAttribute) {
    if (path.value && path.value.value && path.value.value.replace(/^['"]|['"]$/g, '') !== '') return;

    const attributeName = path.name;

    if (attributeName.name[0] === '#') return;

    if (attributeName.name === '*ngSwitchDefault') return;

    if ((options.ignore || []).indexOf(attributeName.name) > -1) return;

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
      message: `Expected <strong>${attributeName.name}</strong> attribute to have value.`,
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

const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');
const { HTMLAttribute } = require('../types');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: {
    ignore: ['viewBox'],
  },
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options }) => {
  if (severity === 'off') return;

  if (path instanceof HTMLAttribute) {
    const attributeName = path.name;
    const strippedName = attributeName.name.replace(/^[(\[]|[)\]]$/g, '');

    if (strippedName[0] === '#') return;

    if (strippedName.substring(0, 2) === 'ng') return;

    if (strippedName.substring(0, 3) === '*ng') return;

    if (strippedName.substring(0, 8) === 'gradient') return;

    if ((options.ignore || []).indexOf(strippedName) > -1) return;

    if (attributeName.name.toLowerCase() === attributeName.name) return;

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
      message: `Expected <strong>${attributeName.name}</strong> attribute name to be in lowercase.`,
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

    /**
     * Apply the fix
     */
    report.applyFix = () => {
      attributeName.name = attributeName.name.toLowerCase();
    };
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

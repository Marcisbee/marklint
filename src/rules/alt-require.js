const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');
const { HTMLAttribute } = require('../types');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options: [] }) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLOpeningElement') {
    const openTagName = path.name;
    if (openTagName.name === 'img') {
      const altAttribute = path.attributes.find((attribute) => (
        attribute instanceof HTMLAttribute && (
          attribute.name.name === 'alt' || attribute.name.name === '[alt]'
        )
      ));

      if (altAttribute) {
        return;
      }

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
        message: `Expected img element to have "alt" attribute.`,
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
    }
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');
const { HTMLAttribute, HTMLOpeningElement } = require('../types');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: {
    ignore: [],
  },
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options }) => {
  if (severity === 'off') return;

  if (path instanceof HTMLOpeningElement && path.attributes.length > 1) {
    const usedAttributes = [];

    for (const attr of path.attributes) {
      if (!(attr instanceof HTMLAttribute)) {
        continue;
      }

      const index = path.attributes.findIndex((a) => {
        if (!(a instanceof HTMLAttribute)) {
          return false;
        }

        return a.name.name === attr.name.name;
      });

      if (index === -1) {
        continue;
      }

      if (usedAttributes.indexOf(attr.name.name) === -1) {
        usedAttributes.push(attr.name.name);
        continue;
      }

      const attributeName = attr.name;

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
        message: `Unexpected duplicate attribute <strong>${attributeName.name}</strong>.`,
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
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

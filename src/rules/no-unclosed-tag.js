const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity }) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLElement') {
    const openTag = path.openingElement;
    const closeTag = path.closingElement;
    if (!openTag.voidElement &&
      !openTag.flowElement &&
      !openTag.selfClosing &&
      openTag.name.name !== (closeTag && closeTag.name.name)) {
      if (openTag.blockElement && !closeTag) return;

      const openTagName = openTag.name;
      const closeTagName = closeTag && closeTag.name;

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
        message: `Expected a corresponding HTML closing tag for <strong>${openTagName.name}</strong>.`,
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

      if (!closeTagName) {
        return;
      }

      report.advice.push({
        type: 'log',
        severity: 'info',
        message: `But found a closing tag of <strong>${closeTagName.name}</strong>.`,
      });

      const locInfo = getLOC(ast.raw, closeTagName.start, closeTagName.end);

      report.advice.push({
        type: 'snippet',
        snippet: {
          ast,
          start: locInfo.start,
          end: locInfo.end,
        },
      });
    }
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

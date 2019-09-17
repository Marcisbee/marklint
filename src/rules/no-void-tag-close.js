const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [true],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity, options: [close] }) => {
  if (path.type === 'HTMLOpeningElement') {
    if (close && path.voidElement && !path.selfClosing) {
      const openTagName = path.name;

      const report = {
        type: diagnostics.type,
        details: [],
        advice: [],
        fixable: false,
      };

      report.details.push({
        type: 'log',
        severity,
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

      report.advice.push({
        type: 'log',
        severity: 'info',
        message: `This could be fixed by adding "/" at the end of tag <strong>＜${openTagName.name}/＞</strong>.`,
      });
    }

    if (!close && path.voidElement && path.selfClosing) {
      const openTagName = path.name;

      const report = {
        type: diagnostics.type,
        details: [],
        advice: [],
        fixable: false,
      };

      report.details.push({
        type: 'log',
        severity,
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

      report.advice.push({
        type: 'log',
        severity: 'info',
        message: `This could be fixed by removing "/" at the end of tag <strong>＜${openTagName.name}＞</strong>.`,
      });
    }
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

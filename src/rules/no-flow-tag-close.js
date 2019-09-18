const { HTMLClosingElement, HTMLIdentifier } = require('../types');
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
    if (close && path.flowElement && !path.selfClosing) {
      const openTagName = path.name;

      const report = {
        type: diagnostics.type,
        details: [],
        advice: [],
        fixable: true,
      };

      report.details.push({
        type: 'log',
        severity,
        message: `Expected flow element <strong>${openTagName.name}</strong> to be closed.`,
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

      const children = path.parent().children;

      if (!children) return;

      const locInfo = getLOC(ast.raw, children[children.length - 1].end);

      report.advice.push({
        type: 'log',
        severity: 'info',
        message: `Closing tag <strong><style></${openTagName.name}></style></strong> should be placed here`,
      });

      report.advice.push({
        type: 'snippet',
        snippet: {
          ast,
          start: locInfo.start,
          end: locInfo.end,
        },
      });

      /**
       * Apply the fix
       */
      path.parent().closingElement = new HTMLClosingElement({
        start: 0,
        end: 0,
        parent: () => path.parent(),
        name: new HTMLIdentifier({
          start: 0,
          end: 0,
          parent: () => path.parent().closingElement,
          name: openTagName.name,
          raw: openTagName.name,
        }),
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

      /**
       * Apply the fix
       */
      path.selfClosing = false;
    }
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

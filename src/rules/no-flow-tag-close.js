// const { HTMLClosingElement, HTMLIdentifier } = require('../types');
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
    if (close && path.flowElement &&
      (!path.selfClosing || !path.parent().closingElement)) {
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
        message: `Expected element <strong>${openTagName.name}</strong> to be closed.`,
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
      // path.parent().closingElement = new HTMLClosingElement({
      //   start: 0,
      //   end: 0,
      //   parent: () => path.parent(),
      //   name: new HTMLIdentifier({
      //     start: 0,
      //     end: 0,
      //     parent: () => path.parent().closingElement,
      //     name: openTagName.name,
      //     raw: openTagName.name,
      //   }),
      // });
    }

    if (!close && path.flowElement &&
      (path.selfClosing || path.parent().closingElement)) {
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
        message: `Expected element <strong>${openTagName.name}</strong> to not be closed.`,
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

      const closingElement = path.parent().closingElement;

      if (!closingElement) return;

      const locInfo = getLOC(ast.raw, closingElement.start, closingElement.end);

      report.advice.push({
        type: 'log',
        severity: 'info',
        message: `Closing tag <strong><style></${closingElement.name.name}></style></strong> should be removed`,
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
      // path.parent().closingElement = null;
    }
  }

  return;
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

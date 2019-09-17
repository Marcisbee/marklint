const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, { severity }) => {
  if (path.type === 'HTMLElement') {
    const openTag = path.openingElement;
    const closeTag = path.closingElement;
    if (!openTag.voidElement && !openTag.selfClosing &&
      openTag.name.name !== (closeTag && closeTag.name.name)) {
      const openTagName = openTag.name;
      const closeTagName = closeTag && closeTag.name;

      const report = {
        type: diagnostics.type,
        details: [],
        advice: [],
        fixable: false,
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

      // @TODO: Run list of self closing tags and give suggestion to fix
      // style('\nℹ ', THEME.infoPrefix)();
      // style('Should this tag be self closing?\n\n', THEME.infoText)();

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

      // @TODO: Pass it to summary function
      // @TODO: Create summary of linting
      //        - files parsed
      //        - errors found (max something)
      //        - warnings found (max something)
      //        - time taken
      // @example `✖ 2 problems (2 errors, 0 warnings)`
    }
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

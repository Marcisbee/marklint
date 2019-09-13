const report = require('../utils/report');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [],
};

/** @type {RuleHandler} */
const handler = (ast, path, { severity }) => {
  if (path.type === 'HTMLElement') {
    const openTag = path.openingElement;
    const closeTag = path.closingElement;
    if (!openTag.selfClosing &&
      openTag.name.name !== (closeTag && closeTag.name.name)) {
      const openTagName = openTag.name;
      const closeTagName = closeTag && closeTag.name;

      report({
        type: 'log',
        severity,
        message: `Expected a corresponding HTML closing tag for <strong>${openTagName.name}</strong>.`,
      });

      report({
        type: 'snippet',
        snippet: {
          ast,
          start: openTagName.start,
          end: openTagName.end,
        },
      });

      // @TODO: Run list of self closing tags and give suggestion to fix
      // style('\nℹ ', THEME.infoPrefix)();
      // style('Should this tag be self closing?\n\n', THEME.infoText)();

      if (!closeTagName) {
        return;
      }

      report({
        type: 'log',
        severity: 'info',
        message: `But found a closing tag of <strong>${closeTagName.name}</strong>.`,
      });

      report({
        type: 'snippet',
        snippet: {
          ast,
          start: closeTagName.start,
          end: closeTagName.end,
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

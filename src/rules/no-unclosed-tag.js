const ruleHandler = require('../utils/rule-handler');
const snippet = require('../snippet');
const style = require('../style');
const THEME = require('../../theme');

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

      // ✔ - success symbol
      // ✖ - error symbol
      // ! - warning symbol
      // ℹ - info symbol
      if (severity === 'error') {
        style('\n✖ ', THEME.errorPrefix)();
        style('Expected a corresponding HTML closing tag for ',
          THEME.errorText)();
        style(`${openTagName.name}`, THEME.errorVariable)();
        style('.\n\n', THEME.errorText)();
        // style(' (no-unclosed-tag)\n\n')();
      }

      if (severity === 'warning') {
        style('\n! ', THEME.warningPrefix)();
        style('Expected a corresponding HTML closing tag for ',
          THEME.warningText)();
        style(`${openTagName.name}`, THEME.warningVariable)();
        style('.\n\n', THEME.warningText)();
        // style(' (no-unclosed-tag)\n\n')();
      }

      snippet(ast, openTagName.start, openTagName.end)
        .forEach((fn) => fn());

      // @TODO: Run list of self closing tags and give suggestion to fix
      // style('\nℹ ', THEME.infoPrefix)();
      // style('Should this tag be self closing?\n\n', THEME.infoText)();

      if (!closeTagName) {
        return;
      }

      style('\nℹ ', THEME.infoPrefix)();
      style('But found a closing tag of ', THEME.infoText)();
      style(`${closeTagName.name}`, THEME.infoVariable)();
      style('.\n\n', THEME.infoText)();

      snippet(ast, closeTagName.start, closeTagName.end)
        .forEach((fn) => fn());
      style('\n')();

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

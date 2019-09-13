const ruleHandler = require('../utils/rule-handler');
const snippet = require('../snippet');
const style = require('../style');
const THEME = require('../../theme');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [2],
};

/** @type {RuleHandler} */
const handler = (ast, path, { severity, options: [indentSize] }) => {
  let lastIndent = 0;

  if (path.type === 'HTMLOpeningElement') {
    const attributes = path.attributes;

    if (attributes.length === 0) return;

    const textBeforeTag = path.parent().previous();

    if (textBeforeTag && textBeforeTag.type === 'HTMLText') {
      const textLines = textBeforeTag.raw.split(/\n/g);
      lastIndent = textLines[textLines.length - 1].length;
    }

    const filteredAttributes = attributes
      .filter((attribute) => attribute.type === 'HTMLText');

    filteredAttributes.forEach((attribute) => {
      const correctionStart = (attribute.raw.match(/^\n/) || '').length;
      const normalizedIndent = indentSize + lastIndent;
      const correctIndent = new Array(normalizedIndent).fill(' ').join('');

      if (!/^\n/.test(attribute.raw)) {
        return;
      }

      if (attribute.raw !== `\n${correctIndent}`) {
        if (severity === 'error') {
          // @TODO: this
          // actions.push({
          //   severity,
          //   type: 'log',
          //   message: `Expected an indent of <b>${normalizedIndent}</b> spaces but instead got <b>${attribute.raw.length - correctionStart}</b>.`,
          // });
          style('\n✖ ', THEME.errorPrefix)();
          style('Expected an indent of ', THEME.errorText)();
          style(`${normalizedIndent}`, THEME.errorVariable)();
          style(' spaces but instead got ', THEME.errorText)();
          style(`${attribute.raw.length - correctionStart}`,
            THEME.errorVariable)();
          style('.\n\n', THEME.errorText)();
          // style(' (no-unclosed-tag)\n\n')();
        }

        snippet(ast, attribute.start + correctionStart, attribute.end)
          .forEach((fn) => fn());
        style('\n')();
      }
    });
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

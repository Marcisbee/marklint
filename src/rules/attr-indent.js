const report = require('../utils/report');
const ruleHandler = require('../utils/rule-handler');

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

    if (textBeforeTag.type === 'HTMLText') {
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
        report({
          type: 'log',
          severity,
          message: `Expected an indent of <strong>${normalizedIndent}</strong> spaces but instead got <strong>${attribute.raw.length - correctionStart}</strong>.`,
        });

        report({
          type: 'snippet',
          snippet: {
            ast,
            start: attribute.start + correctionStart,
            end: attribute.end,
          },
        });
      }
    });
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

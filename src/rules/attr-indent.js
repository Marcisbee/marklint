const { HTMLAttribute } = require('../types');
const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [2, 1],
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: [indentSize, spacesBetweenOneLiner = 1],
}) => {
  if (severity === 'off') return;

  let lastIndent = 0;

  if (path.type === 'HTMLOpeningElement') {
    const attributes = path.attributes;

    if (attributes.length === 0) return;

    const lastTextLine = ast.raw.substring(0, path.start).split('\n').pop();
    lastIndent = lastTextLine.length;

    const filteredAttributes = attributes
      .filter((attribute) => attribute.type === 'HTMLText');
    const lastIndex = filteredAttributes.length - 1;
    const hasLastAttribute =
      filteredAttributes[lastIndent] instanceof HTMLAttribute;

    filteredAttributes.forEach((attribute, index) => {
      if (hasLastAttribute && lastIndex === index) return;
      if (typeof attribute.value !== 'string') return;
      const correctionStart = (attribute.value.match(/^\n/) || '').length;
      const normalizedIndent = indentSize + lastIndent;
      const correctIndent = new Array(normalizedIndent).fill(' ').join('');

      if (!/^\n/.test(attribute.value)) {
        if (attribute.value === ' ') {
          return;
        }

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
          suffix: diagnostics.rule,
          message: `Expected an indent of <strong>${spacesBetweenOneLiner}</strong> spaces but instead got <strong>${attribute.value.length}</strong>.`,
        });

        const loc = getLOC(
          ast.raw,
          attribute.start,
          attribute.start === attribute.end ?
            attribute.end + 1 :
            attribute.end,
        );

        report.details.push({
          type: 'snippet',
          snippet: {
            ast,
            start: loc.start,
            end: loc.end,
          },
        });

        diagnostics[severity].push(report);

        /**
         * Apply the fix
         */
        report.applyFix = () => {
          const correctOneLinerIndent = new Array(spacesBetweenOneLiner).fill(' ').join('');
          attribute.value = correctOneLinerIndent;
        };

        return;
      }

      if (attribute.value !== `\n${correctIndent}`) {
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
          suffix: diagnostics.rule,
          message: `Expected an indent of <strong>${normalizedIndent}</strong> spaces but instead got <strong>${attribute.value.length - correctionStart}</strong>.`,
        });

        const loc = getLOC(
          ast.raw, attribute.start + correctionStart, attribute.end);

        report.details.push({
          type: 'snippet',
          snippet: {
            ast,
            start: loc.start,
            end: loc.end,
          },
        });

        diagnostics[severity].push(report);

        /**
         * Apply the fix
         */
        report.applyFix = () => {
          attribute.value = `\n${correctIndent}`;
        };
      }
    });
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

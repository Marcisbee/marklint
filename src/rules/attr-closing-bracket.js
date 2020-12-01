const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: ['eol', 0, 4], // ['eol' | 'newline', number, number]
};

const getIndentSize = (htmlData, raw) => {
  if (!htmlData || typeof htmlData.value !== 'string' && !raw) return 0;

  const match = (raw || htmlData.value).split(/\n/).pop();

  if (!match) return 0;

  return (match || '').length;
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: [lastWhitespace = 'newline', whitespaceSize = 0, attributeSize = 4],
}) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLOpeningElement') {
    const elementBefore = path.parent().previous();
    const tagIndent = getIndentSize(elementBefore);
    const attributes = path.attributes;

    if (attributes.length === 0) return;

    /** @type {HTMLAttributeType | HTMLTextType} */
    const attribute = attributes.slice().pop();

    // eol
    if (lastWhitespace === 'eol') {
      if (whitespaceSize <= 0) {
        if (typeof attribute === 'undefined') return;
        if (attribute.type !== 'HTMLText') return;
      }

      const currentIndent = getIndentSize(attribute);

      if (currentIndent === whitespaceSize && !/\n/.test(String(attribute.value))) return;

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
        message: `Expected an ending bracket on the same line as last attribute.`,
      });

      const loc = getLOC(
        ast.raw, attribute.end, attribute.end + 1);

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
        const correctIndent = new Array(whitespaceSize).fill(' ').join('');
        attribute.value = correctIndent;
      };

      return;
    }


    // newline
    if (attributes.length <= attributeSize) return;

    const currentIndent = getIndentSize(
      attribute,
      ast.raw.substring(0, path.start),
    );

    if (currentIndent === tagIndent) return;

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
      message: `Expected an indent of <strong>${tagIndent}</strong> spaces but instead got <strong>${currentIndent}</strong>.`,
    });

    const loc = getLOC(
      ast.raw,
      attribute.type !== 'HTMLText' ? attribute.end : attribute.start + 1,
      attribute.type !== 'HTMLText' ? attribute.end + 1 : attribute.end,
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
      const correctIndent = new Array(tagIndent).fill(' ').join('');
      attribute.value = `\n${correctIndent}`;
    };
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

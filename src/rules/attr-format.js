const editorConfig = require('../utils/editorconfig');
const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: {},
};

const indentTypes = {
  space: ' ',
  tab: '\t',
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: {
    type = editorConfig.indentType || 'space',
    newline = editorConfig.indentSize,
    inline = 1,
    maxInlineSize = 50,
  },
}) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLOpeningElement') {
    const attributes = path.attributes;

    if (attributes.length === 0) return;

    const attributeElements = attributes
      .filter((attribute) => attribute.type === 'HTMLAttribute');
    const attributeSize = attributeElements
      .reduce((acc, { end, start }) => acc + (end - start), 0);
    const forceNewLine = attributeSize > maxInlineSize;
    const attributeText = attributes
      .filter((attribute) => attribute.type === 'HTMLText');

    if (forceNewLine) {
      const correctIndentSize = ast.raw.substring(0, path.start).split('\n').pop().length;

      attributeText.forEach((attribute) => {
        const next = attribute.next();
        if (!next || next.type !== 'HTMLAttribute') return;
        if (typeof attribute.value !== 'string') return;

        if (/^\n/.test(attribute.value)) {
          if (attribute.value.replace(/^\n/, '').length === correctIndentSize + newline) return;

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
            message: `Expected an indent of <strong>${correctIndentSize + newline}</strong> ${type}s but instead got <strong>${attribute.value.replace(/^\n/, '').length}</strong>.`,
          });

          const loc = getLOC(
            ast.raw,
            attribute.start + 1,
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
            const correctOneLinerIndent = new Array(correctIndentSize + newline).fill(indentTypes[type]).join('');
            attribute.value = `\n${correctOneLinerIndent}`;
          };

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
          message: `Expected <strong>${next.name.name}</strong> attribute to be in new line.`,
        });

        const loc = getLOC(
          ast.raw,
          next.name.start,
          next.name.end,
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
          const correctOneLinerIndent = new Array(correctIndentSize + newline).fill(indentTypes[type]).join('');
          attribute.value = `\n${correctOneLinerIndent}`;
        };
      });

      return;
    }

    attributeText.forEach((attribute) => {
      const next = attribute.next();
      if (!next || next.type !== 'HTMLAttribute') return;
      if (typeof attribute.value !== 'string') return;

      if (!/^\n/.test(attribute.value)) {
        if (attribute.value.length === inline) return;

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
          message: `Expected an indent of <strong>${inline}</strong> spaces but instead got <strong>${attribute.value.length}</strong>.`,
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
          const correctOneLinerIndent = new Array(inline).fill(' ').join('');
          attribute.value = correctOneLinerIndent;
        };

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
        message: `Expected <strong>${next.name.name}</strong> attribute to be in the same line.`,
      });

      const loc = getLOC(
        ast.raw,
        next.name.start,
        next.name.end,
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
        const correctOneLinerIndent = new Array(inline).fill(' ').join('');
        attribute.value = correctOneLinerIndent;
      };
    });
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'error',
  options: [],
};

const getIndentSize = (htmlData) => {
  if (!htmlData || typeof htmlData.value !== 'string') return 0;

  const match = htmlData.value.split(/\n/).pop();

  if (!match) return 0;

  return (match || '').length;
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: [],
}) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLClosingElement') {
    const parent = path.parent();
    const elementBefore = parent.previous();
    const tagIndent = (elementBefore && elementBefore.type === 'HTMLText') ? getIndentSize(elementBefore) : 0;

    const childBefore = parent.children[parent.children.length - 1];
    const childIndent = (childBefore && childBefore.type === 'HTMLText') ? getIndentSize(childBefore) : 0;

    if (!childBefore) return;
    if (childBefore.type !== 'HTMLText') return;
    if (!/\n/.test(childBefore.value || '')) return;

    if (tagIndent === childIndent) return;

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
      message: `Expected an indent of <strong>${tagIndent}</strong> spaces but instead got <strong>${childIndent}</strong>.`,
    });

    const loc = getLOC(
      ast.raw,
      path.start - childIndent,
      path.start,
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
      childBefore.value = `\n${tagIndent}`;
    };
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

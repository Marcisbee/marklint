const getLOC = require('../utils/get-loc');
const ruleHandler = require('../utils/rule-handler');

/** @type {RuleConfig} */
const defaults = {
  severity: 'warning',
  options: {},
};

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: {
    start = 1,
    end = 1,
  },
}) => {
  if (severity === 'off') return;

  if (path.type === 'HTMLComment') {
    const correctStartChunk = new Array(start).fill(' ').join('');
    const correctEndChunk = new Array(end).fill(' ').join('');

    const [startChunk] = path.value.match(/^\W+/) || [''];
    const [endChunk] = path.value.match(/\W+$/) || [''];

    const skipStart = startChunk === correctStartChunk;
    const skipEnd = endChunk === correctEndChunk;

    if (!skipStart) {
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
        message: `Expected <strong>${start}</strong> spaces but instead got <strong>${startChunk.length}</strong>.`,
      });

      const loc = getLOC(
        ast.raw,
        path.start + 4,
        path.start + 4 + (startChunk.length || 1),
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
        path.value = correctStartChunk + path.value.replace(/^\W+/, '');
      };
    }

    if (!skipEnd) {
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
        message: `Expected <strong>${end}</strong> spaces but instead got <strong>${endChunk.length}</strong>.`,
      });

      const loc = getLOC(
        ast.raw,
        path.end - 3 - (endChunk.length || 1),
        path.end - 3,
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
        path.value = path.value.replace(/\W+$/, '') + correctEndChunk;
      };
    }
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

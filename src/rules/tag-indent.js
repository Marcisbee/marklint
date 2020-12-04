const { HTMLText } = require('../types');
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

/**
 * @param {string[]} lines
 * @param {number} index
 * @param {number=} modifier
 * @param {{ first?: number, last?: number }=} modifiers
 * @returns {{ start: number, end: number }}
 */
function getLinePosition(lines, index, modifier = 0, modifiers = {}) {
  let size = modifier;

  // eslint-disable-next-line guard-for-in
  for (const i in lines) {
    const line = lines[i];

    if (parseInt(i, 10) === index) {
      return {
        start: size,
        end: size + line.length,
      };
    }

    if (parseInt(i, 10) === lines.length - 1) {
      size -= modifiers.last;
    }

    if (parseInt(i, 10) === 0) {
      size -= modifiers.first;
    }

    size += 1;
    size += line.length;
  }

  return {
    start: null,
    end: null,
  };
}

/** @type {RuleHandler} */
const handler = (diagnostics, ast, path, {
  severity,
  options: {
    type = editorConfig.indentType || 'space',
    newline = editorConfig.indentSize,
    ignore = ['pre', 'script', 'style'],
  },
}) => {
  if (severity === 'off') return;

  const indentStep = new Array(newline).fill(indentTypes[type]).join('');

  if (path.type === 'HTMLClosingElement') {
    const parent = path.parent();
    const depth = parent.depth;
    const children = parent.children;

    if (children.length === 0) return;

    const [lastChild] = children.slice(-1);

    if (lastChild.type === 'HTMLText') return;

    const correctIndent = new Array(depth).fill(indentStep).join('');

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
      message: `Expected a new line.`,
    });

    const loc = getLOC(
      ast.raw,
      path.start,
      path.end,
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
      children.push(
        new HTMLText({
          start: 0,
          end: 0,
          next: () => null,
          previous: () => lastChild,
          parent: () => parent,
          value: '\n' + correctIndent,
        }),
      );
    };

    return;
  }

  if (path.type === 'HTMLElement') {
    const previous = path.previous();

    if (previous && previous.type === 'HTMLText') return;

    const parent = path.parent();

    if (parent.type !== 'HTMLElement') return;

    const depth = path.depth;
    const correctIndent = new Array(depth).fill(indentStep).join('');

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
      message: `Expected a new line.`,
    });

    const loc = getLOC(
      ast.raw,
      path.start,
      path.end,
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
      const index = parent.children.indexOf(path);

      parent.children.splice(
        index,
        0,
        new HTMLText({
          start: 0,
          end: 0,
          next: () => path,
          previous: path.previous,
          parent: () => parent,
          value: '\n' + correctIndent,
        }),
      );
    };

    return;
  }

  if (path.type === 'HTMLText') {
    const parent = path.parent();

    if (parent && parent.type === 'HTMLElement') {
      if (ignore.indexOf(parent.openingElement.name.name) > -1) return;

      const depth = parent.depth + 1;

      const next = path.next();
      // const previous = path.previous();

      const hasNextElement = next && next.type !== 'HTMLText';
      // const hasPreviousElement = previous && previous.type !== 'HTMLText';

      const correctIndent = new Array(depth).fill(indentStep).join('');

      const originalLines = path.value.split('\n');
      const lines = originalLines.slice();
      const lastLineIndex = lines.length - 1;
      const lastLine = lines[lastLineIndex];
      const trimmedLastLine = lastLine.trimEnd();

      const modifiers = {
        first: 0,
        last: 0,
      };

      if (trimmedLastLine !== lastLine && lastLine !== '' && trimmedLastLine !== '') {
        modifiers.last = lastLine.length - trimmedLastLine.length;
        lines.splice(lastLineIndex, 1, trimmedLastLine, '');
      }

      const firstLineEnd = lines[0];
      const trimmedFirstLineEnd = firstLineEnd.trimEnd();

      if (trimmedFirstLineEnd !== firstLineEnd && firstLineEnd !== '' && trimmedFirstLineEnd !== '') {
        modifiers.first =
          firstLineEnd.length - trimmedFirstLineEnd.length;
        lines[0] = trimmedFirstLineEnd;
      }

      const firstLine = lines[0];
      const trimmedFirstLine = firstLine.trimStart();

      if (trimmedFirstLine !== firstLine && firstLine !== '' && trimmedFirstLine !== '') {
        modifiers.first =
          modifiers.first + firstLine.length - trimmedFirstLine.length;
        lines.splice(0, 1, '', trimmedFirstLine);
      }

      lines.forEach((line, index) => {
        const spaces = line.replace(/\w+.*$/, '');
        const isLast = index === lines.length - 1;
        let closingIndent = false;

        if (index === 0) return;

        if (!hasNextElement && index === lines.length - 1) {
          closingIndent = true;
        }

        if (!isLast && line === '') return;

        const correctLocalIndent = correctIndent
          .slice(0, correctIndent.length - (closingIndent ? newline : 0));

        if (correctLocalIndent.length === spaces.length) return;

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
          message: `Expected an indent of <strong>${correctLocalIndent.length}</strong> ${type}s but instead got <strong>${spaces.length}</strong>.`,
        });

        const position = getLinePosition(
          lines,
          index,
          path.start,
          modifiers,
        );

        const loc = getLOC(
          ast.raw,
          position.start,
          position.start + (spaces.length || 1),
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
          const trimmedLine = isLast ? line.trimStart() : line.trim();

          lines[index] = correctLocalIndent + trimmedLine;
          path.value = lines.join('\n');
        };
      });
    }
  }
};

const rule = ruleHandler(defaults, handler);

module.exports = rule;

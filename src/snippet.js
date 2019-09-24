const THEME = require('../theme');
const style = require('./style');
const highlight = require('./highlight');

const SPLIT = '|';

/**
 * @param {number|string} currentIndex
 * @param {number} maxIndex
 * @return {string}
 */
function getLineNumber(currentIndex, maxIndex) {
  const length = String(maxIndex).length;
  return `         ${currentIndex} `.substr(-length - 2);
}

/**
 * @param {HTMLMarkupType} ast
 * @param {Loc} start
 * @param {Loc} end
 * @return {function[]}
 */
function snippet(ast, start, end) {
  const { raw } = ast;

  const targetStartLine = Math.max(0, start.line - 2);
  const targetEndLine = Math.max(0, end.line - 2);

  const allLines = raw.split('\n');
  const lines = allLines.slice(targetStartLine, targetEndLine + 3);
  const linesInTotal = lines.length;

  const coloredAllLines = highlight(ast);
  const coloredLines =
    coloredAllLines.slice(targetStartLine, targetEndLine + 3);

  const linesWithNumbers = lines.reduce(
    (acc, line, index) => {
      const number = index + 1;
      const currentNumber = number + targetStartLine;
      const lineNumber = getLineNumber(
        number + targetStartLine,
        linesInTotal + targetStartLine
      );
      const faulty = currentNumber >= start.line &&
        currentNumber <= end.line;

      const newAcc = acc.concat([
        style(faulty ? ' >' : '  ', THEME.snippetErrorLeftArrow),
        style(`${lineNumber}${SPLIT} `, THEME.snippetLineNumber),
        ...coloredLines[index].map((a) => a.styled),
        style('\n'),
      ]);

      if (currentNumber >= start.line &&
        currentNumber <= end.line) {
        const space = getLineNumber(' ', linesInTotal + targetStartLine);

        const errorLine = new Array(line.length).fill(' ').map((char, i) => {
          // Handles lines in between faulty start and end lines
          if (currentNumber > start.line &&
            currentNumber < end.line) {
            return '^';
          }

          // Handles single end & start line
          if (currentNumber === end.line &&
            currentNumber === start.line &&
            (i >= end.column || i < start.column)) {
            return ' ';
          }

          // Handles end line
          if (currentNumber === end.line && i < end.column) {
            return '^';
          }

          // Handles start line
          if (currentNumber === start.line && i >= start.column) {
            return '^';
          }

          return char;
        }).join('');

        if (errorLine.trim() === '') return newAcc;

        return newAcc.concat([
          style(`  ${space}${SPLIT} `, THEME.snippetLineNumber),
          style(errorLine, THEME.snippetErrorUnderArrows),
          style('\n'),
        ]);
      }

      return newAcc;
    },
    []
  );

  return linesWithNumbers;
}

module.exports = snippet;

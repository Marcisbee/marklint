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
 * @param {number} start
 * @param {number=} end
 * @return {function[]}
 */
function snippet(ast, start, end = start + 1) {
  const { raw } = ast;
  const beforeStartText = raw.substring(0, start);
  const beforeStart = beforeStartText.match(/\n/g);
  const beforeStartColumns = beforeStartText.split(/\n/g);
  const columnStartIndex = beforeStartColumns[
    beforeStartColumns.length - 1
  ].length;
  const faultyStartLine = beforeStart ? beforeStart.length : 0;
  const targetStartLine = Math.max(0, faultyStartLine - 2);

  const beforeEndText = raw.substring(0, end);
  const beforeEnd = beforeEndText.match(/\n/g);
  const beforeEndColumns = beforeEndText.split(/\n/g);
  const columnEndIndex = beforeEndColumns[beforeEndColumns.length - 1].length;
  const faultyEndLine = beforeEnd ? beforeEnd.length : 0;
  const targetEndLine = Math.max(0, faultyEndLine - 2);

  const allLines = raw.split('\n');
  const lines = allLines.slice(targetStartLine, targetEndLine + 5);
  const linesInTotal = lines.length;

  const coloredAllLines = highlight(ast);
  const coloredLines =
    coloredAllLines.slice(targetStartLine, targetEndLine + 5);

  const linesWithNumbers = lines.reduce(
    (acc, line, index) => {
      const number = index + 1;
      const currentNumber = number + targetStartLine;
      const lineNumber = getLineNumber(
        number + targetStartLine,
        linesInTotal + targetStartLine
      );
      const faulty = currentNumber >= faultyStartLine + 1 &&
        currentNumber <= faultyEndLine + 1;

      const newAcc = acc.concat([
        style(faulty ? ' >' : '  ', THEME.snippetErrorLeftArrow),
        style(`${lineNumber}${SPLIT} `, THEME.snippetLineNumber),
        ...coloredLines[index].map((a) => a.styled),
        style('\n'),
      ]);

      if (currentNumber >= faultyStartLine + 1 &&
        currentNumber <= faultyEndLine + 1) {
        const space = getLineNumber(' ', linesInTotal + targetStartLine);

        const errorLine = new Array(line.length).fill(' ').map((char, i) => {
          // Handles lines in between faulty start and end lines
          if (currentNumber > faultyStartLine + 1 &&
            currentNumber < faultyEndLine + 1) {
            return '^';
          }

          // Handles single end & start line
          if (currentNumber === faultyEndLine + 1 &&
            currentNumber === faultyStartLine + 1 &&
            (i >= columnEndIndex || i < columnStartIndex)) {
            return ' ';
          }

          // Handles end line
          if (currentNumber === faultyEndLine + 1 && i < columnEndIndex) {
            return '^';
          }

          // Handles start line
          if (currentNumber === faultyStartLine + 1 && i >= columnStartIndex) {
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

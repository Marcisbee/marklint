/**
 * @param {string} code
 * @param {number} startIndex
 * @param {number=} endIndex
 * @return {{ start: Loc, end: Loc }}
 */
function getLOC(code, startIndex, endIndex = startIndex + 1) {
  const start = {
    line: 0,
    column: 0,
    index: startIndex,
  };
  const end = {
    line: 0,
    column: 0,
    index: endIndex,
  };

  const startLines = code.substring(0, startIndex).split(/\n/g);
  start.column = startLines[startLines.length - 1].length;
  start.line = startLines.length;


  const endLines = code.substring(0, endIndex).split(/\n/g);
  end.column = endLines[endLines.length - 1].length;
  end.line = endLines.length;

  return {
    start,
    end,
  };
}

module.exports = getLOC;

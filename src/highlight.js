const THEME = require('../theme');
const style = require('./style');
const traverse = require('./traverse');
const {
  // eslint-disable-next-line no-unused-vars
  HTMLMarkup,
} = require('./tokens');

const cachedHighlights = {};

/**
 * @param {HTMLMarkup} ast
 * @return {(function[])[]}
 */
function highlight(ast) {
  const cached = cachedHighlights[ast.raw];
  if (cached !== undefined) return cached;

  const instructions = [];

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLIdentifier') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntaxTagIdentifier]
        );
      }

      if (path.type === 'HTMLAttributeIdentifier') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntaxAttributeIdentifier]
        );
      }

      if (path.type === 'HTMLLiteral') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntaxAttributeLiteral]
        );
      }
    },
  });

  let lastIndex = 0;
  return cachedHighlights[ast.raw] =
    ast.raw.split('\n').reduce((acc, data) => {
      const output = [];
      const startIndex = lastIndex;

      lastIndex += data.length + 1;

      let index = 0;
      instructions.forEach(([start, end, color]) => {
        if (startIndex <= start && lastIndex >= end) {
          const cutStart = start - startIndex;
          const cutEnd = end - startIndex;

          if (index < cutStart) {
            output.push(
              style(data.substring(index, cutStart), THEME.htmlSyntaxText)
            );
          }

          output.push(style(data.substring(cutStart, cutEnd), color));
          index = cutEnd;
        }
      });

      if (index < lastIndex) {
        output.push(style(data.substring(index), THEME.htmlSyntaxText));
      }

      if (acc.length === 0) return [output];

      return acc.concat([output]);
    }, []);
}

module.exports = highlight;

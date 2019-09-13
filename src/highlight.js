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
  if (cached !== undefined) {
    return cached;
  }

  const instructions = [];

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLIdentifier') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntax.tagIdentifier]
        );
      }

      if (path.type === 'HTMLAttributeIdentifier') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntax.attributeIdentifier]
        );
      }

      if (path.type === 'HTMLLiteral') {
        instructions.push(
          [path.start, path.end, THEME.htmlSyntax.attributeLiteral]
        );
      }
    },
  });

  let lastIndex = 0;
  return cachedHighlights[ast.raw] =
    ast.raw.split('\n').reduce((acc, line) => {
      const output = [];
      const startIndex = lastIndex;

      lastIndex += line.length + 1;

      let index = 0;
      instructions.forEach(([start, end, color]) => {
        const cutStart = start - startIndex;
        const cutEnd = end - startIndex;

        if (index < cutStart) {
          output.push(
            style(line.substring(index, cutStart), THEME.htmlSyntax.text)
          );
        }

        output.push(style(line.substring(cutStart, cutEnd), color));
        index = cutEnd;
      });

      if (index < lastIndex - startIndex) {
        output.push(style(line.substring(index), THEME.htmlSyntax.text));
      }

      if (acc.length === 0) return [output];

      return acc.concat([output]);
    }, []);
}

module.exports = highlight;

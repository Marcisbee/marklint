const THEME = require('../theme');
const style = require('./style');
const traverse = require('./traverse');

const cachedHighlights = {};

/**
 * @param {HTMLMarkupType} ast
 * @return {({ text: string, styled: function }[])[]}
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
          [path.start, path.end, 'tagIdentifier'],
        );
      }

      if (path.type === 'HTMLAttributeIdentifier') {
        instructions.push(
          [path.start, path.end, 'attributeIdentifier'],
        );
      }

      if (path.type === 'HTMLLiteral') {
        instructions.push(
          [path.start, path.end, 'attributeLiteral'],
        );
      }

      return path;
    },
  });

  let lastIndex = 0;
  return cachedHighlights[ast.raw] =
    ast.raw.split('\n').reduce((acc, line) => {
      const output = [];
      const startIndex = lastIndex;

      lastIndex += line.length + 1;

      let index = 0;
      instructions.forEach(([start, end, type]) => {
        const cutStart = start - startIndex;
        const cutEnd = end - startIndex;

        if (index < cutStart) {
          const text = line.substring(index, cutStart);
          output.push({
            start: index,
            end: cutStart,
            text,
            type: 'text',
            styled: style(text, THEME.htmlSyntax.text),
          });
          index = cutStart;
        }

        const text = line.substring(cutStart, cutEnd);
        if (text) {
          output.push({
            start,
            end,
            text,
            type,
            styled: style(text, THEME.htmlSyntax[type]),
          });
          index = cutEnd;
        }
      });

      if (index < lastIndex - startIndex) {
        const text = line.substring(index);
        output.push({
          start: index,
          end: line.length - 1,
          text,
          type: 'text 2',
          styled: style(text, THEME.htmlSyntax.text),
        });
      }

      if (acc.length === 0) return [output.filter((a) => a.text !== '')];

      return acc.concat([output.filter((a) => a.text !== '')]);
    }, []);
}

module.exports = highlight;

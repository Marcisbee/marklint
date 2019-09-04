const {
  HTMLMarkup,
  HTMLElement,
  HTMLText,
  HTMLComment,
  HTMLOpeningElement,
  HTMLIdentifier,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  HTMLLiteral,
  HTMLClosingElement,
} = require('./tokens');

const kMarkupPattern =
  /<!--([^]*?)(?=-->)-->|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern =
  /(^|\s*)([\w-@*.]+)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;

/**
 * @param {string} html
 * @return {HTMLMarkup}
 */
function build(html) {
  const ast = new HTMLMarkup({
    start: 0,
    end: html.length,
    children: [],
    sourceType: 'HTML',
  });

  /** @type {(HTMLMarkup|HTMLElement)[]} */
  const stack = [ast];
  let lastTextPos = -1;
  let match;

  while (match = kMarkupPattern.exec(html)) {
    const parent = stack[stack.length - 1];

    // Add strings to children list
    if (lastTextPos < match.index) {
      const value = html.substring(lastTextPos, match.index);
      if (value !== '') {
        parent.children.push(new HTMLText({
          start: Math.max(lastTextPos, 0),
          end: match.index,
          value: value.trim(),
          raw: value,
        }));
      }
    }

    lastTextPos = kMarkupPattern.lastIndex;

    // Add comment to children list
    if (match[0][1] == '!') {
      parent.children.push(new HTMLComment({
        start: match.index,
        end: lastTextPos,
        value: match[1].trim(),
        raw: match[0],
      }));
      continue;
    }

    const element = new HTMLElement({
      start: match.index,
      end: kMarkupPattern.lastIndex,
      openingElement: null,
      closingElement: null,
      children: [],
    });

    match[3] = match[3].toLowerCase();

    // Add Element to children list
    if (!match[2]) {
      const startIndex = html.substring(match.index).split(match[3])[0].length;
      const identifierIndex = match.index + startIndex;
      const itemStart = match.index;
      const itemEnd = kMarkupPattern.lastIndex;
      const nameStart = identifierIndex;
      const nameEnd = nameStart + match[3].length;

      element.openingElement = new HTMLOpeningElement({
        start: itemStart,
        end: itemEnd,
        attributes: [],
        name: new HTMLIdentifier({
          start: nameStart,
          end: nameEnd,
          name: match[3],
          raw: html.substring(nameStart, nameEnd),
        }),
        selfClosing: !!match[5],
      });

      const index = identifierIndex + match[3].length;

      let lastAttrPost = -1;
      for (let attMatch; attMatch = kAttributePattern.exec(match[4]);) {
        const name = attMatch[2];
        const value = attMatch[3] || attMatch[4] || attMatch[5];

        lastAttrPost = kAttributePattern.lastIndex;

        const attrIndex = index + attMatch.index;

        // Register whitespace
        if (attMatch[1]) {
          element.openingElement.attributes.push(new HTMLText({
            value: attMatch[1].trim(),
            raw: attMatch[1],
            start: attrIndex,
            end: attrIndex + attMatch[1].length,
          }));
        }

        element.openingElement.attributes.push(new HTMLAttribute({
          name: new HTMLAttributeIdentifier({
            name,
            start: attrIndex + attMatch[1].length,
            end: attrIndex + attMatch[1].length + name.length,
          }),
          value: new HTMLLiteral({
            value: value.replace(/^["']|["']$/g, '').trim(),
            raw: value,
            start: index + attMatch[0].indexOf(value),
            end: index + attMatch[0].indexOf(value) + value.length,
          }),
          start: attrIndex + attMatch[1].length,
          end: index + lastAttrPost,
          raw: attMatch[0],
        }));
      }

      if (match[4].length > lastAttrPost) {
        const value = match[4].substring(lastAttrPost);
        if (value !== '') {
          element.openingElement.attributes.push(new HTMLText({
            value: value.trim(),
            raw: value,
            start: index + lastAttrPost,
            end: index + lastAttrPost + value.length,
          }));
        }
      }

      stack.push(element);
      parent.children.push(element);
    }

    if (match[2]) {
      const startIndex = html.substring(match.index).split(match[3])[0].length;
      const identifierIndex = match.index + startIndex;
      if (parent instanceof HTMLElement) {
        parent.end = kMarkupPattern.lastIndex;
        parent.closingElement = new HTMLClosingElement({
          start: match.index,
          end: parent.end,
          name: new HTMLIdentifier({
            start: identifierIndex,
            end: identifierIndex + match[3].length,
            name: match[3],
            raw: html.substring(
              identifierIndex,
              identifierIndex + match[3].length),
          }),
        });
      }
    }

    if (match[2] || match[5]) {
      stack.pop();
    }
  }

  if (lastTextPos < html.length) {
    const value = html.substr(lastTextPos);

    ast.children.push(
      new HTMLText({
        start: Math.max(lastTextPos, 0),
        end: html.length,
        value: value.trim(),
        raw: value,
      })
    );
  }

  return ast;
}

module.exports = {
  build,
};

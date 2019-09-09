const {
  HTMLMarkup,
  HTMLElement,
  HTMLText,
  HTMLComment,
  HTMLDoctype,
  HTMLOpeningElement,
  HTMLIdentifier,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  HTMLLiteral,
  HTMLClosingElement,
} = require('./tokens');

const kMarkupPattern =
  // eslint-disable-next-line max-len
  /<!--([^]*?)(?=-->)-->|<!([^]*?)(?=>)>|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern =
  /(^|\s*)([\w-@*.]+)((?:\s*=\s*("([^"]+)"|'([^']+)'|(\S+)))*)/ig;

/**
 * @param {string} html
 * @return {HTMLMarkup}
 */
function tokenize(html) {
  const ast = new HTMLMarkup({
    start: 0,
    end: html.length,
    children: [],
    sourceType: 'HTML',
    raw: html,
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
          value: value && value.trim(),
          raw: value,
        }));
      }
    }

    lastTextPos = kMarkupPattern.lastIndex;

    // Add comment to children list
    if (match[0] && match[1] && match[0].substring(1, 3) == '!--') {
      parent.children.push(new HTMLComment({
        start: match.index,
        end: lastTextPos,
        value: match[1] && match[1].trim(),
        raw: match[0],
      }));
      continue;
    }

    // Add doctype to children list
    if (match[0][1] == '!') {
      parent.children.push(new HTMLDoctype({
        start: match.index,
        end: lastTextPos,
        value: match[2] && match[2].trim(),
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

    // Add Element to children list
    if (!match[3]) {
      const startIndex = html.substring(match.index).split(match[4])[0].length;
      const identifierIndex = match.index + startIndex;
      const itemStart = match.index;
      const itemEnd = kMarkupPattern.lastIndex;
      const nameStart = identifierIndex;
      const nameEnd = nameStart + match[4].length;

      element.openingElement = new HTMLOpeningElement({
        start: itemStart,
        end: itemEnd,
        attributes: [],
        name: new HTMLIdentifier({
          start: nameStart,
          end: nameEnd,
          name: match[4],
          raw: html.substring(nameStart, nameEnd),
        }),
        selfClosing: !!match[6],
      });

      const index = identifierIndex + match[4].length;

      let lastAttrPost = -1;
      for (let attMatch; attMatch = kAttributePattern.exec(match[5]);) {
        const name = attMatch[2];
        const rawValue = attMatch[4] || attMatch[5] || attMatch[6];
        const value = attMatch[6] || attMatch[5] || attMatch[4];

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
            value,
            raw: rawValue,
            start: attrIndex + attMatch[0].indexOf(rawValue),
            end: attrIndex + attMatch[0].indexOf(rawValue) + (
              rawValue ? rawValue.length : 0
            ),
          }),
          start: attrIndex + attMatch[1].length,
          end: index + lastAttrPost,
          raw: attMatch[0],
        }));
      }

      if (match[5].length > lastAttrPost) {
        const value = match[5].substring(lastAttrPost);
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

    if (match[3]) {
      const startIndex = html.substring(match.index).split(match[4])[0].length;
      const identifierIndex = match.index + startIndex;
      if (parent instanceof HTMLElement) {
        parent.end = kMarkupPattern.lastIndex;
        parent.closingElement = new HTMLClosingElement({
          start: match.index,
          end: parent.end,
          name: new HTMLIdentifier({
            start: identifierIndex,
            end: identifierIndex + match[4].length,
            name: match[4],
            raw: html.substring(
              identifierIndex,
              identifierIndex + match[4].length),
          }),
        });
      }
    }

    if (match[3] || match[6]) {
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

module.exports = tokenize;

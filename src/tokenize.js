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

const kMarkupPattern = /<!--([^]*?)(?=-->)-->|<!([^]*?)(?=>)>|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern = /(^|\s*)([\w-@*.]+)((?:\s*=\s*("([^"]+)"|'([^']+)'|(\S+)))*)/ig;

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
        const lastElIndex = parent.children.length;
        parent.children.push(new HTMLText({
          start: Math.max(lastTextPos, 0),
          end: match.index,
          parent: () => parent,
          previous: () => parent.children[lastElIndex - 1],
          next: () => parent.children[lastElIndex + 1],
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
        parent: () => parent,
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
        parent: () => parent,
        value: match[2] && match[2].trim(),
        raw: match[0],
      }));
      continue;
    }

    const lastElIndex = parent.children.length;
    const element = new HTMLElement({
      start: match.index,
      end: kMarkupPattern.lastIndex,
      parent: () => parent,
      previous: () => parent.children[lastElIndex - 1],
      next: () => parent.children[lastElIndex + 1],
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
        parent: () => element,
        attributes: [],
        name: new HTMLIdentifier({
          start: nameStart,
          end: nameEnd,
          parent: () => element.openingElement,
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
          const lastAttrIndex = element.openingElement.attributes.length;
          element.openingElement.attributes.push(new HTMLText({
            start: attrIndex,
            end: attrIndex + attMatch[1].length,
            parent: () => element.openingElement,
            previous:
              () => element.openingElement.attributes[lastAttrIndex - 1],
            next: () => element.openingElement.attributes[lastAttrIndex + 1],
            value: attMatch[1].trim(),
            raw: attMatch[1],
          }));
        }

        const lastAttrIndex = element.openingElement.attributes.length;
        const attribute = new HTMLAttribute({
          start: attrIndex + attMatch[1].length,
          end: index + lastAttrPost,
          parent: () => element.openingElement,
          previous: () => element.openingElement.attributes[lastAttrIndex - 1],
          next: () => element.openingElement.attributes[lastAttrIndex + 1],
          name: new HTMLAttributeIdentifier({
            name,
            start: attrIndex + attMatch[1].length,
            end: attrIndex + attMatch[1].length + name.length,
            parent: () => attribute,
          }),
          value: new HTMLLiteral({
            value,
            raw: rawValue,
            start: attrIndex + attMatch[0].indexOf(rawValue),
            end: attrIndex + attMatch[0].indexOf(rawValue) + (
              rawValue ? rawValue.length : 0
            ),
            parent: () => attribute,
          }),
          raw: attMatch[0],
        });

        element.openingElement.attributes.push(attribute);
      }

      if (match[5].length > lastAttrPost) {
        const value = match[5].substring(lastAttrPost);
        if (value !== '') {
          const lastAttrIndex = element.openingElement.attributes.length;
          element.openingElement.attributes.push(new HTMLText({
            start: index + lastAttrPost,
            end: index + lastAttrPost + value.length,
            parent: () => element.openingElement,
            previous:
              () => element.openingElement.attributes[lastAttrIndex - 1],
            next: () => element.openingElement.attributes[lastAttrIndex + 1],
            value: value.trim(),
            raw: value,
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
          parent: () => parent,
          name: new HTMLIdentifier({
            start: identifierIndex,
            end: identifierIndex + match[4].length,
            parent: () => parent.closingElement,
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
    const value = html.substring(Math.max(lastTextPos, 0));

    const lastElIndex = ast.children.length;
    ast.children.push(
      new HTMLText({
        start: Math.max(lastTextPos, 0),
        end: html.length,
        parent: () => ast,
        previous: () => ast.children[lastElIndex - 1],
        next: () => ast.children[lastElIndex + 1],
        value: value.trim(),
        raw: value,
      })
    );
  }

  return ast;
}

module.exports = tokenize;

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
} = require('./types');

/**
 * @TODO:
 * - Handle CDATA
 */
const kMarkupPattern = /<!--([^]*?)(?=-->)-->|<!([^]*?)(?=>)>|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern = /(^|\s*)([\w-@:*.\[\]\(\)\#%]+)((?:\s*=\s*("([^"]+)"|'([^']+)'|(\S+)))*)/ig;

const VOID_ELEMENTS = [
  'br',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'area',
  'base',
  'col',
  'command',
  'embed',
  'keygen',
  'param',
  'source',
  'track',
  'wbr',
];

/**
 * @param {string} name
 * @return {boolean}
 */
function isVoidElement(name) {
  return VOID_ELEMENTS.indexOf(name.toLocaleLowerCase()) > -1;
}

const BLOCK_ELEMENTS = [];

/**
 * @param {string} name
 * @return {boolean}
 */
function isBlockElement(name) {
  return BLOCK_ELEMENTS.indexOf(name.toLocaleLowerCase()) > -1;
}

const FLOW_ELEMENTS = {
  td: ['th', 'td'],
  th: ['th', 'td'],
  thead: ['thead', 'tbody', 'tfoot'],
  tbody: ['thead', 'tbody', 'tfoot'],
  tfoot: ['thead', 'tbody', 'tfoot'],
  li: ['li'],
  p: [
    'address',
    'article',
    'aside',
    'blockquote',
    'details',
    'dialog',
    'dd',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'li',
    'main',
    'nav',
    'ol',
    'pre',
    'section',
    'table',
    'ul',
  ],
};

/**
 * @param {string} name
 * @return {boolean}
 */
function isFlowElement(name) {
  return !!FLOW_ELEMENTS[name.toLocaleLowerCase()];
}

/**
 * @param {string} startName
 * @param {string} endName
 * @return {boolean}
 */
function canOmitEndTag(startName, endName) {
  const startNameNormal = startName.toLocaleLowerCase();
  const endNameNormal = endName.toLocaleLowerCase();
  const parts = FLOW_ELEMENTS[startNameNormal];

  if (!parts) {
    return false;
  }

  return parts.indexOf(endNameNormal) > -1;
}

const NO_PARSE_ELEMENTS = [
  'style',
  'script',
];

/**
 * @param {string} name
 * @return {boolean}
 */
function isNonParseElement(name) {
  return NO_PARSE_ELEMENTS.indexOf(name.toLocaleLowerCase()) > -1;
}

/**
 * @param {string} html
 * @return {HTMLMarkupType}
 */
function parse(html) {
  const ast = new HTMLMarkup({
    start: 0,
    end: html.length,
    children: [],
    sourceType: 'HTML',
    raw: html,
  });

  /** @type {(HTMLMarkupType | HTMLElementType)[]} */
  const stack = [ast];
  let lastTextPos = -1;
  let match;

  while (match = kMarkupPattern.exec(html)) {
    let parent = stack[stack.length - 1];

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

    if ((!match[3] || !isNonParseElement(match[4])) && parent.type === 'HTMLElement' && isNonParseElement(parent.openingElement.name.name)) {
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
      continue;
    }

    // Add comment to children list
    if (match[0] && match[1] && match[0].substring(1, 3) == '!--') {
      const lastElIndex = parent.children.length;
      parent.children.push(new HTMLComment({
        start: match.index,
        end: lastTextPos,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
        value: match[1] && match[1].trim(),
        raw: match[0],
      }));
      continue;
    }

    // Add doctype to children list
    if (match[0][1] == '!') {
      const lastElIndex = parent.children.length;
      parent.children.push(new HTMLDoctype({
        start: match.index,
        end: lastTextPos,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
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
      if (
        parent && parent.type === 'HTMLElement' && (
          isBlockElement(match[4]) ||
          canOmitEndTag(parent.openingElement.name.name, match[4])
        )
      ) {
        if (stack.length > 1) {
          stack.pop();
          parent = stack[stack.length - 1];
        }
      }

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
        voidElement: isVoidElement(match[4]),
        blockElement: isBlockElement(match[4]),
        flowElement: isFlowElement(match[4]),
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

      if (!isVoidElement(match[4])) {
        stack.push(element);
      }

      parent.children.push(element);
    }

    if (match[3]) {
      if (parent && parent.type === 'HTMLElement' && parent.openingElement.name.name.toLocaleLowerCase() !== match[4].toLocaleLowerCase() && (
        isBlockElement(parent.openingElement.name.name) ||
        isFlowElement(parent.openingElement.name.name)
      )) {
        if (stack.length > 1) {
          stack.pop();
          parent = stack[stack.length - 1];
        }
      }

      // @TODO: Handle cases where closing tag goes outside HTMLMarkup class
      // "<foo></foo></bar>"
      if (parent.type === 'HTMLElement') {
        const startIndex = html
          .substring(match.index)
          .split(match[4])[0]
          .length;
        const identifierIndex = match.index + startIndex;
        if (parent.type === 'HTMLElement') {
          const localParent = parent;

          parent.end = kMarkupPattern.lastIndex;
          parent.closingElement = new HTMLClosingElement({
            start: match.index,
            end: parent.end,
            parent: () => localParent,
            name: new HTMLIdentifier({
              start: identifierIndex,
              end: identifierIndex + match[4].length,
              parent: () => localParent.closingElement,
              name: match[4],
              raw: html.substring(
                identifierIndex,
                identifierIndex + match[4].length),
            }),
          });
        }
      }
    }

    if ((match[3] || match[6]) && VOID_ELEMENTS.indexOf(match[4]) === -1) {
      if (stack.length > 1) {
        stack.pop();
      }
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

module.exports = parse;

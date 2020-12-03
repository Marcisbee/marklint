const {
  HTMLMarkup,
  HTMLElement,
  HTMLText,
  HTMLComment,
  HTMLDoctype,
  HTMLCData,
  HTMLOpeningElement,
  HTMLIdentifier,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  HTMLLiteral,
  HTMLClosingElement,
} = require('../types');
const walker = require('./walker');

const OPENING_TAG = /^\<([a-zA-Z0-9\_\-\.]+)([\s\S]*)\>$/;
const CLOSING_TAG = /^\<\/([a-zA-Z0-9\_\-\.]+)\>$/;
const COMMENT = /^\<\!--([\s\S]*)--\>$/;
const DOCTYPE = /^\<\!DOCTYPE([\s\S]*)\>$/;
const CDATA = /^\<\!\[CDATA\[([\s\S]*)\]\]\>$/;

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

/**
 * @param {string} startName
 * @param {string} endName
 * @param {HTMLElement} element
 * @return {boolean}
 */
function canCloseFlow(startName, endName, element) {
  if (!isFlowElement(startName)) {
    return false;
  }

  const parent = element.parent();

  if (parent.type !== 'HTMLElement') {
    return false;
  }

  if (parent.openingElement.name.name !== endName) {
    return false;
  }

  return true;
}

const ATTRIBUTES = /(^|\s*)([\w-@:*.\[\]\(\)\#\$%]+)((?:\s*=\s*("[^"]+[^\\]"|'[^']+'|\S+))*)/g;

/**
 * @param {string} attributes
 * @param {number} start
 * @param {HTMLOpeningElement} parent
 * @return {(HTMLAttribute|HTMLText)[]}
 */
function parseAttributes(attributes, start, parent) {
  const output = [];

  let lastAttrPost = -1;
  for (let attMatch; attMatch = ATTRIBUTES.exec(attributes);) {
    const whitespace = attMatch[1];
    const name = attMatch[2];
    const value = attMatch[4];

    lastAttrPost = ATTRIBUTES.lastIndex;

    const attrIndex = start + attMatch.index;

    if (whitespace) {
      const lastAttrIndex = output.length;
      output.push(new HTMLText({
        start: attrIndex,
        end: attrIndex + whitespace.length,
        parent: () => parent,
        previous:
          () => output[lastAttrIndex - 1],
        next: () => output[lastAttrIndex + 1],
        value: whitespace,
      }));
    }

    const lastAttrIndex = output.length;
    const attribute = new HTMLAttribute({
      start: attrIndex + whitespace.length,
      end: start + lastAttrPost,
      parent: () => parent,
      previous: () => output[lastAttrIndex - 1],
      next: () => output[lastAttrIndex + 1],
      name: new HTMLAttributeIdentifier({
        name,
        start: attrIndex + whitespace.length,
        end: attrIndex + whitespace.length + name.length,
        parent: () => attribute,
      }),
      value: new HTMLLiteral({
        value,
        start: attrIndex + attMatch[0].indexOf(value),
        end: attrIndex + attMatch[0].indexOf(value) + (
          value ? value.length : 0
        ),
        parent: () => attribute,
      }),
    });

    output.push(attribute);
  }

  if (attributes.length > lastAttrPost) {
    const value = attributes.substring(lastAttrPost);
    if (value !== '') {
      const lastAttrIndex = output.length;
      output.push(new HTMLText({
        start: start + lastAttrPost,
        end: start + lastAttrPost + value.length,
        parent: () => parent,
        previous:
          () => output[lastAttrIndex - 1],
        next: () => output[lastAttrIndex + 1],
        value: value,
      }));
    }
  }

  // Ensure every attribute is has empty text in between
  return output.reduce((acc, attr, index) => {
    const isLastAttr = output.length === index + 1;
    const last = acc[acc.length - 1];

    const addition = [attr];

    if (attr instanceof HTMLAttribute && !(last instanceof HTMLText)) {
      addition.unshift(
        new HTMLText({
          start: attr.start,
          end: attr.start,
          parent: () => parent,
          previous:
            () => output[index - 2],
          next: () => output[index],
          value: '',
        }),
      );
    }

    if (isLastAttr &&
      !(last instanceof HTMLText) &&
      !(attr instanceof HTMLText)) {
      addition.push(
        new HTMLText({
          start: attr.end,
          end: attr.end,
          parent: () => parent,
          previous:
            () => output[index - 2],
          next: () => output[index],
          value: '',
        }),
      );
    }

    return acc.concat(addition);
  }, []);
}

/**
 * @param {string} html
 * @return {HTMLMarkupType}
 */
function parser(html) {
  const tokens = walker(html);
  const ast = new HTMLMarkup({
    start: 0,
    end: html.length,
    children: [],
    sourceType: 'HTML',
    raw: html,
  });

  /** @type {(HTMLMarkupType | HTMLElementType)[]} */
  const stack = [ast];

  let depth = 0;

  tokens.forEach((token) => {
    let parent = stack[stack.length - 1];

    if (token.type === 'string') {
      const value = token.data;
      if (value !== '') {
        const lastElIndex = parent.children.length;
        parent.children.push(new HTMLText({
          start: token.start,
          end: token.end,
          parent: () => parent,
          previous: () => parent.children[lastElIndex - 1],
          next: () => parent.children[lastElIndex + 1],
          value: value && value,
        }));
      }
      return;
    }

    const comment = token.data.match(COMMENT);
    if (comment) {
      const [value] = comment.slice(1);
      const lastElIndex = parent.children.length;
      parent.children.push(new HTMLComment({
        start: token.start,
        end: token.end,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
        value,
      }));
      return;
    }

    const doctype = token.data.match(DOCTYPE);
    if (doctype) {
      const [value] = doctype.slice(1);
      const lastElIndex = parent.children.length;
      parent.children.push(new HTMLDoctype({
        start: token.start,
        end: token.end,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
        value,
      }));
      return;
    }

    const cdata = token.data.match(CDATA);
    if (cdata) {
      const [value] = cdata.slice(1);
      const lastElIndex = parent.children.length;
      parent.children.push(new HTMLCData({
        start: token.start,
        end: token.end,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
        value,
      }));
      return;
    }

    const openingTag = token.data.match(OPENING_TAG);
    if (openingTag) {
      const [tagName, attributesBlock] = openingTag.slice(1);
      const attributes = attributesBlock.replace(/\/$/, '');
      const selfClosing = attributesBlock.substr(-1) === '/';

      if (
        parent && parent.type === 'HTMLElement' && (
          isBlockElement(tagName) ||
          canOmitEndTag(parent.openingElement.name.name, tagName)
        )
      ) {
        if (stack.length > 1) {
          stack.pop();
          parent = stack[stack.length - 1];
        }
      }

      const lastElIndex = parent.children.length;
      const element = new HTMLElement({
        start: token.start,
        end: token.end,
        parent: () => parent,
        previous: () => parent.children[lastElIndex - 1],
        next: () => parent.children[lastElIndex + 1],
        depth,
        openingElement: null,
        closingElement: null,
        children: [],
      });

      element.openingElement = new HTMLOpeningElement({
        start: token.start,
        end: token.end,
        parent: () => element,
        attributes: [],
        name: new HTMLIdentifier({
          start: token.start + 1,
          end: token.start + 1 + tagName.length,
          parent: () => element.openingElement,
          name: tagName,
        }),
        raw: token.data,
        selfClosing,
        voidElement: isVoidElement(tagName),
        blockElement: isBlockElement(tagName),
        flowElement: isFlowElement(tagName),
      });

      element.openingElement.attributes = parseAttributes(
        attributes,
        token.start + 1 + tagName.length,
        element.openingElement,
      );

      if (!isVoidElement(tagName)) {
        stack.push(element);
        depth += 1;
      }

      parent.children.push(element);

      if (selfClosing && VOID_ELEMENTS.indexOf(tagName) === -1) {
        if (stack.length > 1) {
          stack.pop();
        }
      }

      return;
    }

    const closingTag = token.data.match(CLOSING_TAG);
    if (closingTag) {
      const [tagName] = closingTag.slice(1);

      if (parent && parent.type === 'HTMLElement' && parent.openingElement.name.name.toLocaleLowerCase() !== tagName.toLocaleLowerCase() && (
        isBlockElement(parent.openingElement.name.name) ||
        canCloseFlow(parent.openingElement.name.name, tagName, parent)
      )) {
        if (stack.length > 1) {
          stack.pop();
          depth -= 1;
          parent = stack[stack.length - 1];
        }
      }

      if (parent.type === 'HTMLElement') {
        const localParent = parent;

        parent.end = token.end;
        parent.closingElement = new HTMLClosingElement({
          start: token.start,
          end: token.end,
          parent: () => localParent,
          name: new HTMLIdentifier({
            start: token.start + 2,
            end: token.start + 2 + tagName.length,
            parent: () => localParent.closingElement,
            name: tagName,
          }),
          raw: token.data,
        });

        stack.pop();
        depth -= 1;

        return;
      }
    }

    const lastElIndex = parent.children.length;
    parent.children.push(new HTMLText({
      start: token.start,
      end: token.end,
      parent: () => parent,
      previous: () => parent.children[lastElIndex - 1],
      next: () => parent.children[lastElIndex + 1],
      value: token.data,
    }));
  });

  return ast;
}

module.exports = parser;

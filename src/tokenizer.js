const kMarkupPattern =
  /<!--([^]*?)(?=-->)-->|<(\/?)([a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern =
  /(^|\s*)([\w-@*.]+)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;

// eslint-disable-next-line require-jsdoc
class HTMLToken {
  /**
   * @param {{ start: number, end: number }} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
  }
}

/**
 * @typedef HTMLMarkupInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {(HTMLElement|HTMLComment|HTMLText)[]} children
 * @property {string} sourceType
 */
// eslint-disable-next-line require-jsdoc
class HTMLMarkup extends HTMLToken {
  /**
   * @param {HTMLMarkupInput} data
   */
  constructor(data) {
    super(data);
    this.children = data.children;
    this.sourceType = data.sourceType;
  }
}

/**
 * @typedef HTMLElementInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {(HTMLElement|HTMLComment|HTMLText)[]} children
 * @property {HTMLOpeningElement} openingElement
 * @property {HTMLClosingElement} closingElement
 */
// eslint-disable-next-line require-jsdoc
class HTMLElement extends HTMLToken {
  /**
   * @param {HTMLElementInput} data
   */
  constructor(data) {
    super(data);
    this.children = data.children;
    this.openingElement = data.openingElement;
    this.closingElement = data.closingElement;
  }
}

/**
 * @typedef HTMLOpeningElementInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {HTMLIdentifier} name
 * @property {(HTMLAttribute|HTMLText)[]} attributes
 * @property {boolean} selfClosing
 */
// eslint-disable-next-line require-jsdoc
class HTMLOpeningElement extends HTMLToken {
  /**
   * @param {HTMLOpeningElementInput} data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.attributes = data.attributes;
    this.selfClosing = data.selfClosing;
  }
}

/**
 * @typedef HTMLClosingElementInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {HTMLIdentifier} name
 */
// eslint-disable-next-line require-jsdoc
class HTMLClosingElement extends HTMLToken {
  /**
   * @param {HTMLClosingElementInput} data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
  }
}

/**
 * @typedef HTMLIdentifierInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} name
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLIdentifier extends HTMLToken {
  /**
   * @param {HTMLIdentifierInput} data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.raw = data.raw;
  }
}

/**
 * @typedef HTMLAttributeInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {HTMLAttributeIdentifier} name
 * @property {HTMLLiteral} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLAttribute extends HTMLToken {
  /**
   * @param {HTMLAttributeInput} data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
    this.value = data.value;
    this.raw = data.raw;
  }
}

/**
 * @typedef HTMLAttributeIdentifierInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} name
 */
// eslint-disable-next-line require-jsdoc
class HTMLAttributeIdentifier extends HTMLToken {
  /**
   * @param {HTMLAttributeIdentifierInput} data
   */
  constructor(data) {
    super(data);
    this.name = data.name;
  }
}

/**
 * @typedef HTMLLiteralInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLLiteral extends HTMLToken {
  /**
   * @param {HTMLLiteralInput} data
   */
  constructor(data) {
    super(data);
    this.value = data.value;
    this.raw = data.raw;
  }
}

/**
 * @typedef HTMLCommentInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLComment extends HTMLToken {
  /**
   * @param {HTMLCommentInput} data
   */
  constructor(data) {
    super(data);
    this.value = data.value;
    this.raw = data.raw;
  }
}

/**
 * @typedef HTMLTextInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLText extends HTMLToken {
  /**
   * @param {HTMLTextInput} data
   */
  constructor(data) {
    super(data);
    this.value = data.value;
    this.raw = data.raw;
  }
}

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
      const identifierIndex =
        match.index + (html.substring(match.index).split(match[3])[0].length);
      element.openingElement = new HTMLOpeningElement({
        start: match.index,
        end: kMarkupPattern.lastIndex,
        attributes: [],
        name: new HTMLIdentifier({
          start: identifierIndex,
          end: identifierIndex + match[3].length,
          name: match[3],
          raw: html.substring(
            identifierIndex,
            identifierIndex + match[3].length),
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
      const identifierIndex =
        match.index + (html.substring(match.index).split(match[3])[0].length);
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
    ast.children.push(new HTMLText({
      start: Math.max(lastTextPos, 0),
      end: html.length,
      value: value.trim(),
      raw: value,
    }));
  }

  return ast;
}

module.exports = {
  build,

  HTMLToken,
  HTMLMarkup,
  HTMLElement,
  HTMLOpeningElement,
  HTMLClosingElement,
  HTMLIdentifier,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  HTMLLiteral,
  HTMLComment,
  HTMLText,
};

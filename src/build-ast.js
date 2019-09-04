const kMarkupPattern =
  /<!--([^]*?)(?=-->)-->|<(\/?)(\S*[a-z][-.0-9_a-z]*)([^>]*?)(\/?)>/ig;
const kAttributePattern =
  /(^|\s*)(\w+)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;

/**
 * @typedef MarkupInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {(HTMLElement|HTMLComment|HTMLText)[]} children
 * @property {string} sourceType
 */
// eslint-disable-next-line require-jsdoc
class Markup {
  /**
   * @param {MarkupInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLElement {
  /**
   * @param {HTMLElementInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLOpeningElement {
  /**
   * @param {HTMLOpeningElementInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLClosingElement {
  /**
   * @param {HTMLClosingElementInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLIdentifier {
  /**
   * @param {HTMLIdentifierInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
 * @property {Literal} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class HTMLAttribute {
  /**
   * @param {HTMLAttributeInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLAttributeIdentifier {
  /**
   * @param {HTMLAttributeIdentifierInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
    this.name = data.name;
  }
}

/**
 * @typedef LiteralInput
 * @type {object}
 * @property {number} start
 * @property {number} end
 * @property {string} value
 * @property {string} raw
 */
// eslint-disable-next-line require-jsdoc
class Literal {
  /**
   * @param {LiteralInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLComment {
  /**
   * @param {HTMLCommentInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
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
class HTMLText {
  /**
   * @param {HTMLTextInput} data
   */
  constructor(data) {
    this.type = this.constructor.name;
    this.start = data.start;
    this.end = data.end;
    this.value = data.value;
    this.raw = data.raw;
  }
}

/**
 * @param {string} html
 * @return {Markup}
 */
function build(html) {
  const ast = new Markup({
    start: 0,
    end: html.length,
    children: [],
    sourceType: 'HTML',
  });

  /** @type {(Markup|HTMLElement)[]} */
  const stack = [ast];
  let lastTextPos = -1;
  let match;

  while (match = kMarkupPattern.exec(html)) {
    // const slice = html.substring(lastTextPos, kMarkupPattern.lastIndex);
    // console.log({ lastTextPos, slice,
    // sliceLength: slice.length + lastTextPos,
    // lastIndex: kMarkupPattern.lastIndex, matchIndex: match.index});
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

        // Register whitespace
        if (attMatch[1]) {
          element.openingElement.attributes.push(new HTMLText({
            value: attMatch[1].trim(),
            raw: attMatch[1],
            start: index + attMatch.index,
            end: index + attMatch.index + attMatch[1].length,
          }));
        }

        element.openingElement.attributes.push(new HTMLAttribute({
          name: new HTMLAttributeIdentifier({
            name,
            start: index + attMatch.index,
            end: index + attMatch.index + name.length,
          }),
          value: new Literal({
            value: value.replace(/^["']|["']$/g, '').trim(),
            raw: value,
            start: index + attMatch[0].indexOf(value),
            end: index + attMatch[0].indexOf(value) + value.length,
          }),
          start: index + attMatch.index,
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
        parent.closingElement = new HTMLClosingElement({
          start: match.index,
          end: kMarkupPattern.lastIndex,
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

  Markup,
  HTMLElement,
  HTMLOpeningElement,
  HTMLClosingElement,
  HTMLIdentifier,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  Literal,
  HTMLComment,
  HTMLText,
};


// const sample1 = `<!-- Or you can
// comment out a large
// number of lines. -->
// <meta /><a href="123">
//   <span>inner link</span>
// </a>
// dsa
// <br/>
// <a>
//  123
// </a>
// asd
// `;

// const sample2 = `
//   <a
//     href="#"
//     class="first"
//   >
//     google.com
//   </a>
// `;

// // parse(sample1);
// parse(sample2);

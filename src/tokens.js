/* eslint-disable require-jsdoc */

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

module.exports = {
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

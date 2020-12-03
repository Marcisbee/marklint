// eslint-disable-next-line require-jsdoc
class HTMLToken {}

/** @type {HTMLMarkupType} */
class HTMLMarkup extends HTMLToken {
  /** @param {HTMLMarkupInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLMarkup';
    this.start = data.start;
    this.end = data.end;

    this.sourceType = data.sourceType;
    this.children = data.children;
    this.raw = data.raw;
  }
}

/** @type {HTMLElementType} */
class HTMLElement extends HTMLToken {
  /** @param {HTMLElementInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLElement';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.depth = data.depth;
    this.openingElement = data.openingElement;
    this.children = data.children;
    this.closingElement = data.closingElement;
  }
}

/** @type {HTMLOpeningElementType} */
class HTMLOpeningElement extends HTMLToken {
  /** @param {HTMLOpeningElementInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLOpeningElement';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.raw = data.raw;

    this.name = data.name;
    this.attributes = data.attributes;
    this.selfClosing = data.selfClosing;
    this.voidElement = data.voidElement;
    this.blockElement = data.blockElement;
    this.flowElement = data.flowElement;
  }
}

/** @type {HTMLClosingElementType} */
class HTMLClosingElement extends HTMLToken {
  /** @param {HTMLClosingElementInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLClosingElement';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.raw = data.raw;

    this.name = data.name;
  }
}

/** @type {HTMLIdentifierType} */
class HTMLIdentifier extends HTMLToken {
  /** @param {HTMLIdentifierInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLIdentifier';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;

    this.name = data.name;
  }
}

/** @type {HTMLAttributeType} */
class HTMLAttribute extends HTMLToken {
  /** @param {HTMLAttributeInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLAttribute';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.name = data.name;
    this.value = data.value;
  }
}

/** @type {HTMLAttributeIdentifierType} */
class HTMLAttributeIdentifier extends HTMLToken {
  /** @param {HTMLAttributeIdentifierInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLAttributeIdentifier';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;

    this.name = data.name;
  }
}

/** @type {HTMLLiteralType} */
class HTMLLiteral extends HTMLToken {
  /** @param {HTMLLiteralInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLLiteral';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;

    this.value = data.value;
  }
}

/** @type {HTMLDoctypeType} */
class HTMLDoctype extends HTMLToken {
  /** @param {HTMLDoctypeInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLDoctype';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.value = data.value;
  }
}

/** @type {HTMLCDataType} */
class HTMLCData extends HTMLToken {
  /** @param {HTMLCDataInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLCData';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.value = data.value;
  }
}

/** @type {HTMLCommentType} */
class HTMLComment extends HTMLToken {
  /** @param {HTMLCommentInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLComment';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.value = data.value;
  }
}

/** @type {HTMLTextType} */
class HTMLText extends HTMLToken {
  /** @param {HTMLTextInput} data */
  constructor(data) {
    super();

    this.type = 'HTMLText';
    this.start = data.start;
    this.end = data.end;
    this.parent = data.parent;
    this.previous = data.previous;
    this.next = data.next;

    this.value = data.value;
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
  HTMLDoctype,
  HTMLCData,
  HTMLText,
};

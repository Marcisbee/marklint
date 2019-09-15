interface RuleConfig {
  severity: 'error' | 'warning';
  options: *;
}

type RuleHandler = (ast: HTMLMarkupType, path: AnyHTMLType, config: RuleConfig) => HTMLMarkupType;



// Tokens

type AnyHTMLType = HTMLMarkupType
  | HTMLElementType
  | HTMLOpeningElementType
  | HTMLClosingElementType
  | HTMLIdentifierType
  | HTMLAttributeType
  | HTMLAttributeIdentifierType
  | HTMLLiteralType
  | HTMLDoctypeType
  | HTMLCommentType
  | HTMLTextType;

// HTMLMarkup

interface HTMLMarkupInput {
  start: number;
  end: number;
  children: (HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType)[];
  sourceType: 'HTML' | 'VUE' | 'ANGULAR';
  raw: string;
}

interface HTMLMarkupType extends HTMLMarkupInput {
  type: string;
}

// HTMLElement

interface HTMLElementInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  children: (HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType)[];
  openingElement: HTMLOpeningElementType;
  closingElement: HTMLClosingElementType;
}

interface HTMLElementType extends HTMLElementInput {
  type: string;
}

// HTMLOpeningElement

interface HTMLOpeningElementInput {
  start: number;
  end: number;
  parent: () => HTMLElementType;
  name: HTMLIdentifierType;
  attributes: (HTMLAttributeType | HTMLTextType)[];
  selfClosing: boolean;
}

interface HTMLOpeningElementType extends HTMLOpeningElementInput {
  type: string;
}

// HTMLClosingElement

interface HTMLClosingElementInput {
  start: number;
  end: number;
  parent: () => HTMLElementType;
  name: HTMLIdentifierType;
}

interface HTMLClosingElementType extends HTMLClosingElementInput {
  type: string;
}

// HTMLIdentifier

interface HTMLIdentifierInput {
  start: number;
  end: number;
  parent: () => HTMLOpeningElementType | HTMLClosingElementType;
  name: string;
  raw: string;
}

interface HTMLIdentifierType extends HTMLIdentifierInput {
  type: string;
}

// HTMLAttribute

interface HTMLAttributeInput {
  start: number;
  end: number;
  parent: () => HTMLOpeningElementType;
  previous: () => HTMLAttributeType | HTMLTextType;
  next: () => HTMLAttributeType | HTMLTextType;
  name: HTMLAttributeIdentifierType;
  value: HTMLLiteralType;
  raw: string;
}

interface HTMLAttributeType extends HTMLAttributeInput {
  type: string;
}

// HTMLAttributeIdentifier

interface HTMLAttributeIdentifierInput {
  start: number;
  end: number;
  parent: () => HTMLAttributeType;
  name: string;
}

interface HTMLAttributeIdentifierType extends HTMLAttributeIdentifierInput {
  type: string;
}

// HTMLLiteral

interface HTMLLiteralInput {
  start: number;
  end: number;
  parent: () => HTMLAttributeType;
  value: string;
  raw: string;
}

interface HTMLLiteralType extends HTMLLiteralInput {
  type: string;
}

// HTMLDoctype

interface HTMLDoctypeInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  value: string;
  raw: string;
}

interface HTMLDoctypeType extends HTMLDoctypeInput {
  type: string;
}

// HTMLComment

interface HTMLCommentInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType;
  value: string;
  raw: string;
}

interface HTMLCommentType extends HTMLCommentInput {
  type: string;
}

// HTMLText

interface HTMLTextInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType | HTMLAttributeType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType | HTMLAttributeType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLTextType | HTMLCommentType | HTMLAttributeType;
  value: string;
  raw: string;
}

interface HTMLTextType extends HTMLTextInput {
  type: string;
}

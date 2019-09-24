interface RuleConfig {
  severity: 'error' | 'warning' | 'off';
  options: any;
}

type RuleHandler = (diagnostics: any, ast: HTMLMarkupType, path: AnyHTMLType, config: RuleConfig) => HTMLMarkupType;

type AnyReportType = ReportLogType | ReportSnippetType | ReportInspectType | ReportDiagnosticsType;

interface ReportLogType {
  type: 'log';
  severity: 'error' | 'warning' | 'info' | 'success' | 'default';
  message: string;
}

interface ReportSnippetType {
  type: 'snippet';
  snippet: {
    ast: any;
    start: Loc;
    end: Loc;
  };
}

interface ReportInspectType {
  type: 'inspect';
  data: any;
}

interface ReportDiagnosticsType {
  type: 'diagnostics';
  diagnostics: Diagnostics[];
}

interface Loc {
  line: number;
  column: number;
  index: number;
}

type DiagnosticsTypes = 'all' | 'parser' | 'traverse';

interface DiagnosticsReport {
  details: AnyReportType[];
  advice: AnyReportType[];
  fixable: boolean;
}

interface DiagnosticsTimes {
  start: number;
  end: number;
}

interface Diagnostics {
  filePath: string;
  error: DiagnosticsReport[];
  warning: DiagnosticsReport[];
  time: Record<DiagnosticsTypes, DiagnosticsTimes>;
}


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
  | HTMLCDataType
  | HTMLCommentType
  | HTMLTextType;

// HTMLMarkup

interface HTMLMarkupInput {
  start: number;
  end: number;
  children: (HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType)[];
  sourceType: 'HTML' | 'VUE' | 'ANGULAR';
  raw: string;
}

interface HTMLMarkupType extends HTMLMarkupInput {
  type: 'HTMLMarkup';
}

// HTMLElement

interface HTMLElementInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  children: (HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType)[];
  openingElement: HTMLOpeningElementType;
  closingElement: HTMLClosingElementType;
}

interface HTMLElementType extends HTMLElementInput {
  type: 'HTMLElement';
}

// HTMLOpeningElement

interface HTMLOpeningElementInput {
  start: number;
  end: number;
  parent: () => HTMLElementType;
  name: HTMLIdentifierType;
  attributes: (HTMLAttributeType | HTMLTextType)[];
  selfClosing: boolean;
  voidElement: boolean;
  blockElement: boolean;
  flowElement: boolean;
}

interface HTMLOpeningElementType extends HTMLOpeningElementInput {
  type: 'HTMLOpeningElement';
}

// HTMLClosingElement

interface HTMLClosingElementInput {
  start: number;
  end: number;
  parent: () => HTMLElementType;
  name: HTMLIdentifierType;
}

interface HTMLClosingElementType extends HTMLClosingElementInput {
  type: 'HTMLClosingElement';
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
  type: 'HTMLIdentifier';
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
  type: 'HTMLAttribute';
}

// HTMLAttributeIdentifier

interface HTMLAttributeIdentifierInput {
  start: number;
  end: number;
  parent: () => HTMLAttributeType;
  name: string;
}

interface HTMLAttributeIdentifierType extends HTMLAttributeIdentifierInput {
  type: 'HTMLAttributeIdentifier';
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
  type: 'HTMLLiteral';
}

// HTMLDoctype

interface HTMLDoctypeInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  value: string;
  raw: string;
}

interface HTMLDoctypeType extends HTMLDoctypeInput {
  type: 'HTMLDoctype';
}

// HTMLCData

interface HTMLCDataInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  value: string;
  raw: string;
}

interface HTMLCDataType extends HTMLCDataInput {
  type: 'HTMLCData';
}

// HTMLComment

interface HTMLCommentInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType;
  value: string;
  raw: string;
}

interface HTMLCommentType extends HTMLCommentInput {
  type: 'HTMLComment';
}

// HTMLText

interface HTMLTextInput {
  start: number;
  end: number;
  parent: () => HTMLMarkupType | HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType | HTMLOpeningElementType;
  previous: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType | HTMLAttributeType;
  next: () => HTMLElementType | HTMLDoctypeType | HTMLCDataType | HTMLTextType | HTMLCommentType | HTMLAttributeType;
  value: string;
  raw: string;
}

interface HTMLTextType extends HTMLTextInput {
  type: 'HTMLText';
}

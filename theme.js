const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};


module.exports = {
  bold: [colors.bold],
  error: [colors.fg.red],
  boldError: [colors.bold, colors.fg.red],

  fileName: [colors.bold, colors.underscore],

  htmlSyntaxText: [colors.dim],
  htmlSyntaxTagIdentifier: [colors.fg.cyan],
  htmlSyntaxAttributeIdentifier: [colors.fg.yellow],
  htmlSyntaxAttributeLiteral: [colors.fg.green],

  errorPrefix: [colors.bold, colors.fg.red],
  errorText: [colors.fg.red],
  errorVariable: [colors.bold, colors.fg.red],

  warningPrefix: [colors.bold, colors.fg.yellow],
  warningText: [colors.fg.yellow],
  warningVariable: [colors.bold, colors.fg.yellow],

  infoPrefix: [colors.bold, colors.fg.blue],
  infoText: [colors.fg.blue],
  infoVariable: [colors.bold, colors.fg.blue],

  snippetLineNumber: [colors.bold],
  snippetErrorLeftArrow: [colors.bold, colors.fg.red],
  snippetErrorUnderArrows: [colors.bold, colors.fg.red],
};

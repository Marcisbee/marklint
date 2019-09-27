
const DIFF_GROUPS = {
  '(': ')',
  '[': ']',
  '{': '}',
  ')': '(',
  ']': '[',
  '}': '{',
};

let unparsedData = null;

/**
 * @param {Record<string, number>} diff
 * @return {boolean}
 */
function shouldSkip(diff) {
  const keys = Object.keys(diff);
  let skip = false;

  keys.forEach((key) => {
    const num = diff[key];
    const match = DIFF_GROUPS[key];
    const matchNum = diff[match];

    if (!match) {
      if (num % 2 === 1) {
        skip = true;
      }
      return;
    }

    if (num !== matchNum) {
      skip = true;
    }
  });

  return skip;
}

/**
 * @param {string} html
 * @return {WalkerResponse[]}
 */
function walker(html) {
  /** @type {WalkerResponse[]} */
  const output = [];
  const chars = html.split('');

  const diff = {
    '"': 0,
    '\'': 0,
    '`': 0,
    '(': 0,
    ')': 0,
    '[': 0,
    ']': 0,
    '{': 0,
    '}': 0,
  };
  const diffKeys = Object.keys(diff);

  let charString = '';
  let lastIndex = 0;
  let lastChar = '';

  let skip = false;

  /**
   * @param {number} start
   * @param {number} end
   * @param {string} data
   */
  function handleString(start, end, data) {
    if (unparsedData) {
      const match = data.match(/^(.*)(\<\/(style|script)[ ]*>)$/);
      if (match && match[1] && match[2] && match[3] === unparsedData) {
        unparsedData = null;
        handleString(start, start + match[1].length, match[1]);
        handleTag(start + match[1].length, end, match[2]);
      }
      return;
    }

    output.push({
      start,
      end,
      data,
      type: 'string',
    });
    lastIndex += data.length;
    charString = '';
  }

  /**
   * @param {number} start
   * @param {number} end
   * @param {string} data
   */
  function handleTag(start, end, data) {
    if (unparsedData) return false;

    const match = data.match(/^\<(style|script).*>$/);
    if (match && match[1]) {
      unparsedData = match[1];
    }

    output.push({
      start,
      end,
      data,
      type: 'tag',
    });
    lastIndex += data.length;
    charString = '';

    return true;
  }

  chars.forEach((char, index) => {
    const firstChar = charString[0];
    const secondChar = charString[1];

    if (!skip && index > 0 && char === '<' && (firstChar !== '<' || lastChar !== '>')) {
      handleString(lastIndex, index, charString);
    }

    if (!skip && !unparsedData && char === '>' && firstChar === '<' &&
      (/[a-z0-9\_\-\.\/\!]/i.test(secondChar) || lastChar === secondChar)) {
      const handled = handleTag(lastIndex, index + 1, charString + char);

      if (handled) char = '';
    }

    if (diffKeys.indexOf(char) > -1) {
      diff[char] += 1;
      skip = shouldSkip(diff);
    }

    charString += char;
    lastChar = char;
  });

  if (charString !== '' || chars.length === 0) {
    const start = chars.length - charString.length;
    const end = chars.length;

    handleString(start, end, charString);
  }

  return output;
}

module.exports = walker;

const UNPARSED_OPEN = /^\<(style|script)[\S\s]*\>$/;
const UNPARSED_CLOSE = /^([\S\s]*)(\<\/(style|script)[ ]*\>)$/;
const COMMENT = /^\<\!--([\S\s]*)--\>$/;
const UNFINISHED_COMMENT = /^\<\!--[\S\s]*[^\>](?!--\>)$/;

const DIFF_GROUPS = {
  '(': ')',
  '[': ']',
  '{': '}',
  ')': '(',
  ']': '[',
  '}': '{',
};

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
  let unparsedData = null;

  /**
   * @param {number} start
   * @param {number} end
   * @param {string} data
   */
  function handleUnparsedData(start, end, data) {
    const comment = data.match(COMMENT);
    if (comment && unparsedData === 'comment') {
      unparsedData = null;
      handleTag(start, end, data);
      return;
    }

    const [before, fullTag, tagName] = (data.match(UNPARSED_CLOSE) || [])
      .slice(1);
    if (typeof before !== 'undefined' && fullTag && tagName === unparsedData) {
      unparsedData = null;
      handleString(start, start + before.length, before);
      handleTag(start + before.length, end, fullTag);
    }
  }

  /**
   * @param {number} start
   * @param {number} end
   * @param {string} data
   */
  function handleString(start, end, data) {
    if (unparsedData) {
      handleUnparsedData(start, end, data);
      return false;
    }

    if (!data) return false;

    const isUnfinishedComment = data.match(UNFINISHED_COMMENT);
    if (!unparsedData && isUnfinishedComment) {
      unparsedData = 'comment';
      return false;
    }

    output.push({
      start,
      end,
      data,
      type: 'string',
    });
    lastIndex += data.length;
    charString = '';
    return true;
  }

  /**
   * @param {number} start
   * @param {number} end
   * @param {string} data
   */
  function handleTag(start, end, data) {
    if (unparsedData) {
      handleUnparsedData(start, end, data);
      return false;
    }

    const isUnfinishedComment = data.match(UNFINISHED_COMMENT);
    if (isUnfinishedComment) {
      unparsedData = 'comment';
      return false;
    }

    const match = data.match(UNPARSED_OPEN);
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

    if (!skip && index > 0 && char === '<') {
      handleString(lastIndex, index, charString);
    }

    if (!skip && !unparsedData && char === '>' && firstChar === '<' &&
      (/[a-z0-9\_\-\.\/\!]/i.test(secondChar) || lastChar === secondChar)) {
      const handled = handleTag(lastIndex, index + 1, charString + char);

      if (handled) {
        char = '';
      }
    }

    if (!skip && index > 0 && char !== '' && lastChar === '>' && (UNPARSED_CLOSE.test(charString) || COMMENT.test(charString))) {
      const handled = handleString(lastIndex, index, charString);

      if (handled) {
        char = '';
      }
    }

    const isUnfinishedComment = `${charString}${char}`.match(UNFINISHED_COMMENT);
    if (unparsedData === null && isUnfinishedComment) {
      unparsedData = 'comment';
    }

    if ((unparsedData === null || unparsedData !== 'comment') && diffKeys.indexOf(char) > -1) {
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

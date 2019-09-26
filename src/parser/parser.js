const walker = require('./walker');

const OPENING_TAG = /^<([a-zA-Z0-9\_\-\.]+)([\s\S]*)>$/;
const CLOSING_TAG = /^<\/([a-zA-Z0-9\_\-\.]+)>$/;
const COMMENT = /^<!--(.*)-->$/;
const DOCTYPE = /^<!DOCTYPE([\s\S]*)>$/;
const CDATA = /^<!\[CDATA\[(.*)\]\]>$/;

/**
 * @param {string} html
 * @return {*[]}
 */
function parser(html) {
  const tokens = walker(html);
  const output = [];

  tokens.forEach((token) => {
    if (token.type === 'string') {
      output.push({
        type: 'string',
        value: token.data,
      });
      return;
    }

    const openingTag = token.data.match(OPENING_TAG);
    if (openingTag) {
      const [tagName, paramsBlock] = openingTag.slice(1);
      const params = paramsBlock.replace(/\/$/, '');
      const selfClosing = paramsBlock.substr(-1) === '/';
      output.push({
        type: 'open',
        tagName,
        params,
        selfClosing,
      });
      return;
    }

    const closingTag = token.data.match(CLOSING_TAG);
    if (closingTag) {
      const [tagName] = closingTag.slice(1);
      output.push({
        type: 'closing',
        tagName,
      });
      return;
    }

    const comment = token.data.match(COMMENT);
    if (comment) {
      const [value] = comment.slice(1);
      output.push({
        type: 'comment',
        value,
      });
      return;
    }

    const doctype = token.data.match(DOCTYPE);
    if (doctype) {
      const [params] = doctype.slice(1);
      output.push({
        type: 'doctype',
        params,
      });
      return;
    }

    const cdata = token.data.match(CDATA);
    if (cdata) {
      const [value] = cdata.slice(1);
      output.push({
        type: 'cdata',
        value,
      });
      return;
    }

    output.push({
      type: 'string',
      value: token.data,
    });
  });

  return output;
}

module.exports = parser;

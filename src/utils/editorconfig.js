const { readFileSync } = require('fs');
const { resolve } = require('path');

/**
 * @typedef {Object} EditorConfig
 * @property {'space' | 'tab'} indentType
 * @property {number} indentSize
 * @property {boolean} insertFinalNewline
 */

/**
 * @returns {EditorConfig}
 */
function getConfig() {
  const editorConfigPath = resolve('./.editorconfig');
  /** @type {EditorConfig} */
  const config = {
    indentType: 'space',
    indentSize: 2,
    insertFinalNewline: false,
  };

  try {
    const content = readFileSync(editorConfigPath, 'utf-8');
    const editorConfig = parseEditorConfig(content);

    editorConfig.forEach((c) => {
      if (c.match === '*' || /\*\.html/.test(c.match)) {
        if (c.config.indent_size) {
          config.indentSize = parseInt(c.config.indent_size, 10);
        }

        if (c.config.indent_style) {
          config.indentType = c.config.indent_style;
        }

        if (c.config.trim_trailing_whitespace) {
          config.insertFinalNewline =
            JSON.parse(c.config.trim_trailing_whitespace);
        }
      }
    });
  } catch (e) {
    // No editorconfig file found, no biggie
  }

  return config;
}

/**
 * @param {string} value
 * @returns {Record<string, any>}
 */
function parseEditorConfig(value) {
  const chunks = value
    .trim()
    .match(/^\[([^\]]+)\]$([^\[]+)/gm) || [];

  return chunks.map((chunk) => {
    const lines = chunk
      .split('\n')
      .filter(Boolean)
      .reduce((acc, line) => {
        if (line.trim()[0] === '#') return acc;

        return acc.concat(line.trim());
      }, []);

    const match = lines.shift().replace(/^\[|\]$/g, '').trim();
    const config = lines.reduce((acc, line) => {
      const [key, value] = line.split(/\W?=\W?/);

      return {
        ...acc,
        [key]: value,
      };
    }, {});

    return {
      match,
      config,
    };
  });
}

module.exports = getConfig();

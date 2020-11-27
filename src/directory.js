const fs = require('fs');
const path = require('path');

/**
 * List all files in a directory recursively in a synchronous fashion
 *
 * @param {String} dir
 * @returns {IterableIterator<String>}
 */
function* walkSync(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const pathToFile = path.join(dir, file);
    const isDirectory = fs.statSync(pathToFile).isDirectory();
    if (isDirectory) {
      yield* walkSync(pathToFile);
    } else {
      yield pathToFile;
    }
  }
}

const includeDefaults = [
  '*.html',
  '*.htm',
];
const excludeDefaults = [
  'node_modules/**',
];

/**
 * @param {string} path
 * @param {string[]} rules
 * @return {boolean}
 */
function isInRuleset(path, rules) {
  for (const rule of rules) {
    const normalRule = rule
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '.+')
      .replace(/\*/g, '[^\\/]*');
    const expression = new RegExp(`${normalRule}$`);

    if (expression.test(path)) {
      return true;
    }
  }

  return false;
}

/**
 * @param {string} absolutePath
 * @param {(name: string, read: () => string) => void} traverse
 * @param {{ include?: string[], exclude?: string[] }} options
 */
function directory(
  absolutePath,
  traverse,
  { include = includeDefaults, exclude = excludeDefaults } = {},
) {
  for (const file of walkSync(absolutePath)) {
    const excluded = isInRuleset(file, exclude);
    const included = isInRuleset(file, include);

    if (!excluded && included) {
      traverse(file, () => fs.readFileSync(file).toString());
    }
  }
}

module.exports = directory;

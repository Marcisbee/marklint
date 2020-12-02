const fs = require('fs');
const path = require('path');

/**
 * List all files in a directory recursively in a synchronous fashion
 *
 * @param {String} dir
 * @returns {IterableIterator<String>}
 */
function* walkSync(dir) {
  const files = fs.readdirSync(dir, 'utf-8');

  for (const file of files) {
    const pathToFile = path.join(dir, file);
    let isDirectory = false;

    try {
      isDirectory = fs.statSync(pathToFile).isDirectory();
    } catch (_) {
      // No biggie, something maybe denied permission or something
    }

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
 * @param {string[]} absolutePaths
 * @param {(name: string, read: () => string) => void} traverse
 * @param {{ include?: string[], exclude?: string[] }} options
 */
function directory(
  absolutePaths,
  traverse,
  { include = includeDefaults, exclude = excludeDefaults } = {},
) {
  for (const p of absolutePaths) {
    for (const file of walkSync(p)) {
      const excluded = isInRuleset(file, exclude);
      const included = isInRuleset(file, include);

      if (!excluded && included) {
        traverse(file, () => fs.readFileSync(file).toString());
      }
    }
  }
}

module.exports = directory;

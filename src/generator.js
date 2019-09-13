const traverse = require('./traverse');

/**
 * @param {*} ast
 * @param {Record<string, *>=} options
 * @return {{ code: string }}
 */
function generator(ast, options = {}) {
  let code = '';

  traverse(ast, {
    enter(path) {
      if (path.type === 'HTMLText' || path.type === 'HTMLAttribute') {
        if (path.type === 'HTMLText') {
          code = code.concat(path.raw);
        }

        const parent = path.parent();

        if (parent.type === 'HTMLOpeningElement') {
          const next = path.next();

          if (!next) {
            code = code.concat(`>`);
          }
        }

        return;
      }

      if (path.type === 'HTMLOpeningElement') {
        code = code.concat(`<${path.name.name}`);

        if (path.attributes.length === 0) {
          if (path.selfClosing) {
            code = code.concat(`/`);
          }

          code = code.concat(`>`);
        }

        return;
      }

      if (path.type === 'HTMLAttributeIdentifier') {
        code = code.concat(`${path.name}=`);

        return;
      }

      if (path.type === 'HTMLClosingElement') {
        code = code.concat(`</${path.name.name}>`);

        return;
      }

      if (['HTMLLiteral', 'HTMLDoctype', 'HTMLComment'].indexOf(path.type) !== -1) {
        code = code.concat(path.raw);

        return;
      }
    },
  });

  return {
    code,
  };
}

module.exports = generator;

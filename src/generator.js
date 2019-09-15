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
      if (path.type === 'HTMLText') {
        if (path.type === 'HTMLText') {
          code = code.concat(path.raw);
        }

        const parent = path.parent();

        if (parent.type === 'HTMLOpeningElement') {
          const next = path.next();

          if (!next) {
            if (parent.selfClosing) {
              code = code.concat(`/`);
            }

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
        code = code.concat(`${path.name}`);

        const attribute = path.parent();
        const parent = attribute.parent();

        if (parent.type === 'HTMLOpeningElement') {
          const next = attribute.next();
          const value = attribute.value;

          if (!next && value.raw === undefined) {
            if (parent.selfClosing) {
              code = code.concat(`/`);
            }

            code = code.concat(`>`);
          }
        }

        return;
      }

      if (path.type === 'HTMLClosingElement') {
        code = code.concat(`</${path.name.name}>`);

        return;
      }

      if (path.type === 'HTMLLiteral' && path.raw) {
        code = code.concat(`=${path.raw}`);

        const attribute = path.parent();
        const parent = attribute.parent();

        if (parent.type === 'HTMLOpeningElement') {
          const next = attribute.next();

          if (!next) {
            if (parent.selfClosing) {
              code = code.concat(`/`);
            }

            code = code.concat(`>`);
          }
        }

        return;
      }

      if (['HTMLDoctype', 'HTMLComment'].indexOf(path.type) !== -1 && path.raw) {
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

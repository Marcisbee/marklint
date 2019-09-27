const {
  HTMLText,
  HTMLCData,
  HTMLOpeningElement,
  HTMLClosingElement,
  HTMLAttributeIdentifier,
  HTMLLiteral,
  HTMLDoctype,
  HTMLComment,
} = require('./types');
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
      if (path instanceof HTMLText) {
        code = code.concat(path.value);

        const parent = path.parent();

        if (parent instanceof HTMLOpeningElement) {
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

      if (path instanceof HTMLOpeningElement) {
        code = code.concat(`<${path.name.name}`);

        if (path.attributes.length === 0) {
          if (path.selfClosing) {
            code = code.concat(`/`);
          }

          code = code.concat(`>`);
        }

        return;
      }

      if (path instanceof HTMLAttributeIdentifier) {
        code = code.concat(`${path.name}`);

        const attribute = path.parent();
        const parent = attribute.parent();

        if (parent instanceof HTMLOpeningElement) {
          const next = attribute.next();
          const value = attribute.value;

          if (!next && value.value === undefined) {
            if (parent.selfClosing) {
              code = code.concat(`/`);
            }

            code = code.concat(`>`);
          }
        }

        return;
      }

      if (path instanceof HTMLClosingElement) {
        code = code.concat(`</${path.name.name}>`);

        return;
      }

      if (path instanceof HTMLLiteral && path.value) {
        code = code.concat(`=${path.value}`);

        const attribute = path.parent();
        const parent = attribute.parent();

        if (parent instanceof HTMLOpeningElement) {
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

      if (path instanceof HTMLDoctype && path.value) {
        code = code.concat(`<!DOCTYPE${path.value}>`);

        return;
      }

      if (path instanceof HTMLCData && path.value) {
        code = code.concat(`<![CDATA[${path.value}]]>`);

        return;
      }

      if (path instanceof HTMLComment && path.value) {
        code = code.concat(`<!-- ${path.value} -->`);

        return;
      }

      return path;
    },
  });

  return {
    code,
  };
}

module.exports = generator;

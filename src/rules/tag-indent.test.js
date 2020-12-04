const parser = require('../parser');
const generator = require('../generator');
const traverse = require('../traverse');

const tagIndent = require('./tag-indent');

const ruleHandling = {
  'tag-indent': tagIndent,
};

const rules = {
  'tag-indent': {
    severity: 'error',
    options: {},
  },
};

/**
 * @param {*} ast
 */
function getErrors(ast) {
  const errors = [];

  traverse(ast, {
    enter: (path) => {
      Object.keys(ruleHandling)
        .forEach((rule) => {
          const ruleHandler = ruleHandling[rule];

          const { config, handler } = ruleHandler;
          const ruleConfig = config(rules[rule]);

          if (rules[rule] && rules[rule].severity !== 'off' || true) {
            /** @type {LocalDiagnostics} */
            const localDiagnostics = {
              rule,
              error: [],
              warning: [],
            };

            handler(localDiagnostics, ast, path, ruleConfig);

            errors.push(...localDiagnostics.error, ...localDiagnostics.warning);
          }
        });

      return path;
    },
  });

  errors.forEach(({ applyFix }) => applyFix && applyFix());

  return errors;
}

it('handles two nested tags', () => {
  const input = `<div><strong>Hello World</strong><p></p></div>`;
  const expectation = `<div>
  <strong>Hello World</strong>
  <p></p>
</div>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles three nested tags', () => {
  const input = `<div><strong>Hello World<p></p></strong></div>`;
  const expectation = `<div>
  <strong>Hello World<p></p>
  </strong>
</div>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles irregular case with text nodes', () => {
  const input = `<strong>asd <i>123</i></strong>`;
  const expectation = `<strong>asd
  <i>123</i>
</strong>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles irregular case with text nodes 2', () => {
  const input = `<strong>asd \n a <i>123</i></strong>`;
  const expectation = `<strong>asd
  a
  <i>123</i>
</strong>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles simple layout', () => {
  const input = `<html lang="en"><head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Document</title>
</head>
</html>`;
  const expectation = `<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Document</title>
  </head>
</html>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles already linted layout', () => {
  const input = `<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Document</title>
  </head>
</html>`;
  const expectation = `<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Document</title>
  </head>
</html>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles empty lines', () => {
  const input = `<html lang="en">

  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <title>Document</title>
  </head>

</html>`;
  const expectation = `<html lang="en">

  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <title>Document</title>
  </head>

</html>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

it('handles empty lines with spaces', () => {
  const input = `<html lang="en">

  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <title>Document</title>
  </head>

</html>`;
  const expectation = `<html lang="en">

  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

    <title>Document</title>
  </head>

</html>`;

  const ast = parser(input);
  getErrors(ast);

  expect(generator(ast).code).toBe(expectation);
});

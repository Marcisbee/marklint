const tokenize = require('./tokenize');

/**
 * @param {any} fileName
 * @param {any} content
 * @param {Record<string, any>} rules
 */
function lint(fileName, content, rules) {
  const ast = tokenize(content);
  console.log({ ast });
}


const rules = {
  'no-unclosed-tag': ['error', 'always'],
  'indent': ['error', 2, { outerIIFEBody: 0 }],
};

const fileIndex =
`<html>
  <body>
    text
  </body>
</html>
`;

lint('index.html', fileIndex, rules);

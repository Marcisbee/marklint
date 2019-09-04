const {
  build,
  Markup,
  HTMLElement,
  HTMLText,
} = require('./build-ast');

describe('buildAst', () => {
  describe('#build', () => {
    test('should export `build` as a function', () => {
      expect(typeof build).toBe('function');
    });

    test('should build Markup', () => {
      const input = ``;
      const output = build(input);

      expect(output).toEqual(new Markup({
        children: expect.any(Array),
        end: 0,
        sourceType: 'HTML',
        start: 0,
        type: 'Markup',
      }));
    });

    test('should build children', () => {
      const input = ``;
      const output = build(input);

      expect(output.children).toEqual([
        new HTMLText({
          end: 0,
          raw: '',
          start: 0,
          type: 'HTMLText',
          value: '',
        }),
      ]);
    });

    test('should return correct `openingElement` start, end', () => {
      const input = `asd <a href="#link">This is a link</a> dsa`;
      const output = build(input);

      const {
        start,
        end,
      } = output.children[1].openingElement;
      expect(input.substring(start, end)).toEqual('<a href="#link">');
    });

    test('should return correct `openingElement.name` start, end', () => {
      const input = `asd <a href="#link">This is a link</a> dsa`;
      const output = build(input);

      /** @type {HTMLElement} */
      const element = output.children[1];
      const {
        start,
        end,
      } = element.openingElement.name;
      expect(input.substring(start, end)).toEqual('a');
    });

    test('should return correct `closingElement` start, end values', () => {
      const input = `asd <a href="#link">This is a link</a> dsa`;
      const output = build(input);

      const {
        start,
        end,
      } = output.children[1].closingElement;
      expect(input.substring(start, end)).toEqual('</a>');
    });
  });
});

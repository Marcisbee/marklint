const {
  build,
  Markup,
  // eslint-disable-next-line no-unused-vars
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
          value: '',
        }),
      ]);
    });

    describe('correct start and end values', () => {
      test('should return correct starting `text` start, end', () => {
        const input = `asd <a href="#link">This is a link</a> dsa`;
        const output = build(input);

        /** @type {Partial<HTMLText>} */
        const element = output.children[0];
        const {
          start,
          end,
        } = element;
        expect(input.substring(start, end)).toEqual('asd ');
      });

      test('should return correct ending `text` start, end', () => {
        const input = `asd <a href="#link">This is a link</a> dsa`;
        const output = build(input);

        /** @type {Partial<HTMLText>} */
        const element = output.children[2];
        const {
          start,
          end,
        } = element;
        expect(input.substring(start, end)).toEqual(' dsa');
      });

      test('should return correct `openingElement` start, end', () => {
        const input = `asd <a href="#link">This is a link</a> dsa`;
        const output = build(input);

        /** @type {Partial<HTMLElement>} */
        const element = output.children[1];
        const {
          start,
          end,
        } = element.openingElement;
        expect(input.substring(start, end)).toEqual('<a href="#link">');
      });

      test('should return correct `openingElement.name` start, end', () => {
        const input = `asd <a href="#link">This is a link</a> dsa`;
        const output = build(input);

        /** @type {Partial<HTMLElement>} */
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

        /** @type {Partial<HTMLElement>} */
        const element = output.children[1];
        const {
          start,
          end,
        } = element.closingElement;
        expect(input.substring(start, end)).toEqual('</a>');
      });

      test('should return correct `closingElement.name` start, end', () => {
        const input = `asd <a href="#link">This is a link</a> dsa`;
        const output = build(input);

        /** @type {Partial<HTMLElement>} */
        const element = output.children[1];
        const {
          start,
          end,
        } = element.closingElement.name;
        expect(input.substring(start, end)).toEqual('a');
      });
    });
  });
});

const {
  build,
  Markup,
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
  });
});

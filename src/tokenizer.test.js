const {
  HTMLMarkup,
  // eslint-disable-next-line no-unused-vars
  HTMLAttribute,
  // eslint-disable-next-line no-unused-vars
  HTMLElement,
  // eslint-disable-next-line no-unused-vars
  HTMLComment,
  // eslint-disable-next-line no-unused-vars
  HTMLDoctype,
  HTMLText,
} = require('./tokens');
const tokenize = require('./tokenize');

describe('tokenize', () => {
  test('should export `tokenize` as a function', () => {
    expect(typeof tokenize).toBe('function');
  });

  test('should set correct type names for tokens', () => {
    const output = new HTMLMarkup({
      start: 0,
      end: 1,
      children: [],
      sourceType: 'HTML',
      raw: '',
    });

    expect(output.type).toEqual('HTMLMarkup');
  });

  test('should tokenize HTMLMarkup', () => {
    const input = ``;
    const output = tokenize(input);

    expect(output).toEqual(new HTMLMarkup({
      children: expect.any(Array),
      end: 0,
      sourceType: 'HTML',
      start: 0,
      raw: '',
    }));
  });

  test('should tokenize children', () => {
    const input = ``;
    const output = tokenize(input);

    expect(output.children).toEqual([
      new HTMLText({
        end: 0,
        raw: '',
        start: 0,
        value: '',
      }),
    ]);
  });

  test('should handle doctype', () => {
    const input = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`;
    const output = tokenize(input);

    expect(output.children[0]).toEqual(new HTMLDoctype({
      raw: `<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">`,
      value: `DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\"`,
      end: 90,
      start: 0,
    }));
  });

  test('should handle attribute name and value', () => {
    const input = '<meta\n  stylesheet\n  name="foo"\n/>';
    const output = tokenize(input);

    /** @type {*} */
    const element = output.children[0];
    const attribute1 = element.openingElement.attributes[1];
    const attribute2 = element.openingElement.attributes[3];

    expect(attribute1.name.name).toEqual('stylesheet');
    expect(attribute1.value.value).toEqual(undefined);

    expect(attribute2.name.name).toEqual('name');
    expect(attribute2.value.value).toEqual('foo');
  });

  test('should handle attribute name and value with position', () => {
    const input = '<meta\n  stylesheet\n  name="foo"\n/>';
    const output = tokenize(input);

    /** @type {*} */
    const element = output.children[0];
    const attribute1 = element.openingElement.attributes[1];
    const name1 = attribute1.name;
    const value1 = attribute1.value;

    const attribute2 = element.openingElement.attributes[3];
    const name2 = attribute2.name;
    const value2 = attribute2.value;

    expect(input.substring(name1.start, name1.end)).toEqual('stylesheet');
    expect(input.substring(value1.start, value1.end)).toEqual('');

    expect(input.substring(name2.start, name2.end)).toEqual('name');
    expect(input.substring(value2.start, value2.end)).toEqual('"foo"');
  });

  test('should handle attribute with multi line value', () => {
    const input = '<meta\n  foo=" bar\nbaz "\n/>';
    const output = tokenize(input);

    /** @type {*} */
    const element = output.children[0];
    const attribute = element.openingElement.attributes[1];

    expect(attribute.name.name).toEqual('foo');
    expect(attribute.value.value).toEqual(' bar\nbaz ');
  });

  describe('correct start and end values', () => {
    const input =
      `asd <a
    href="#link"
    name =  "foo"
  >This is a link <strong>bold</strong></a>
  <br/>
  <!-- this is a comment -->
  <b>123</b> dsa`;
    const output = tokenize(input);

    test('for `HTMLText` prefix', () => {
      /** @type {Partial<HTMLText>} */
      const element = output.children[0];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual('asd ');
    });

    test('for `HTMLText` suffix', () => {
      /** @type {Partial<HTMLText>} */
      const element = output.children[8];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual(' dsa');
    });

    test('for `HTMLElement`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual(`<a
    href="#link"
    name =  "foo"
  >This is a link <strong>bold</strong></a>`);
    });

    test('for `openingElement`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const { start, end } = element.openingElement;

      expect(input.substring(start, end))
        .toEqual('<a\n    href="#link"\n    name =  "foo"\n  >');
    });

    test('for `openingElement.name`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const { start, end } = element.openingElement.name;

      expect(input.substring(start, end)).toEqual('a');
    });

    test('for `HTMLAttribute`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const attributes = element.openingElement.attributes;
      const { start: start0, end: end0 } = attributes[0];
      const { start: start1, end: end1 } = attributes[1];
      const { start: start2, end: end2 } = attributes[2];
      const { start: start3, end: end3 } = attributes[3];
      const { start: start4, end: end4 } = attributes[4];

      expect(input.substring(start0, end0)).toEqual('\n    ');
      expect(input.substring(start1, end1)).toEqual('href="#link"');
      expect(input.substring(start2, end2)).toEqual('\n    ');
      expect(input.substring(start3, end3)).toEqual('name =  "foo"');
      expect(input.substring(start4, end4)).toEqual('\n  ');
    });

    test('for `HTMLAttribute.name`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      /** @type {*} */
      const attribute = element.openingElement.attributes[1];
      const { start, end } = attribute.name;

      expect(input.substring(start, end)).toEqual('href');
    });

    test('for `HTMLAttribute.value`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      /** @type {*} */
      const attribute = element.openingElement.attributes[1];
      const { start, end } = attribute.value;

      expect(input.substring(start, end)).toEqual('"#link"');
    });

    test('for `closingElement`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const { start, end } = element.closingElement;

      expect(input.substring(start, end)).toEqual('</a>');
    });

    test('for `closingElement.name`', () => {
      /** @type {Partial<HTMLElement>} */
      const element = output.children[1];
      const { start, end } = element.closingElement.name;

      expect(input.substring(start, end)).toEqual('a');
    });

    test('for `HTMLComment`', () => {
      /** @type {Partial<HTMLComment>} */
      const element = output.children[5];
      const { start, end } = element;

      expect(input.substring(start, end))
        .toEqual('<!-- this is a comment -->');
    });
  });
});

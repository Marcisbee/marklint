const {
  HTMLToken,
  HTMLElement,
  HTMLOpeningElement,
  HTMLClosingElement,
  HTMLIdentifier,
  HTMLComment,
  HTMLMarkup,
  HTMLDoctype,
  HTMLCData,
  HTMLText,
  HTMLAttribute,
  HTMLAttributeIdentifier,
  HTMLLiteral,
} = require('../types');
const parse = require('./parser');

describe('parse', () => {
  test('should export `parse` as a function', () => {
    expect(typeof parse).toBe('function');
  });

  test('should be instance of HTMLToken', () => {
    const output = new HTMLMarkup({
      start: 0,
      end: 1,
      children: [],
      sourceType: 'HTML',
      raw: '',
    });

    expect(output instanceof HTMLToken).toBeTruthy();
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

  test('should parse HTMLMarkup', () => {
    const input = ``;
    const output = parse(input);

    expect(output).toEqual(new HTMLMarkup({
      start: 0,
      end: 0,
      children: expect.any(Array),
      sourceType: 'HTML',
      raw: '',
    }));
  });

  test('should parse children', () => {
    const input = ` `;
    const output = parse(input);

    expect(output.children).toEqual([
      new HTMLText({
        start: 0,
        end: 1,
        parent: expect.any(Function),
        next: expect.any(Function),
        previous: expect.any(Function),
        value: ' ',
      }),
    ]);
  });

  test('should handle opening tag', () => {
    const input = `<a>`;
    const output = parse(input);

    expect(output.children[0]).toEqual(new HTMLElement({
      start: 0,
      end: 3,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      openingElement: new HTMLOpeningElement({
        start: 0,
        end: 3,
        parent: expect.any(Function),
        name: new HTMLIdentifier({
          start: 1,
          end: 2,
          parent: expect.any(Function),
          name: 'a',
        }),
        raw: '<a>',
        attributes: [],
        selfClosing: false,
        voidElement: false,
        blockElement: false,
        flowElement: false,
      }),
      closingElement: null,
      depth: 0,
      children: [],
    }));
  });

  test('should handle comment', () => {
    const input = `<!-- this is a comment -->`;
    const output = parse(input);

    expect(output.children[0]).toEqual(new HTMLComment({
      start: 0,
      end: 26,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      value: ' this is a comment ',
    }));
  });

  test('should handle doctype', () => {
    const input = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`;
    const output = parse(input);

    expect(output.children[0]).toEqual(new HTMLDoctype({
      start: 0,
      end: 90,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      value: ` HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\"`,
    }));
  });

  test('should handle DOCTYPE and tags after it', () => {
    const input = `<!DOCTYPE html><html lang="en"></html>`;
    const output = parse(input);

    expect(output.children[0]).toEqual(new HTMLDoctype({
      start: 0,
      end: 15,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      value: ' html',
    }));

    expect(output.children[1]).toEqual(new HTMLElement({
      start: 15,
      end: 38,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      openingElement: new HTMLOpeningElement({
        start: 15,
        end: 31,
        parent: expect.any(Function),
        name: new HTMLIdentifier({
          start: 16,
          end: 20,
          parent: expect.any(Function),
          name: 'html',
        }),
        raw: '<html lang=\"en\">',
        attributes: [
          new HTMLText({
            start: 20,
            end: 21,
            parent: expect.any(Function),
            next: expect.any(Function),
            previous: expect.any(Function),
            value: ' ',
          }),
          new HTMLAttribute({
            end: 30,
            name: new HTMLAttributeIdentifier({
              end: 25,
              name: 'lang',
              parent: expect.any(Function),
              start: 21,
            }),
            parent: expect.any(Function),
            next: expect.any(Function),
            previous: expect.any(Function),
            start: 21,
            value: new HTMLLiteral({
              end: 30,
              parent: expect.any(Function),
              start: 26,
              value: '"en"',
            }),
          }),
        ],
        selfClosing: false,
        voidElement: false,
        blockElement: false,
        flowElement: false,
      }),
      closingElement: new HTMLClosingElement({
        start: 31,
        end: 38,
        parent: expect.any(Function),
        name: new HTMLIdentifier({
          start: 33,
          end: 37,
          parent: expect.any(Function),
          name: 'html',
        }),
        raw: '</html>',
      }),
      depth: 0,
      children: [],
    }));
  });

  test('should handle CDATA', () => {
    const input = `<![CDATA[ Hello World ]]>`;
    const output = parse(input);

    expect(output.children[0]).toEqual(new HTMLCData({
      start: 0,
      end: 25,
      parent: expect.any(Function),
      next: expect.any(Function),
      previous: expect.any(Function),
      value: ' Hello World ',
    }));
  });

  test('should handle script tag', () => {
    const input = `\n<script>\n</script>\n`;
    const output = parse(input);

    /** @type {any} */
    const element = output.children[1];

    expect(element.openingElement.name.name).toEqual('script');
    expect(element.closingElement.name.name).toEqual('script');
  });

  test('should handle template tag', () => {
    const input = `<template>
  <!-- <strong> -->
</template>`;
    const output = parse(input);

    /** @type {any} */
    const element = output.children[0];
    /** @type {any} */
    const comment = element.children[1];

    expect(element.openingElement.name.name).toEqual('template');
    expect(element.closingElement.name.name).toEqual('template');

    expect(comment.value).toEqual(' <strong> ');
  });

  test('should handle attribute name and value', () => {
    const input = '<meta\n  stylesheet\n  name="foo"\n/>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];
    const attribute1 = element.openingElement.attributes[1];
    const attribute2 = element.openingElement.attributes[3];

    expect(attribute1.name.name).toEqual('stylesheet');
    expect(attribute1.value.value).toEqual(undefined);

    expect(attribute2.name.name).toEqual('name');
    expect(attribute2.value.value).toEqual('"foo"');
  });

  test('should handle attribute whitespaces', () => {
    const input = '<meta data />';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(element.openingElement.attributes[0].value).toEqual(' ');
    expect(element.openingElement.attributes[2].value).toEqual(' ');
  });

  test('should handle attribute name and value with position', () => {
    const input = '<meta\n  stylesheet\n  name="foo"\n/>';
    const output = parse(input);

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
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];
    const attribute = element.openingElement.attributes[1];

    expect(attribute.name.name).toEqual('foo');
    expect(attribute.value.value).toEqual('" bar\nbaz "');
  });

  test('should handle root as plain text', () => {
    const input = 'Hello world!';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(input.substring(element.start, element.end)).toEqual('Hello world!');
    expect(element.value).toEqual('Hello world!');
  });

  test('should void "meta" tag', () => {
    const input = '<meta>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(element.openingElement.name.name).toBe('meta');
    expect(element.openingElement.selfClosing).toBe(false);
    expect(element.closingElement).toBe(null);
  });

  test('should self close "meta" tag', () => {
    const input = '<meta/>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(element.openingElement.name.name).toBe('meta');
    expect(element.openingElement.selfClosing).toBe(true);
    expect(element.closingElement).toBe(null);
  });

  test('should void "meta" tag inside other tag', () => {
    const input = '<head><meta><a></b></head>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];
    /** @type {*} */
    const metaElement = element.children[0];

    expect(element.openingElement.name.name).toEqual('head');
    expect(element.closingElement.name.name).toEqual('head');

    expect(metaElement.openingElement.name.name).toBe('meta');
    expect(metaElement.openingElement.selfClosing).toBe(false);
    expect(metaElement.closingElement).toBe(null);
  });

  test('should self close "meta" tag inside other tag', () => {
    const input = '<head><meta/><a></b></head>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];
    /** @type {*} */
    const metaElement = element.children[0];

    expect(element.openingElement.name.name).toEqual('head');
    expect(element.closingElement.name.name).toEqual('head');

    expect(metaElement.openingElement.name.name).toBe('meta');
    expect(metaElement.openingElement.selfClosing).toBe(true);
    expect(metaElement.closingElement).toBe(null);
  });

  test('should correctly handle unclosed block tags', () => {
    const input = '<p>a<p>b</p>';
    const output = parse(input);

    /** @type {*} */
    const element1 = output.children[0];
    /** @type {*} */
    const element2 = output.children[1];

    expect(element1.openingElement.name.name).toBe('p');
    expect(element1.closingElement).toBe(null);
    expect(element1.children.length).toBe(1);

    expect(element2.openingElement.name.name).toBe('p');
    expect(element2.closingElement.name.name).toBe('p');
    expect(element2.children.length).toBe(1);
  });

  test('should correctly handle closing of p tag', () => {
    const input = '<div><p>a</p></div>';
    const output = parse(input);

    /** @type {*} */
    const element1 = output.children[0];
    /** @type {*} */
    const element2 = element1.children[0];

    expect(element1.openingElement.name.name).toBe('div');
    expect(element1.closingElement.name.name).toBe('div');
    expect(element1.children.length).toBe(1);

    expect(element2.openingElement.name.name).toBe('p');
    expect(element2.closingElement.name.name).toBe('p');
    expect(element2.children.length).toBe(1);
  });

  test('should correctly handle unclosed content flow tags', () => {
    const input = '<tr><th>Hello<td>World<td>!</td><td>Foo<span>123</span></tr>';
    const output = parse(input);

    /** @type {*} */
    const tr = output.children[0];
    /** @type {*} */
    const th = tr.children[0];
    /** @type {*} */
    const td1 = tr.children[1];
    /** @type {*} */
    const td2 = tr.children[2];
    /** @type {*} */
    const td3 = tr.children[3];

    expect(tr.openingElement.name.name).toBe('tr');
    expect(tr.closingElement.name.name).toBe('tr');
    expect(tr.children.length).toBe(4);

    expect(th.openingElement.name.name).toBe('th');
    expect(th.closingElement).toBe(null);
    expect(th.children.length).toBe(1);

    expect(td1.openingElement.name.name).toBe('td');
    expect(td1.closingElement).toBe(null);
    expect(td1.children.length).toBe(1);

    expect(td2.openingElement.name.name).toBe('td');
    expect(td2.closingElement.name.name).toBe('td');
    expect(td2.children.length).toBe(1);

    expect(td3.openingElement.name.name).toBe('td');
    expect(td3.closingElement).toBe(null);
    expect(td3.children.length).toBe(2);
  });

  test('should set everything inside style tag as text', () => {
    const input = '<style><b>text</b></style>';
    const output = parse(input);

    /** @type {*} */
    const style = output.children[0];

    expect(style.openingElement.name.name).toBe('style');
    expect(style.closingElement.name.name).toBe('style');
    expect(style.children[0].type).toBe('HTMLText');
    expect(style.children[0].value).toBe('<b>text</b>');
  });

  test('should not break with div and table inside', () => {
    const input = '<div><table></table></div>';
    const output = parse(input);

    /** @type {*} */
    const div = output.children[0];
    /** @type {*} */
    const table = div.children[0];

    expect(div.openingElement.name.name).toBe('div');
    expect(div.closingElement.name.name).toBe('div');
    expect(table.openingElement.name.name).toBe('table');
    expect(table.closingElement.name.name).toBe('table');
  });

  test('should not break paragraph tag', () => {
    const input = '<p> Hello <span>123</span><div><p>asd</p>';
    const output = parse(input);

    /** @type {*} */
    const element1 = output.children[0];
    /** @type {*} */
    const element2 = output.children[1];
    /** @type {*} */
    const element3 = element2.children[0];

    expect(element1.openingElement.name.name).toBe('p');
    expect(element1.closingElement).toBe(null);

    expect(element2.openingElement.name.name).toBe('div');
    expect(element2.closingElement).toBe(null);

    expect(element3.openingElement.name.name).toBe('p');
    expect(element3.closingElement.name.name).toBe('p');
  });

  test('should not break paragraph with different closing tag', () => {
    const input = '<p>foo</a>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(element.openingElement.name.name).toBe('p');
    expect(element.closingElement.name.name).toBe('a');
  });

  test('should not break paragraph with different closing tag 2', () => {
    const input = '<p>foo</div>';
    const output = parse(input);

    /** @type {*} */
    const element = output.children[0];

    expect(element.openingElement.name.name).toBe('p');
    expect(element.closingElement.name.name).toBe('div');
  });

  test('should not break paragraph with different surounding tag', () => {
    const input = '<div><p>foo</div>';
    const output = parse(input);

    /** @type {*} */
    const element1 = output.children[0];
    /** @type {*} */
    const element2 = element1.children[0];

    expect(element1.openingElement.name.name).toBe('div');
    expect(element1.closingElement.name.name).toBe('div');

    expect(element2.openingElement.name.name).toBe('p');
    expect(element2.closingElement).toBeNull();
  });

  describe('correct start and end values', () => {
    const input =
      `asd <a
    href="#link"
    name =  "foo"
  >This is a link <strong>bold</strong></a>
  <br/>
  <!-- this is a comment -->
  <b>123</b> dsa<meta />`;
    const output = parse(input);

    test('for `HTMLText` prefix', () => {
      /** @type {*} */
      const element = output.children[0];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual('asd ');
    });

    test('for `HTMLText` suffix', () => {
      /** @type {*} */
      const element = output.children[8];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual(' dsa');
    });

    test('for `HTMLElement`', () => {
      /** @type {*} */
      const element = output.children[1];
      const { start, end } = element;

      expect(input.substring(start, end)).toEqual(`<a
    href="#link"
    name =  "foo"
  >This is a link <strong>bold</strong></a>`);
    });

    test('for `openingElement`', () => {
      /** @type {*} */
      const element = output.children[1];
      const { start, end } = element.openingElement;

      expect(input.substring(start, end))
        .toEqual('<a\n    href="#link"\n    name =  "foo"\n  >');
    });

    test('for `openingElement.name`', () => {
      /** @type {*} */
      const element = output.children[1];
      const { start, end } = element.openingElement.name;

      expect(input.substring(start, end)).toEqual('a');
    });

    test('for `HTMLAttribute`', () => {
      /** @type {*} */
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
      /** @type {*} */
      const element = output.children[1];
      /** @type {*} */
      const attribute = element.openingElement.attributes[1];
      const { start, end } = attribute.name;

      expect(input.substring(start, end)).toEqual('href');
    });

    test('for `HTMLAttribute.value`', () => {
      /** @type {*} */
      const element = output.children[1];
      /** @type {*} */
      const attribute = element.openingElement.attributes[1];
      const { start, end } = attribute.value;

      expect(input.substring(start, end)).toEqual('"#link"');
    });

    test('for `closingElement`', () => {
      /** @type {*} */
      const element = output.children[1];
      const { start, end } = element.closingElement;

      expect(input.substring(start, end)).toEqual('</a>');
    });

    test('for `closingElement.name`', () => {
      /** @type {*} */
      const element = output.children[1];
      const { start, end } = element.closingElement.name;

      expect(input.substring(start, end)).toEqual('a');
    });

    test('for `HTMLComment`', () => {
      /** @type {*} */
      const element = output.children[5];
      const { start, end } = element;

      expect(input.substring(start, end))
        .toEqual('<!-- this is a comment -->');
    });

    test('for "<meta />"', () => {
      /** @type {*} */
      const element = output.children[9];
      const { start, end } = element;

      expect(input.substring(start, end))
        .toEqual('<meta />');
    });
  });
});

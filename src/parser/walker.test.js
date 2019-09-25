const walker = require('./walker');

describe('walker', () => {
  test('should export `walker` as a function', () => {
    expect(typeof walker).toBe('function');
  });

  test('returns empty string', () => {
    const input = ``;
    const expectation = [
      {
        data: '',
        end: 0,
        start: 0,
        type: 'string',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns simple string', () => {
    const input = `Hello World`;
    const expectation = [
      {
        start: 0,
        end: 11,
        data: 'Hello World',
        type: 'string',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns starting tag', () => {
    const input = `<a>`;
    const expectation = [
      {
        start: 0,
        end: 3,
        data: '<a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns ending tag', () => {
    const input = `</a>`;
    const expectation = [
      {
        start: 0,
        end: 4,
        data: '</a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns doctype', () => {
    const input = `<!DOCTYPE html>`;
    const expectation = [
      {
        start: 0,
        end: 15,
        data: '<!DOCTYPE html>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns comment', () => {
    const input = `<!-- comment -->`;
    const expectation = [
      {
        start: 0,
        end: 16,
        data: '<!-- comment -->',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns cdata', () => {
    const input = `<![CDATA[ document.write("<"); a > 2; ]]>`;
    const expectation = [
      {
        start: 0,
        end: 41,
        data: '<![CDATA[ document.write("<"); a > 2; ]]>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns full tag block', () => {
    const input = `<a>foo</a>`;
    const expectation = [
      {
        start: 0,
        end: 3,
        data: '<a>',
        type: 'tag',
      },
      {
        start: 3,
        end: 6,
        data: 'foo',
        type: 'string',
      },
      {
        start: 6,
        end: 10,
        data: '</a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);

    const tag1 = input.substring(output[0].start, output[0].end);
    expect(tag1).toEqual('<a>');

    const text = input.substring(output[1].start, output[1].end);
    expect(text).toEqual('foo');

    const tag2 = input.substring(output[2].start, output[2].end);
    expect(tag2).toEqual('</a>');
  });

  test('returns nested tag correctly', () => {
    const input = `<a alt='<br/>&("<")& &amp;(&quot;&gt; &lt;&quot;)&amp;'>`;
    const expectation = [
      {
        start: 0,
        end: 56,
        data: `<a alt='<br/>&("<")& &amp;(&quot;&gt; &lt;&quot;)&amp;'>`,
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns nested tag correctly react style', () => {
    const input = `<a attr={() => <br/>}>`;
    const expectation = [
      {
        start: 0,
        end: 22,
        data: '<a attr={() => <br/>}>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns tag correctly react component style', () => {
    const input = `<Component_1.sub />`;
    const expectation = [
      {
        start: 0,
        end: 19,
        data: '<Component_1.sub />',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns template engine', () => {
    const input = `<% true > true %>`;
    const expectation = [
      {
        start: 0,
        end: 17,
        data: '<% true > true %>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });
});

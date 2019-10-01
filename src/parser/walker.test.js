const walker = require('./walker');

describe('walker', () => {
  test('should export `walker` as a function', () => {
    expect(typeof walker).toBe('function');
  });

  test('returns empty string', () => {
    const input = ``;
    const expectation = [];

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

  test('returns broken tag', () => {
    const input = `<<a>`;
    const expectation = [
      {
        start: 0,
        end: 1,
        data: '<',
        type: 'string',
      },
      {
        start: 1,
        end: 4,
        data: '<a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns broken tag 2', () => {
    const input = `<a<a>`;
    const expectation = [
      {
        start: 0,
        end: 2,
        data: '<a',
        type: 'string',
      },
      {
        start: 2,
        end: 5,
        data: '<a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns everything in style tag as a string', () => {
    const input = `<style>a > b {} <a>123</a></style>`;
    const expectation = [
      {
        start: 0,
        end: 7,
        data: '<style>',
        type: 'tag',
      },
      {
        start: 7,
        end: 26,
        data: 'a > b {} <a>123</a>',
        type: 'string',
      },
      {
        start: 26,
        end: 34,
        data: '</style>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns tag after style', () => {
    const input = `<style>a {}</style><a>`;
    const expectation = [
      {
        start: 0,
        end: 7,
        data: '<style>',
        type: 'tag',
      },
      {
        start: 7,
        end: 11,
        data: 'a {}',
        type: 'string',
      },
      {
        start: 11,
        end: 19,
        data: '</style>',
        type: 'tag',
      },
      {
        start: 19,
        end: 22,
        data: '<a>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns empty script tag', () => {
    const input = `<script src="https://unpkg.com/monaco-editor@0.8.3/min/vs/loader.js"></script>`;
    const expectation = [
      {
        start: 0,
        end: 69,
        data: '<script src="https://unpkg.com/monaco-editor@0.8.3/min/vs/loader.js">',
        type: 'tag',
      },
      {
        start: 69,
        end: 78,
        data: '</script>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns script with a line break', () => {
    const input = `<script>
    </script>`;
    const expectation = [
      {
        start: 0,
        end: 8,
        data: '<script>',
        type: 'tag',
      },
      {
        start: 8,
        end: 13,
        data: '\n    ',
        type: 'string',
      },
      {
        start: 13,
        end: 22,
        data: '</script>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns script with a line break after', () => {
    const input = `<script>
    </script>
    `;
    const expectation = [
      {
        start: 0,
        end: 8,
        data: '<script>',
        type: 'tag',
      },
      {
        start: 8,
        end: 13,
        data: '\n    ',
        type: 'string',
      },
      {
        start: 13,
        end: 22,
        data: '</script>',
        type: 'tag',
      },
      {
        start: 22,
        end: 27,
        data: '\n    ',
        type: 'string',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('returns everything in script tag as a string', () => {
    const input = `<script>a > b {} <a>123</a></script>`;
    const expectation = [
      {
        start: 0,
        end: 8,
        data: '<script>',
        type: 'tag',
      },
      {
        start: 8,
        end: 27,
        data: 'a > b {} <a>123</a>',
        type: 'string',
      },
      {
        start: 27,
        end: 36,
        data: '</script>',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('does not parse tags inside comment', () => {
    const input = `<!-- <b>strong</b> -->`;
    const expectation = [
      {
        start: 0,
        end: 22,
        data: '<!-- <b>strong</b> -->',
        type: 'tag',
      },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('does not parse tags inside comment wrapped by tags', () => {
    const input = `<div>
  <!-- <strong>July 5, 2018</strong> -->
</div>`;
    const expectation = [
      { data: '<div>', end: 5, start: 0, type: 'tag' },
      { data: '\n  ', end: 8, start: 5, type: 'string' },
      { data: '<!-- <strong>July 5, 2018</strong> -->', end: 46, start: 8, type: 'tag' },
      { data: '\n', end: 47, start: 46, type: 'string' },
      { data: '</div>', end: 53, start: 47, type: 'tag' },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('does not count character inside unparsed data blocks', () => {
    const input = `<a><!--"--></a>`;
    const expectation = [
      { data: '<a>', end: 3, start: 0, type: 'tag' },
      { data: '<!--"-->', end: 11, start: 3, type: 'tag' },
      { data: '</a>', end: 15, start: 11, type: 'tag' },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });

  test('does not count character inside unparsed data blocks 2', () => {
    const input = `<html><script>"</script>"</script></html>`;
    const expectation = [
      { data: '<html>', end: 6, start: 0, type: 'tag' },
      { data: '<script>', end: 14, start: 6, type: 'tag' },
      { data: '"</script>"', end: 25, start: 14, type: 'string' },
      { data: '</script>', end: 34, start: 25, type: 'tag' },
      { data: '</html>', end: 41, start: 34, type: 'tag' },
    ];

    const output = walker(input);

    expect(output).toEqual(expectation);
  });
});

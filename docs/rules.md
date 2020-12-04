# All rules

## Rule: `attr-format`
Forces indent for html attributes that have line break between.

Config defaults
```js
"attr-format": {
  "severity": "error",
  "options": {
    "type": "space",
    "newline": 2,
    "inline": 1,
    "maxInlineSize": 50
  }
}
```

Options interface:
```ts
{
  type: "space" | "tab";
  newline: number;
  inline: number;
  maxInlineSize: number;
}
```

GOOD:
```html
<input
  value=""
  name="input"/>
```

BAD:
```html
<input
value=""
    name="input"/>
```

## Rule: `attr-closing-bracket`
Forces indent before opening tag closing bracket.

Config defaults
```js
"attr-closing-bracket": {
  severity: 'error',
  options: ['eol'],
}
```

Options interface:
```ts
['eol' | 'newline', number | undefined]
```

### End of last attribute (line) 'eol'
Forces closing bracket `>` or `/>` to be on the same line as last attribute.

GOOD:
```html
<input name="input"/>
```

```html
<input
  name="input"/>
```

It is possible to set a custom whitespace number here in config: `['eol', 1]`

GOOD:
```html
<input name="input" />
```

BAD:
```html
<input name="input"
/>
```

### New line before closing 'newline'
Forces closing bracket `>` or `/>` to have a new line before closing with same whitespace as tag.

GOOD:
```html
<input
  name="input"
/>
```

```html
  <input
    name="input"
  />
```

BAD:
```html
<input name="input"/>
```

## Rule: `no-void-tag-close`
Forces all void elements to be self closed.

Config defaults
```js
"no-void-tag-close": {
  severity: 'error',
}
```

GOOD:
```html
<br/>
<hr/>
```

BAD:
```html
<br>
<hr>
```

## Rule: `no-flow-tag-close`
Forces all flow elements to be closed.

Config defaults
```js
"no-flow-tag-close": {
  severity: 'error',
}
```

GOOD:
```html
<p>Hello</p>
<p>World</p>
```

BAD:
```html
<p>Hello
<p>World
```

## Rule: `no-unclosed-tag`
Forces all tags to be closed.

Config defaults
```js
"no-unclosed-tag": {
  severity: 'error',
}
```

GOOD:
```html
<p>Hello <strong>World</strong></p>
```

BAD:
```html
<p>Hello <strong>World</p>
```

## Rule: `alt-require`
All img tags must have alt attribute.

Config defaults
```js
"alt-require": {
  severity: 'error',
}
```

GOOD:
```html
<img src="image.png" alt="description"/>
```

BAD:
```html
<img src="image.png"/>
```

## Rule: `attr-lowercase`
All attribute names must be lowercase.

Config defaults
```js
"attr-lowercase": {
  severity: 'error',
  options: {
    ignore: ['viewBox'],
  },
}
```

Options interface:
```ts
{
  ignore: string[],
}
```

GOOD:
```html
<tag attr="test"/>
```

BAD:
```html
<tag ATTR="test"/>
```

## Rule: `attr-no-duplication`
Attributes must not be duplicated.

Config defaults
```js
"attr-no-duplication": {
  severity: 'error',
  options: {
    ignore: ['custom-attr'],
  },
}
```

Options interface:
```ts
{
  ignore: string[],
}
```

GOOD:
```html
<tag class="one two"/>
```

BAD:
```html
<tag class="one" class="two"/>
```

## Rule: `attr-value-not-empty`
All attributes must have values.

Config defaults
```js
"attr-value-not-empty": {
  severity: 'error',
  options: {
    ignore: ['disabled'],
  },
}
```

Options interface:
```ts
{
  ignore: string[],
}
```

GOOD:
```html
<input name="myname"/>
```

BAD:
```html
<input name=""/>
```

## Rule: `attr-value-double-quotes`
Forces all attribute values to have double quotes.

Config defaults
```js
"attr-value-double-quotes": {
  severity: 'error',
}
```

GOOD:
```html
<input name="test"/>
```

BAD:
```html
<input name='test'/>
```

## Rule: `style-disabled`
Forces style tag not to be used.

Config defaults
```js
"style-disabled": {
  severity: 'error',
}
```

BAD:
```html
<style>
.bg-red {
  background-color: red;
}
</style>
```

## Rule: `inline-style-disabled`
Forces style attribute not to be used.

Config defaults
```js
"inline-style-disabled": {
  severity: 'error',
}
```

BAD:
```html
<h1 style="background: red;">hello</h1>
```

## Rule: `tag-indent`
Forces tag indentation in depth based on editorconfig or overwritten options.

Config defaults
```js
"tag-indent": {
  "severity": "error",
  "options": {}
}
```

GOOD:
```html
<strong>
  text
</strong>
```

```html
<strong>text</strong>
```

BAD:
```html
<strong>
  text</strong>
```

```html
<strong>
  text
  </strong>
```

```html
  <strong>
    text
    </strong>
```

## Rule: `comment-format`
Forces all comments to have spaces in start and end.

Config defaults
```js
"comment-format": {
  "severity": "warning",
  "options": {
    "start": 1,
    "end": 1
  }
}
```

GOOD:
```html
<!-- Comment -->
```

BAD:
```html
<!--  Comment-->
```

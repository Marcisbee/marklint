# All rules

## Rule: `attr-indent`
Forces indent for html attributes that have line break between.

Config defaults
```js
"attr-indent": {
  severity: 'error',
  options: [2, 'spaces'],
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

# marklint (Markup Lint)
HTML/Markup (Vue and Angular template) linter

![CI](https://img.shields.io/github/workflow/status/Marcisbee/marklint/CI?style=flat-square)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/github/Marcisbee/marklint?style=flat-square)](https://snyk.io/test/github/Marcisbee/marklint)
[![npm version](https://img.shields.io/npm/v/marklint.svg?style=flat-square)](https://www.npmjs.com/package/marklint)
[![npm downloads](https://img.shields.io/npm/dm/marklint.svg?style=flat-square)](https://www.npmjs.com/package/marklint)
[![gzip bundle size](https://img.shields.io/bundlephobia/minzip/marklint?style=flat-square)](https://bundlephobia.com/result?p=marklint)


## Command line interface
Install marklint with npm to use the command line interface:

```bash
npm install marklint -g
```

Validate a file like so:

```bash
marklint
```

## Options

```
Usage: marklint [file] [options]

file     file to parse; otherwise uses stdin

Options:
   -v, --version            print version and exit
   --fix                    fixes all auto fixable issues
   -i, --include            array of file paths to include (default: *.html, *.htm)
   -e, --exclude            array of file paths to exclude (default: node_modules/**)
```

# MIT License
Copyright (C) 2020 Marcis Bergmanis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

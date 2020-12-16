# marklint (Markup Lint)
HTML lint tool that works well with Angular and Vue templates too

![CI](https://img.shields.io/github/workflow/status/Marcisbee/marklint/CI?style=flat-square)
[![Snyk](https://img.shields.io/snyk/vulnerabilities/github/Marcisbee/marklint?style=flat-square)](https://snyk.io/test/github/Marcisbee/marklint)
[![npm version](https://img.shields.io/npm/v/marklint.svg?style=flat-square)](https://www.npmjs.com/package/marklint)
[![npm downloads](https://img.shields.io/npm/dm/marklint.svg?style=flat-square)](https://www.npmjs.com/package/marklint)
[![gzip bundle size](https://img.shields.io/bundlephobia/minzip/marklint?style=flat-square)](https://bundlephobia.com/result?p=marklint)

# Features
- ⚡️ Fast html parsing
- 📏 Uses editorconfig
- 🖍 Prints beautiful code frames
- 🛠 Fixes auto fixable issues
- 🎭 Works with Vue and Angular too
- 🗂 Only 1 dependency ([arg](https://www.npmjs.com/package/arg))
<!-- - 📑 Lint and transform API -->

# Example screenshots

<table>
<tr>
<td>

![image](https://user-images.githubusercontent.com/16621507/101641617-a246df80-3a3a-11eb-9bce-8d7a7e7160d9.png)
</td>
<td>

![image](https://user-images.githubusercontent.com/16621507/101642222-6b24fe00-3a3b-11eb-94d3-2c2b1689e664.png)
</td>
</tr>
</table>


# Installation

```bash
npm install marklint -g
```

# Command line interface

Lint a file like so:

```bash
marklint
```

## Options

```
Usage: marklint [file] [options]

file or directory     file or directory to parse; otherwise uses '.'

Options:
   --fix                    fixes all auto fixable issues
   -v, --version            print version and exit
   -i, --include            array of file paths to include (default: *.html, *.htm)
   -e, --exclude            array of file paths to exclude (default: node_modules/**)
   -c, --config             location of config file
```

<!-- # Lint & transform API -->

# Rules

- ✅ [alt-require](/docs/rules.md#rule-alt-require)
- ✅ [attr-closing-bracket](/docs/rules.md#rule-attr-closing-bracket)
- ✅ [attr-format](/docs/rules.md#rule-attr-format)
- ⭕ [attr-lowercase](/docs/rules.md#rule-attr-lowercase) - _WIP_
- ⭕ [attr-no-duplication](/docs/rules.md#rule-attr-no-duplication) - _WIP_
- ✅ [attr-value-not-empty](/docs/rules.md#rule-attr-value-not-empty)
- ⭕ [attr-value-double-quotes](/docs/rules.md#rule-attr-value-double-quotes) - _WIP_
- ✅ [comment-format](/docs/rules.md#rule-comment-format)
- ⭕ [inline-style-disabled](/docs/rules.md#rule-inline-style-disabled) - _WIP_
- ✅ [no-flow-tag-close](/docs/rules.md#rule-no-flow-tag-close)
- ✅ [no-unclosed-tag](/docs/rules.md#rule-no-unclosed-tag)
- ✅ [no-void-tag-close](/docs/rules.md#rule-no-void-tag-close)
- ⭕ [style-disabled](/docs/rules.md#rule-style-disabled) - _WIP_
- ✅ [tag-indent](/docs/rules.md#rule-tag-indent)

# Motivation
By the time I started this project there were not many html lint tools and none of them provided features I wanted for my templates to have such as indent attributes based on length of attributes length and none of them really worked with Angular templates, that was my primary target from the start.

And since I hate that JS ecosystem has dependency rabbit hole I wanted to build markup linter that checks and fixes issues in any html markup file as well as Angular and Vue templates with minimum dependency count.

# MIT License
Copyright (C) 2020 Marcis Bergmanis

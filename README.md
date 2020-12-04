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
```

<!-- # Lint & transform API -->

<!-- # Rules -->

# Motivation
By the time I started this project there were not many html lint tools and none of them provided features I wanted for my templates to have such as indent attributes based on length of attributes length and none of them really worked with Angular templates, that was my primary target from the start.

And since I hate that JS ecosystem has dependency rabbit hole I wanted to build markup linter that checks and fixes issues in any html markup file as well as Angular and Vue templates with minimum dependency count.

# MIT License
Copyright (C) 2020 Marcis Bergmanis

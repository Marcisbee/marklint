#! /usr/bin/env node

const arg = require('arg');
const path = require('path');

const main = require('../src/index.js');

const args = arg({
  // Types
  '--version': Boolean,

  // Aliases
  '-v': '--version',
});

if (args['--version']) {
  // @ts-ignore
  const packageJson = require('../package.json');
  console.log('v' + packageJson.version);
  process.exit(0);
}

main(path.resolve(args._[0]));

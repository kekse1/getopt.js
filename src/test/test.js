#!/usr/bin/env node

//
import getopt from '../getopt.mjs';
process.args = getopt.create();
//the `.object` is best for debugging. ^_^ ...
console.dir(process.args.object, { depth: 2 });


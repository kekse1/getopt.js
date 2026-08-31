#!/usr/bin/env node

//
import getopt from '../getopt.js';

//
process.args = getopt.create();
//the `.object` is best for debugging. ^_^ ...
console.dir(process.args.object, { depth: 2 });


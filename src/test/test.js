#!/usr/bin/env node

//
import getopt from '../getopt.mjs';

//all of the following are *optional*.
const _vector = null;
//see also `static get options()`.. plus
//plus all `const DEFAULT_*` on the top.
const _options = null;
const _argv = null;
const _start = null;
const _throw = false;

const create = {
	vector: _vector,
	options: _options,
	argv: _argv,
	start: _start,
	throw: _throw };

//'process.args' is *my* location for it...
//but it can also be 'only' a variable..!!1
//as above, the `create` param is optional.
process.args = getopt.create(create);

//the `.object` is best for debugging. ^_^ ...
console.dir(process.args.object, { depth: 2 });


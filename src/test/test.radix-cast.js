#!/usr/bin/env node

//
import '../getopt.js';

//
const str = [
	'abc',
	'(axx)-23',
	'(256)-64',
	'abc',
	'-3.14',
	'--3.14',
	'---3.14',
	'(16)ff',
	'(16)-ff',
	'(16n)ff',
	'(8)1777',
	'(10)3.14',
	'(10n)4096',
	'(10n)4096.25',
	'(10)-16.23',
	'(10n)-16.23',
	'-12.34'
];

for(const s of str)
{
	console.dir({ string: s, result:
		String.radixCast(s) });
}


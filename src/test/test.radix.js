#!/usr/bin/env node

//
import '../getopt.js';

//
const str = [
	[ '--ff', 10 ],
	[ '-9', 8 ],
	[ '--ffff', 16 ],
	[ '---ff', null ],
	[ '---ff', 16 ],
	[ '-1234', null ],
	[ '-3.14', null ],
	[ '-1777', 8 ],
	[ 'ff.ff', 16 ],
	[ '-ff.ff0', 16 ],
	[ '-17.7700', 8 ],
	[ '---.1415000', null ],
	[ '---000001234', null ],
	[ '---0001234.432100000', null ],
	[ '.0100', 10 ]
];

for(const s of str)
{
	console.dir({
		string: s[0],
		radix: s[1],
		integer: Number.parse(s[0], s[1], true),
		number: Number.parse(s[0], s[1]),
		bigint: BigInt.parse(s[0], s[1])
	}, { compact: false });
}


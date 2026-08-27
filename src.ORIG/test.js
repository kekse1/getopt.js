#!/usr/bin/env node

//
import * as polyfill from './polyfill.js';
import getopt from './getopt.js';

//
const PARSE = true;
const ASSIGN = true;

//
//first, biggest vector to test most functionality
//second is the absolute minimum, so only keys to access, rest should be filled into the vector automatically
//
const vector = {
	erstes: { short: 'e', long: 'eins', index: 0, params: 3, help: 'erster test, dazu [help] beschreibung', group: 'erste gruppe', undefined: '(undef)', null: '(null)' },
	zweites: { short: 'z', long: 'zwei', params: 1, help: 'nummer zwei [help] beschreibung', group: 'erste gruppe', default: [ '(def 1)', '(def 2)', '(def 3)' ] },
	drittes: { short: 'd', long: 'drei', index: -1, params: 3, help: 'nummer drei [help] beschreibung', group: 'zweite gruppe' },
	viertes: { short: true, long: true, params: true, assign: false, group: 'abcv' },
	fuenftes: { short: 's', long: 'dies-ist-ein-langer-test', help: 'ebenso-noch-ein-langer-test [help] description.. even longer now!', group: 'eine ganz lange gruppe wg. help() scaling' },
	sechstes: { short: 'S' },
	siebtes: { group: 'abcv' }
};
/*const vector = {
	erstes: {},
	zweites: {},
	drittes: {}
};*/
//TODO/test w/ '-p1337', AND if short is automatically inserted!
/*const vector = {
	port: { parse: true, params: 1 },
	test: { params: 1 }
};*/

//
const testVector = getopt(vector, PARSE, PARSE, ASSIGN, ASSIGN);
console.dir(testVector);

//


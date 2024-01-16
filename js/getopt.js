// 
// Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
// https://kekse.biz/
// v0.2.0
// 

//
const VECTOR = [ 'long', 'short', 'env', 'params', 'index', 'parse', 'assign', 'list', 'group', 'clone', 'default', 'null', 'undefined', 'help' ];

//
const DEFAULT_EXPAND = true;		//expand '-abc' to '-a -b -c' (or '-abc=def' to '-a=def -b=def -c=def); BUT then multiple chars are not allowed for all `short`!!
const DEFAULT_GROUPS = true;		//it's possible to globally disable GROUPs here.. but why should you? ^_^
//
const DEFAULT_PARSE = true;		//recognizing numbers, regexp, booleans, ..
const DEFAULT_ASSIGN = true;		//'=' assignment (which will reset previously enqueued items for the same key)
const DEFAULT_ASSIGN_LIST = true;	//can params with '=' assignment encode lists by ','?
const DEFAULT_CLONE = false;		//boolean or integer (integer is still TODO! see 'Reflect.clone()' (or https://github.com/kekse1/scripts/))
//
const DEFAULT_HELP = true;
const DEFAULT_HELP_INDENT = 2;
const DEFAULT_HELP_INDENT_PREFIX = '// ';
const DEFAULT_HELP_INDENT_DOUBLE = 12;
const DEFAULT_HELP_INDENT_KEYS = 3;

//
const getopt = global.getopt = (_vector, _parse = DEFAULT_PARSE, _parse_values = _parse, _assign = DEFAULT_ASSIGN, _assigned_list = DEFAULT_ASSIGN_LIST, _list = process.argv, _start = 0) => {
	if(Object.isObject(_vector)) _vector = prepareVector(_vector, _parse, _assign, _assigned_list);
	const result = parseCommandLine(_vector, _list.slice(_start), _parse_values);
	return result; };
	
//
//export default getopt;
//if(typeof this !== 'undefined') module.exports = getopt;

//
Reflect.defineProperty(getopt, 'vector', { get: () => [ ... VECTOR ] });

//
const prepareVector = (_vector, _parse, _assign, _assigned_list) => { if(DEFAULT_HELP && !('help' in _vector)) _vector.help = { short: '?' };
	for(const idx in _vector) if(!String.isString(_vector[idx].long, false)) _vector[idx].long = idx;
	const vector = Object.create(null); var keys = Object.keys(_vector); const VECT = [ ... VECTOR ]; const bestShortIndex = [];
	for(const v of VECT) { vector[v.toUpperCase()] = new Map(); if(keys.includes(v.toUpperCase())) return error('The key `%` is a *reserved* getopt vector key', null, v.toUpperCase()); }
	for(var i = 0; i < keys.length; ++i) { const key = keys[i]; if(key.isUpperCase) return error('No getopt vector key may be *upper-case* only'); vector[key] = Object.create(null);
		for(const vect of VECT) if(vect in _vector[key]) switch(vect) {
			case 'long': if(typeof _vector[key].long === 'boolean') { if(_vector[key].long) _vector[key].long = key; else break; }
				else if(!String.isString(_vector[key].long, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'long', key, 'String');
				else if(_vector[key].long[0] === '-') return error('The getopt `%` vector key `%` may not start with a dash `%`', null, 'long', key, '-');
				else if(_vector[key].long.includes(' ')) return error('The getopt `%` vector key `%` may not contain a space `%`', null, 'long', key, ' ');
				else if(_vector[key].long.includes('=')) return error('The getopt `%` vector key `%` may not contain a `%` assignment', null, 'long', key, '=');
				else if(_vector[key].long.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'long', key);
				else prepareVector.vectorIncludesLongShortEnv(vector, _vector[key].long, true); vector[key].long = _vector[key].long; prepareVector.appendIndex(vector, 'LONG', key, _vector[key].long, false, false); break;
			case 'short': if(typeof _vector[key].short === 'boolean') { if(_vector[key].short) bestShortIndex.push(key); break; }
				else if(typeof _vector[key].short !== 'string') return error('The getopt `%` vector key `%` needs to be a (single character) %', null, 'short', key, 'String');
				else if(DEFAULT_EXPAND && _vector[key].short.length !== 1) return error('The getopt `%` vector key `%` needs to be a single character %', null, 'short', key, 'String');
				else if(_vector[key].short === '-') return error('The getopt `%` vector key `%` may not be a dash `%`', null, 'short', key, '-');
				else if(_vector[key].short === ' ') return error('The getopt `%` vector key `%` may not be a space `%`', null, 'short', key, ' ');
				else if(_vector[key].short === '=') return error('The getopt `%` vector key `%` may not be a `%` assignment', null, 'short', key, '=');
				else if(_vector[key].short.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'short', key);
				else prepareVector.vectorIncludesLongShortEnv(vector, _vector[key].short, true); vector[key].short = _vector[key].short; prepareVector.appendIndex(vector, 'SHORT', key, _vector[key].short, false, false); break;
			case 'env': if(typeof _vector[key].env === 'boolean') { if(_vector[key].env) _vector[key].env = key; else break; }
				else if(!String.isString(_vector[key].env, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'env', key, 'String');
				else if(_vector[key].env[0] === '-') return error('The getopt `%` vector key `%` may not start with a dash `%`', null, 'env', key, '-');
				else if(_vector[key].env.includes(' ')) return error('The getopt `%` vector key `%` may not contain a space `%`', null, 'env', key, ' ');
				else if(_vector[key].env.includes('=')) return error('The getopt `%` vector key `%` may not contain a `%` assignment', null, 'env', key, '=');
				else if(_vector[key].env.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'env', key);
				else prepareVector.vectorIncludesLongShortEnv(vector, _vector[key].env, true); vector[key].env = _vector[key].env; prepareVector.appendIndex(vector, 'ENV', key, _vector[key].env, false, false); break;
			case 'params': if(typeof _vector[key].params === 'boolean') _vector[key].params = (_vector[key].params ? 1 : 0);
				else if(!Number.isInt(_vector[key].params) || _vector[key].params < 0) return error('The getopt `%` vector key `%` needs to be a positive % (or %)', null, 'params', key, 'Integer', 'zero');
				vector[key].params = _vector[key].params; prepareVector.appendIndex(vector, 'PARAMS', key, _vector[key].params, false, true); break;
			case 'index': if(typeof _vector[key].index === 'boolean') { if(_vector[key].index === true) vector[key].index = -1; else vector[key].index = null; break; }
				if(!Number.isInt(_vector[key].index)) return error('The getopt `%` vector key `%` needs to be a % type or a -/+ %', null, 'index', key, 'Boolean', 'Integer');
				vector[key].index = _vector[key].index; break;
			case 'parse': if(typeof _vector[key].parse !== 'boolean') return error('The getopt `%` vector key `%` needs to be a % type', null, 'parse', key, 'Boolean');
				vector[key].parse = _vector[key].parse; break;
			case 'assign': if(typeof _vector[key].assign !== 'boolean') return error('The getopt `%` vector key `%` needs to be a % type', null, 'assign', key, 'Boolean');
				vector[key].assign = _vector[key].assign; break;
			case 'list': if(typeof _vector[key].list !== 'boolean') return error('The getopt `%` vector key `%` needs to be a % type', null, 'list', key, 'Boolean');
				vector[key].list = _vector[key].list; break;
			case 'group': if(!DEFAULT_GROUPS) break; if(typeof _vector[key].group !== 'string') return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'group', key, 'String');
				else if(_vector[key].group.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'group', key);
				prepareVector.appendIndex(vector, 'GROUP', key, vector[key].group = _vector[key].group, true, false); break;
			case 'clone': if(typeof _vector[key].clone === 'boolean') vector[key].clone = _vector[key].clone;
				else if(Number.isInt(_vector[key].clone) && _vector[key].clone >= 0) return error('Cloning depth is still a TODO item');
				else return error('The getopt `%` vector key `%` needs to be a % type (or an %, in the future..)', null, 'clone', key, 'Boolean', 'Integer');
				break;
			case 'default': vector[key].null = vector[key].undefined = _vector[key].default;
				prepareVector.appendIndex(vector, 'NULL', key, _vector[key].default, false, true); prepareVector.appendIndex(vector, 'UNDEFINED', key, _vector[key].default, false, true); break;
			case 'null': vector[key].null = _vector[key].null; prepareVector.appendIndex(vector, 'NULL', key, _vector[key].null, false, true); break;
			case 'undefined': vector[key].undefined = _vector[key].undefined; prepareVector.appendIndex(vector, 'UNDEFINED', key, _vector[key].undefined, false, true); break;
			case 'help': if(Number.isNumber(_vector[key].help)) _vector[key].help = _vector[key].help.toString();
				else if(!String.isString(_vector[key].help, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'help', key, 'String');
				vector[key].help = _vector[key].help; prepareVector.appendIndex(vector, 'HELP', key, _vector[key].help, true, false); break; }
		if(!Number.isInt(vector[key].params)) vector[key].params = 0; if(vector[key].params <= 0) { vector[key].params = 0; delete vector[key].undefined; delete vector[key].null; }
		if(!(Number.isInt(vector[key].index) || vector[key].index === null)) vector[key].index = null;
		if(typeof vector[key].parse !== 'boolean') vector[key].parse = _parse; if(typeof vector[key].list !== 'boolean') vector[key].list = _assigned_list;
		if(typeof vector[key].assign !== 'boolean') vector[key].assign = _assign; if(typeof vector[key].clone !== 'boolean' && !(Number.isInt(vector[key].clone) && vector[key].clone >= 0)) vector[key].clone = DEFAULT_CLONE;
		if(!vector[key].short) vector[key].short = ''; if(!vector[key].env) vector[key].env = '';
		if(DEFAULT_GROUPS && !vector[key].group) vector[key].group = ''; if(!vector[key].help) vector[key].help = ''; }
	if(DEFAULT_GROUPS) vector.GROUP.forEach((_value, _key) => { if(keys.includes(_value)) return error('You can\'t define a getopt GROUP with a key index which exists in your getopt vector, too'); });
	var bestIndex; for(const key of bestShortIndex) { if(!(bestIndex = prepareVector.findBestShort(key, vector[key], vector))) return error('Couldn\'t find best short index for item `%` in getopt vector', null, key);
	vector[key].short = bestIndex; prepareVector.appendIndex(vector, 'SHORT', key, bestIndex, false, false); }
	if(!vector.help.help) vector.help.help = 'Call the help for ' + vector.LONG.size + ' possible `getopt` parameters';
	keys = Object.keys(vector); vLoop: for(var v of VECT) { switch(v = v.toUpperCase()) { case 'LONG': case 'SHORT': case 'ENV': keys.remove(v); continue vLoop;
		default: if(vector[v].size === 0) delete vector[v]; keys.remove(v); break; }} const allKeys = Object.keys(vector);
	const result = Object.create(null); result.ITEMS = new Array(keys.length); keys.sort(); result.COUNT = keys.length; vector.ITEMS = new Array(keys.length);
	for(var i = 0; i < keys.length; ++i) { vector.ITEMS[i] = vector[keys[i]]; vector.ITEMS[i]._ = keys[i]; } vector.ITEMS.sort('group');
	for(var i = 0; i < vector.ITEMS.length; ++i) { result[vector.ITEMS[i]._] = vector.ITEMS[i];
			result.ITEMS[i] = vector.ITEMS[i]._; delete result[vector.ITEMS[i]._]._; }
	for(const k of allKeys) if(!(k in result)) result[k] = vector[k]; return result; };

prepareVector.vectorIncludesLongShortEnv = (_result, _key, _throw = false) => {
	if(_result.LONG.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'long') : true);
	else if(_result.SHORT.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'short') : true);
	else if(_result.ENV.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'env') : true);
	return false; };

prepareVector.appendIndex = (_result, _type, _key, _value, _inverse, _array = true) => { if(!_result[_type].has(_inverse ? _key : _value)) _result[_type].set(_inverse ? _key : _value,
	(_array ? [ _inverse ? _value : _key ] : (_inverse ? _value : _key))); else if(_array) _result[_type].get(_inverse ? _key : _value).push(_inverse ? _value : _key);
	else _result[_type].set(_inverse ? _key : _value, (_inverse ? _value : _key)); };

prepareVector.findBestShort = (_index, _vector_item, _vector) => {
	if(!_vector_item.long || _vector_item.long === _index) return prepareVector.findBestShort.find(_index, _vector_item, _vector);
	var result = prepareVector.findBestShort.find(_vector_item.long, _vector_item, _vector);
	if(!result) result = prepareVector.findBestShort.find(_index, _vector_item, _vector);
	if(!result) return error('Failed to find the best short index for getopt vector item `%`', null, _index);
	return result; };
prepareVector.findBestShort.find = (_index, _vector_item, _vector) => { const me = (_vector_item.long || _index); const em = [];
	for(const idx in _vector) if(!idx.isUpperCase && idx !== _index) em.push(_vector[idx].long || idx);
	var set = new Set(); for(const char of me) set.add(char); for(const item of em) for(const char of item) set.add(char);
	const already = [ ... _vector.SHORT.keys() ]; for(const a of already) set.delete(a);
	set = Array.from(set); if(set.length === 0) return ''; return set[0]; };

//
const find = (_vector, _word, _dashes, _index = false) => {
	switch(_dashes) {
		case 2: if(_vector.LONG.has(_word)) return (_index ? _vector.LONG.get(_word) : 'long'); break;
		case 1: if(_vector.SHORT.has(_word)) return (_index ? _vector.SHORT.get(_word) : 'short'); break;
		case 0: if(_vector.ENV.has(_word)) return (_index ? _vector.ENV.get(_word) : 'env'); break; }
	return (_index ? null : 'value'); };
const compare = (_type, _dashes) => { switch(_dashes) {
	case 0: return (_type === 'value' || _type === 'env');
	case 1: return (_type === 'short');
	case 2: return (_type === 'long');
	default: return null; }};
const enqueue = (_vector, _state, _key, _params = 1) => { var item = null; if(String.isString(_key, false))
	{ for(var i = 0; i < _state.length; ++i) if(_state[i][0] === _key) item = _state[i]; } if(!item) {
	item = [ _key, _params ]; _state.push(item); } else item[1] += _params; return item[1]; };
const fill = (_result, _state, ... _params) => { if(_state.length === 0) return 0; var count;
	var item, key; for(count = 0; count < _params.length && _state.length > 0; ++count) { item = _state[0]; key = item[0];
		--item[1]; if(item[1] <= 0) _state.shift(); if(!_result[key]) _result[key] = [];
		_result[key].push(_params[count]); } return count; };
const todo = (_state) => { const result = []; for(var i = 0; i < _state.length; ++i) result[i] = _state[i][0]; return result; };
const left = (_key, _state) => { var result = 0; for(var i = 0; i < _state.length; ++i) if(_state[i][0] === _key) result = _state[i][1]; return result; };

const handle = {};

handle.value = (_result, _vector, _state, _word, _index, _list) => { if(!fill(_result, _state, _word)) _result.push(_word); };
handle.env = (_result, _vector, _state, _word, _index, _list, _item, _key) => { return error('TODO: handle.env();'); };
handle.short = (_result, _vector, _state, _word, _index, _list, _item, _key) => { if(_item.params === 0) {
	if(typeof _result[_key] === 'number') ++_result[_key]; else if(Array._isArray(_result[_key])) _result[_key].push(true);
	else _result[_key] = 1; } else enqueue(_vector, _state, _key, _item.params); };
handle.long = (_result, _vector, _state, _word, _index, _list, _item, _key) => { if(_item.params === 0) {
	if(typeof _result[_key] === 'number') ++_result[_key]; else if(Array._isArray(_result[_key])) _result[_key].push(true);
	else _result[_key] = 1; } else enqueue(_vector, _state, _key, _item.params); };

const parseCommandLine = (_vector, _list = process.argv, _parse_values = _parse) => { const result = [], state = [], index = Object.create(null);
	for(const idx in _vector) if(!idx.isUpperCase) { result[idx] = []; state[idx] = []; index[idx] = 0; } _list = expandShorts(_list, _vector);
	var dashes; for(var i = 0; i < _list.length; ++i) { if(_list === '--') { result.push(... _list.slice(i)); break; } else dashes = 0;
	while(_list[i][dashes] === '-') ++dashes; dashes = Math.min(2, dashes); const orig = _list[i]; const word = _list[i].slice(dashes);
	if((word === 'help' || word === '?') && _vector.help && _vector.help.params === 0) return help(_vector, _list, orig);
	else if(!word.includes('=') || !tryAssignment(word, dashes, _vector, result, index, state)) { var type = find(_vector, word, dashes, false);
	if(!compare(type, dashes)) type = 'value'; const key = (type === 'value' ? null : find(_vector, word, dashes, true)); if(type !== 'value') {
	++index[key]; } handle[type](result, _vector, state, (type === 'value' ? orig : word), i, _list, _vector[key], key); }}
	return parseCommandLine.handleResult(result, _vector, state, index, _list, _parse_values); };

parseCommandLine.handleResult = (_result, _vector, _state, _index, _list, _parse_values = _parse) => { const elements = _result.splice(0, _result.length);
	if(_parse_values) for(var i = 0; i < elements.length; ++i) elements[i] = parseValue(elements[i]); const unfinished = todo(_state); const keys = Object.keys(_result);
	var fill; for(var i = 0; i < keys.length; ++i) { const key = keys[i]; const vect = _vector[key]; if(unfinished.includes(key) && ('null' in vect) &&
	(fill = left(key, _state)) > 0) { if(Array._isArray(vect.null)) for(var j = _result[key].length, k = 0, l = (j % vect.null.length); k < fill; j++, k++, l = ((l + 1) % vect.null.length))
	_result[key][j] = (vect.clone ? Reflect.clone(vect.null[l]) : vect.null[l]); else for(var j = _result[key].length, k = 0; k < fill; ++j, ++k) _result[key][j] = (vect.clone ? Reflect.clone(vect.null) : vect.null); }
	else if(_result[key].length === 0) { if(!('undefined' in vect)) _result[key] = _index[key]; else if(Array._isArray(vect.undefined) && vect.params > 1)
	for(var j = 0, k = 0, l = 0; k < vect.params; ++j, ++k, l = ((l + 1) % vect.undefined.length)) _result[key][j] = (vect.clone ? Reflect.clone(vect.undefined[l]) : vect.undefined[l]);
	else for(var j = 0, k = 0; k < vect.params; ++j, ++k) _result[key][j] = (vect.clone ? Reflect.clone(vect.undefined) : vect.undefined); } else { if(vect.parse)
	for(var j = 0; j < _result[key].length; ++j) _result[key][j] = parseValue(_result[key][j]); var sum = 0; for(var j = 0; j < _result[key].length; ++j) {
	if(typeof _result[key][j] === 'boolean') sum += (_result[key][j] ? 1 : -1); else { sum = null; break; }} if(sum !== null) { if(_result[key][0] === false) ++sum; _result[key] = sum; }}
	if(Array._isArray(_result[key])) { if(_result[key].length === 1) { if(typeof _result[key][0] === 'boolean') _result[key] = (_result[key][0] ? 1 : 0); else _result[key] = _result[key][0]; }
	else if(vect.index !== null) _result[key] = _result[key][Math.getIndex(vect.index, _result[key].length)]; }}  if(DEFAULT_GROUPS) { _vector.GROUP.forEach((_value, _key) => (_result[_value] = []));
	for(var i = 0; i < keys.length; ++i) { const key = keys[i]; if(!_vector.GROUP.has(key)) continue; const target = _vector.GROUP.get(key); if(Array._isArray(_result[key]))
		_result[target].push(... _result[key]); else _result[target].push(_result[key]); }} _result.push(... elements); return _result; };

const parseValue = (_string) => { if(typeof _string !== 'string') return _string;
	else if(_string.length === 0) return ''; else if(_string.length <= 3) switch(_string.toLowerCase()) {
		case 'yes': return true; case 'no': return false; }
	if(!isNaN(_string)) return Number(_string); else if(_string[_string.length - 1] === 'n' &&
		!isNaN(_string.slice(0, -1))) return BigInt(_string.slice(0, -1));
	else if(RegExp.isRegExp(_string)) return RegExp.parse(_string); return _string; };

const tryAssignment = (_word, _dashes, _vector, _result, _index, _state) => {
	const idx = _word.indexOf('='); if(idx === -1) return false; const key = _word.substr(0, idx); const given = find(_vector, key, _dashes, true); if(!given) return false;
	if(!_vector[given].assign) return null; const value = tryAssignment.checkAssignedList(_word.substr(idx + 1), _vector[given].list);
	if(typeof value === 'string') _result[given] = [ value ]; else _result[given] = value; ++_index[given];
	for(var i = 0; i < _state.length; ++i) if(_state[i][0] === given) _state.splice(i--, 1); return true; };

tryAssignment.checkAssignedList = (_value, _assigned_list = DEFAULT_ASSIGN_LIST) => { if(!_assigned_list) return _value; else if(_value.length === 0) return _value;
	const result = []; var string = '', lastWasComma = false; for(var i = 0, j = 0; i < _value.length; ++i) { if(_value[i] === '\\') { if(i < (_value.length - 1))
	string += _value[++i]; } else if(_value[i] === ',') { result[j++] = string; string = ''; if(i === (_value.length - 1)) lastWasComma = true; }
	else string += _value[i]; } if(string.length > 0 || lastWasComma) result.push(string); if(result.length === 1) return result[0]; return result; };

const expandShorts = (_list, _vector) => { if(!DEFAULT_EXPAND) return _list; var word, assign;
	mainLoop: for(var i = 0; i < _list.length; ++i) { if(_list[i][0] !== '-' || _list[i][1] === '-') continue; const idx = _list[i].indexOf('=');
		if(idx > -1) { word = _list[i].substr(1, idx - 1); assign = _list[i].substr(idx); } else { word = _list[i].substr(1); assign = ''; }
		if(word.length === 1) continue; for(var j = 0; j < word.length; ++j) if(!_vector.SHORT.has(word[j])) continue mainLoop;
		_list.splice(i, 1); for(var j = 0; j < word.length; ++j) _list.splice(i + j, 0, '-' + word[j] + assign); i += word.length - 1; }
	return _list; };

//
const help = (_vector, _list, _item) => { const out = process.aTTY; if(!out) return error('No real TTY available');
	out.write('This is the help (for ' + _vector.COUNT + ' possible `getopt` parameters):' + eol(2));
	var result = ''; const consoleWidth = console.width; const indent = String.fill(DEFAULT_HELP_INDENT, ' ');
	const keyIndent = String.fill(DEFAULT_HELP_INDENT_KEYS, ' '); const doubleIndent = String.fill(DEFAULT_HELP_INDENT_DOUBLE, ' ');
	const long = new Array(_vector.COUNT); const short = new Array(_vector.COUNT); var maxLong = 0; for(var i = 0; i < _vector.COUNT; ++i) {
		const item = _vector[_vector.ITEMS[i]]; long[i] = (item.long || ''); short[i] = (item.short || ''); maxLong = Math.max(maxLong, long[i].length); }
	const lineDistribution = (_key, _params) => { const lines = [ _params ]; while(lines[lines.length - 1].length > (consoleWidth - DEFAULT_HELP_INDENT_DOUBLE - _key.length)) {
			lines[lines.length] = lines[lines.length - 1].substr(consoleWidth - DEFAULT_HELP_INDENT_DOUBLE - _key.length) + EOL;
			lines[lines.length - 2] = lines[lines.length - 2].substr(0, consoleWidth - DEFAULT_HELP_INDENT_DOUBLE - _key.length); }
		for(var i = 0; i < lines.length; ++i) lines[i] = doubleIndent + (i === 0 ? _key : String.fill(_key.length, ' ')) + lines[i].trim(); return lines.join(EOL) + EOL; };
	maxLong += 2; var key; for(var i = 0; i < _vector.COUNT; ++i) { const item = _vector[_vector.ITEMS[i]];
		if(long[i] || short[i]) result += (indent + (long[i] ? '--' + long[i] : '').padStart(maxLong, ' ') + keyIndent + (short[i] ? (long[i] ? '/' : '') + ' -' + short[i] : '') + EOL);
		if(item.group || item.params || item.index) { result += EOL; const lines = [];
			if(item.group) result += lineDistribution(' Group: ', item.group);
			if(item.params !== 0) result += lineDistribution('Params: ', (item.params.toString() + (item.index === null ? '' : ' (' + item.index + ')')));
		}
		if(item.help) { const lines = [ item.help ]; while(lines[lines.length - 1].length > (consoleWidth - DEFAULT_HELP_INDENT - 4)) {
				lines[lines.length] = lines[lines.length - 1].substr(0, consoleWidth - DEFAULT_HELP_INDENT - 4);
				lines[lines.length - 2] = lines[lines.length - 2].substr(0, consoleWidth - DEFAULT_HELP_INDENT - 4); }
			for(var j = 0; j < lines.length; ++j) lines[j] = indent + DEFAULT_HELP_INDENT_PREFIX + lines[j].trim(); result += EOL + lines.join(EOL) + eol(2); }
		result += EOL; }
	//
	out.write(result); process.exit();
};

//

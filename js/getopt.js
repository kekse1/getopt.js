// 
// Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
// https://kekse.biz/
// 

//
const VECTOR = [ 'long', 'short', 'env', 'args', 'index', 'parse', 'list', 'group', 'default', 'null', 'undefined', 'clone', 'help' ];

//
const DEFAULT_PARSE = true;//recognizing numbers, regexp, ..
const DEFAULT_ASSIGN = true;//enable the '=' assignment in args.. will *set* (not add) and flush all openend ones
const DEFAULT_ASSIGN_LIST = true;//can args with '=' assignment encode lists by ','?
const DEFAULT_EXPAND = true;//expand '-abc' to '-a -b -c' (or '-abc=def' to '-a=def -b=def -c=def); BUT then multiple chars are not allowed for all `short`!!
const DEFAULT_ZERO_NULL = false;//parsing empty strings as (null) instead of ''!? disabled by default..

//
const getopt = global.getopt = (_vector, _parse = DEFAULT_PARSE, _parse_values = _parse, _assigned_list = DEFAULT_ASSIGN_LIST, _list = process.argv, _start = 0) => {
	if(Object.isObject(_vector)) _vector = prepareVector(_vector);
	const result = parseCommandLine(_vector, _list.slice(_start), _parse, _parse_values, _assigned_list);
	return result; };
	
//
export default getopt;
if(typeof this !== 'undefined') module.exports = getopt;

//
Reflect.defineProperty(getopt, 'vector', { get: () => [ ... VECTOR ] });

//
const findBestShort = (_index, _vector) => {
return Math.random.string.lower(1);//TODO/FIXME/!!
};

//
const vectorIncludesLongShortEnv = (_result, _key, _throw = false) => {
	if(_result.LONG.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'long') : true);
	else if(_result.SHORT.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'short') : true);
	else if(_result.ENV.has(_key)) return (_throw ? error('The getopt `%` vector key `%` is already defined as `%` item', null, 'long', _key, 'env') : true);
	return false; };
const appendIndex = (_result, _type, _key, _value, _inverse, _array = true) => { if(!_result[_type].has(_inverse ? _key : _value)) _result[_type].set(_inverse ? _key : _value,
	(_array ? [ _inverse ? _value : _key ] : (_inverse ? _value : _key))); else if(_array) _result[_type].get(_inverse ? _key : _value).push(_inverse ? _value : _key);
	else _result[_type].set(_inverse ? _key : _value, (_inverse ? _value : _key)); };
const prepareVector = (_vector) => { const result = Object.create(null); const keys = Object.keys(_vector); const VECT = [ ... VECTOR ]; const bestShortIndex = [];
	for(const v of VECT) { result[v.toUpperCase()] = new Map(); if(keys.includes(v.toUpperCase())) return error('The key `%` is a *reserved* getopt vector key', null, v.toUpperCase()); }
	for(var i = 0; i < keys.length; ++i) { const key = keys[i]; if(key.isUpperCase) return error('No getopt vector key may be *upper-case* only'); result[key] = Object.create(null);
		for(const vect of VECT) if(vect in _vector[key]) switch(vect) {
			case 'long': if(typeof _vector[key].long === 'boolean') { if(_vector[key].long) _vector[key].long = key; else break; }
				else if(!String.isString(_vector[key].long, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'long', key, 'String');
				else if(_vector[key].long[0] === '-') return error('The getopt `%` vector key `%` may not start with a dash `%`', null, 'long', key, '-');
				else if(_vector[key].long.includes(' ')) return error('The getopt `%` vector key `%` may not contain a space `%`', null, 'long', key, ' ');
				else if(_vector[key].long.includes('=')) return error('The getopt `%` vector key `%` may not contain a `%` assignment', null, 'long', key, '=');
				else if(_vector[key].long.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'long', key);
				else vectorIncludesLongShortEnv(result, _vector[key].long, true); result[key].long = _vector[key].long; appendIndex(result, 'LONG', key, _vector[key].long, false, false); break;
			case 'short': if(typeof _vector[key].short === 'boolean') { if(_vector[key].short) bestShortIndex.push(key); break; }
				else if(typeof _vector[key].short !== 'string') return error('The getopt `%` vector key `%` needs to be a (single character) %', null, 'short', key, 'String');
				else if(DEFAULT_EXPAND && _vector[key].short.length !== 1) return error('The getopt `%` vector key `%` needs to be a single character %', null, 'short', key, 'String');
				else if(_vector[key].short === '-') return error('The getopt `%` vector key `%` may not be a dash `%`', null, 'short', key, '-');
				else if(_vector[key].short === ' ') return error('The getopt `%` vector key `%` may not be a space `%`', null, 'short', key, ' ');
				else if(_vector[key].short === '=') return error('The getopt `%` vector key `%` may not be a `%` assignment', null, 'short', key, '=');
				else if(_vector[key].short.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'short', key);
				else vectorIncludesLongShortEnv(result, _vector[key].short, true); result[key].short = _vector[key].short; appendIndex(result, 'SHORT', key, _vector[key].short, false, false); break;
			case 'env': if(typeof _vector[key].env === 'boolean') { if(_vector[key].env) _vector[key].env = key; else break; }
				else if(!String.isString(_vector[key].env, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'env', key, 'String');
				else if(_vector[key].env[0] === '-') return error('The getopt `%` vector key `%` may not start with a dash `%`', null, 'env', key, '-');
				else if(_vector[key].env.includes(' ')) return error('The getopt `%` vector key `%` may not contain a space `%`', null, 'env', key, ' ');
				else if(_vector[key].env.includes('=')) return error('The getopt `%` vector key `%` may not contain a `%` assignment', null, 'env', key, '=');
				else if(_vector[key].env.binary) return error('The getopt `%` vector key `%` may not contain *binary data*', null, 'env', key);
				else vectorIncludesLongShortEnv(result, _vector[key].env, true); result[key].env = _vector[key].env; appendIndex(result, 'ENV', key, _vector[key].env, false, false); break;
			case 'args': if(typeof _vector[key].args === 'boolean') _vector[key].args = (_vector[key].args ? 1 : 0);
				else if(!Number.isInt(_vector[key].args) || _vector[key].args < 0) return error('The getopt `%` vector key `%` needs to be a positive % (or %)', null, 'args', key, 'Integer', 'zero');
				result[key].args = _vector[key].args; appendIndex(result, 'ARGS', key, _vector[key].args, false, true); break;
			case 'index'://boolean,integer(+/-) @ Math.getIndex();
			case 'parse'://boolean
			case 'list'://boolean
throw new Error('TODO');
				break;
			case 'group': if(!String.isString(_vector[key].group, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'group', key, 'String');
				else _vector[key].group = _vector[key].group.removeBinary();
				result[key].group = _vector[key].group; appendIndex(result, 'GROUP', key, _vector[key].group, false, true); break;
			case 'default': result[key].null = result[key].undefined = _vector[key].default;
				appendIndex(result, 'NULL', key, _vector[key].default, false, true); appendIndex(result, 'UNDEFINED', key, _vector[key].default, false, true); break;
			case 'null': result[key].null = _vector[key].null; appendIndex(result, 'NULL', key, _vector[key].null, false, true); break;
			case 'undefined': result[key].undefined = _vector[key].undefined; appendIndex(result, 'UNDEFINED', key, _vector[key].undefined, false, true); break;
			case 'clone':
throw new Error('TODO');
				break;
			case 'help': if(Number.isNumber(_vector[key].help)) _vector[key].help = _vector[key].help.toString();
				else if(!String.isString(_vector[key].help, false)) return error('The getopt `%` vector key `%` needs to be a non-empty %', null, 'help', key, 'String');
				result[key].help = _vector[key].help; appendIndex(result, 'HELP', key, _vector[key].help, true, false); break; }
		if(!Number.isInt(result[key].args)) result[key].args = 0; if(result[key].args <= 0) { result[key].args = 0; delete result[key].undefined; delete result[key].null; }
		if(!(result[key].long || result[key].short || result[key].env)) { result[key].long = key; appendIndex(result, 'LONG', key, key, false, false); }
		if(!result[key].long) result[key].long = ''; if(!result[key].short) result[key].short = ''; if(!result[key].env) result[key].env = '';
		if(!result[key].group) result[key].group = ''; if(!result[key].help) result[key].help = ''; }
	var bestIndex; for(const key of bestShortIndex) { if(!(bestIndex = findBestShort(key, result))) return error('Couldn\'t find best short index for item `%` in getopt vector', null, key);
		result[key].short = bestIndex; appendIndex(result, 'SHORT', key, bestIndex, false, false); } return result; };

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
const enqueue = (_vector, _state, _key, _args = 1) => { var item = null; if(String.isString(_key, false))
	{ for(var i = 0; i < _state.length; ++i) if(_state[i][0] === _key) item = _state[i]; } if(!item) {
	item = [ _key, _args ]; _state.push(item); } else item[1] += _args; return item[1]; };
const fill = (_result, _state, ... _args) => { if(_state.length === 0) return 0; var count;
	var item, key; for(count = 0; count < _args.length && _state.length > 0; ++count) { item = _state[0]; key = item[0];
		--item[1]; if(item[1] <= 0) _state.shift(); if(!_result[key]) _result[key] = [];
		_result[key].push(_args[count]); } return count; };
const todo = (_state) => { const result = []; for(var i = 0; i < _state.length; ++i) result[i] = _state[i][0]; return result; };
const left = (_key, _state) => { var result = 0; for(var i = 0; i < _state.length; ++i) if(_state[i][0] === _key) result = _state[i][1]; return result; };

const handle = {};

handle.value = (_result, _vector, _state, _word, _index, _list) => { if(!fill(_result, _state, _word)) _result.push(_word); };
handle.env = (_result, _vector, _state, _word, _index, _list, _item, _key) => { return error('TODO: handle.env();'); };
handle.short = (_result, _vector, _state, _word, _index, _list, _item, _key) => { if(_item.args === 0) {
	if(typeof _result[_key] === 'number') ++_result[_key]; else if(Array._isArray(_result[_key])) _result[_key].push(true);
	else _result[_key] = 1; } else enqueue(_vector, _state, _key, _item.args); };
handle.long = (_result, _vector, _state, _word, _index, _list, _item, _key) => { if(_item.args === 0) {
	if(typeof _result[_key] === 'number') ++_result[_key]; else if(Array._isArray(_result[_key])) _result[_key].push(true);
	else _result[_key] = 1; } else enqueue(_vector, _state, _key, _item.args); };

const parseCommandLine = (_vector, _list = process.argv, _parse = DEFAULT_PARSE, _parse_values = _parse, _assigned_list = DEFAULT_ASSIGN_LIST) => { const result = [], state = [], index = Object.create(null);
	for(const idx in _vector) if(!idx.isUpperCase) { result[idx] = []; state[idx] = []; index[idx] = 0; } _list = expandShorts(_list, _vector); var dashes; for(var i = 0; i < _list.length; ++i) {
	if(_list === '--') { result.push(... _list.slice(i)); break; } else dashes = 0; while(_list[i][dashes] === '-') ++dashes; dashes = Math.min(2, dashes);
	const orig = _list[i]; const word = _list[i].slice(dashes); if(!word.includes('=') || !tryAssignment(word, dashes, _vector, result, index, state, _assigned_list)) { var type = find(_vector, word, dashes, false);
	if(!compare(type, dashes)) type = 'value'; const key = (type === 'value' ? null : find(_vector, word, dashes, true)); if(type !== 'value') {
	++index[key]; } handle[type](result, _vector, state, (type === 'value' ? orig : word), i, _list, _vector[key], key);
	}} return parseCommandLine.handleResult(result, _vector, state, index, _list, _parse, _parse_values); };

parseCommandLine.handleResult = (_result, _vector, _state, _index, _list, _parse = DEFAULT_PARSE, _parse_values = _parse) => { const elements = _result.splice(0, _result.length);
	if(_parse_values) for(var i = 0; i < elements.length; ++i) elements[i] = parseValue(elements[i]); const unfinished = todo(_state); const keys = Object.keys(_result);
	var fill; for(var i = 0; i < keys.length; ++i) { const key = keys[i]; const vect = _vector[key]; if(unfinished.includes(key) && ('null' in vect) &&
	(fill = left(key, _state)) > 0) { if(Array._isArray(vect.null)) for(var j = _result[key].length, k = 0, l = (j % vect.null.length); k < fill; j++, k++, l = ((l + 1) % vect.null.length))
	_result[key][j] = vect.null[l]; else for(var j = _result[key].length, k = 0; k < fill; ++j, ++k) _result[key][j] = vect.null; } else if(_result[key].length === 0) { if(!('undefined' in vect) ||
	vect.args <= 0) _result[key] = _index[key]; else if(Array._isArray(vect.undefined)) for(var j = 0, k = 0, l = 0; k < vect.args; ++j, ++k, l = ((l + 1) % vect.undefined.length))
	_result[key][j] = vect.undefined[l]; else for(var j = 0, k = 0; k < vect.args; ++j, ++k) _result[key][j] = vect.undefined; } else { if(_parse) for(var j = 0; j < _result[key].length; ++j)
	_result[key][j] = parseValue(_result[key][j]); var sum = 0; for(var j = 0; j < _result[key].length; ++j) { if(typeof _result[key][j] === 'boolean') sum += (_result[key][j] ? 1 : -1);
	else { sum = null; break; }} if(sum !== null) { if(_result[key][0] === false) ++sum; _result[key] = sum; } if(_result[key].length === 1) { if(typeof _result[key][0] === 'boolean')
	_result[key] = (_result[key][0] ? 1 : 0); else _result[key] = _result[key][0]; }}} _result.push(... elements); return _result; };

const parseValue = (_string) => { if(typeof _string !== 'string') return _string;
	else if(_string.length === 0) return (DEFAULT_ZERO_NULL ? null : ''); else switch(_string.toLowerCase()) {
		case 'yes': return true; case 'no': return false; }
	if(!isNaN(_string)) return Number(_string); else if(_string[_string.length - 1] === 'n' &&
		!isNaN(_string.slice(0, -1))) return BigInt(_string.slice(0, -1));
	else if(RegExp.isRegExp(_string)) return RegExp.parse(_string); return _string; };

const tryAssignment = (_word, _dashes, _vector, _result, _index, _state, _assigned_list = DEFAULT_ASSIGN_LIST) => { if(!DEFAULT_ASSIGN) return null;
	const idx = _word.indexOf('='); if(idx === -1) return false; const key = _word.substr(0, idx); const value = tryAssignment.checkAssignedList(_word.substr(idx + 1), _assigned_list);
	const given = find(_vector, key, _dashes, true); if(!given) return false; else if(typeof value === 'string') _result[given] = [ value ]; else _result[given] = value;
	++_index[given]; for(var i = 0; i < _state.length; ++i) if(_state[i][0] === given) _state.splice(i--, 1); return true; };

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
const showHelp = (_vector) => {
};

const callHelp = (_vector) => {
};

//

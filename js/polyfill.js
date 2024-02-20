//
// Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
// https://kekse.biz/
//
// I don't really know if this is complete to use my `getopt.js`,
// but it should work.. it's a polyfill, since I'm using my own library
// within the `getopt.js`, see <https://github.com/kekse1/v4/>.
//

//
Reflect.defineProperty(Object, 'isObject', { value: (... _args) => {
	if(_args.length === 0) return null;
	else for(var i = 0; i < _args.length; ++i) if(typeof _args[i] !== 'object' || _args[i] === null) return false;
	return true; }});

//
Reflect.defineProperty(String, 'isString', { value: (_item, _empty = true) => {
	if(typeof _item !== 'string') return false;
	else if(typeof _empty === 'boolean') return (_empty || (_item.length > 0));
	else if(!Number.isInt(_empty)) return true;
	else if(_empty < 1) return true;
	return (_item.length >= _empty); }});

//
Reflect.defineProperty(Number, 'isNumber', { value: (... _args) => {
	if(_args.length === 0) return null;
	else for(var i = 0; i < _args.length; ++i) {
		if(typeof _args[i] !== 'number') return false;
		else if(! Number.isFinite(_args[i])) return false;
		else if(Number.isNaN(_args[i])) return false; }
	return true; }});

Reflect.defineProperty(Number, 'isInt', { value: (... _args) => {
	if(_args.length === 0) return null;
	else if(! Number.isNumber(... _args)) return false;
	else for(var i = 0; i < _args.length; ++i) if((_args[i] % 1) !== 0) return false;
	return true; }});

Reflect.defineProperty(Number, 'isFloat', { value: (... _args) => {
	if(_args.length === 0) return null;
	else if(! Number.isNumber(... _args)) return false;
	else for(var i = 0; i < _args.length; ++i) if((_args[i] % 1) === 0) return false;
	return true; }});

//
Reflect.defineProperty(String.prototype, 'removeBinary', { value: function(_remove_space = false)
{ const text = this.valueOf(); var result = ''; var code; for(const char of text) {
		if((code = char.codePointAt(0)) >= (_remove_space ? 31 : 22) && code !== 127) result += char;
	return result; }}});

Reflect.defineProperty(String.prototype, 'binary', { get: function()
{
	if(this.length === 0) return null; var byte; for(var i = 0; i < this.length; ++i)
		if((byte = this.charCodeAt(i)) < 32 || byte === 127) return true; return false; }});


//
Reflect.defineProperty(RegExp, 'isRegExp', { value: (... _args) => {
	if(_args.length === 0) return null;
	else for(var i = 0; i < _args.length; ++i) {
		if(! Reflect.is(_args[i], 'RegExp')) {
			if(String.isString(_args[i]) && _args[i][0] === '/' && _args[i].lastIndexOf('/', 1) > -1) {
				try { RegExp.parse(_args[i]); continue; }
				catch(_err) { return false; }}
			return false; }}
	return true; }});

Reflect.defineProperty(RegExp, 'parse', { value: (_string, _throw = DEFAULT_THROW) => {
	if(!String.isString(_string, false)) return error('Invalid % argument', null, '_string');
	const startedWithSlash = (_string[0] === '/'); if(startedWithSlash) _string = _string.substr(1);
	const lastIdx = _string.lastIndexOf('/'); if(startedWithSlash && lastIdx <= 0)
		return (_throw ? error('Invalid % argument (no % recognized)', null, '_string', 'RegExp') : null);
	var modifiers = ''; if(lastIdx > -1) { if(lastIdx < (_string.length - 1)) modifiers = _string.substr(lastIdx + 1);
	_string = _string.substring(0, lastIdx); } try { return new RegExp(_string, modifiers); } catch(_error) {
		return (_throw ? error(_error) : null); }}});

//
const _ownKeys = Reflect.ownKeys.bind(Reflect);

Reflect.defineProperty(Reflect, '_ownKeys', { value: _ownKeys });
Reflect.defineProperty(Reflect, 'ownKeys', { value: (... _args) => {
	try { return _ownKeys(... _args); } catch(_error) {}; return []; }});

//
Reflect.defineProperty(Reflect, 'clone', { value: (_object, _map = null, _function = DEFAULT_CLONE_FUNCTION, ... _clone_args) => {
	if(!_map) _map = new Map(); else if(_map.has(_object)) return _map.get(_object); else if(!Reflect.isExtensible(_object)) return _object;
	else if(typeof _object === 'undefined' || _object === null) return _object; const keys = Reflect.ownKeys(_object);
	var cloneFunc; if(typeof _object.clone === 'function') cloneFunc = _object.clone.bind(_object, ... _clone_args); else if(typeof _object.cloneNode === 'function')
		cloneFunc = _object.cloneNode.bind(_object, true, ... _clone_args); else cloneFunc = null; if(cloneFunc === null && !Reflect.isExtensible(_object)) {
			_map.set(_object, _object); return _object; } const isArray = (cloneFunc !== null ? -1 : (Array._isArray(_object) ?
			_object.length : -1)); var result; if(cloneFunc !== null) { result = cloneFunc(); _map.set(_object, result); return result; }
	else if(isArray > -1) { result = new Array(isArray); for(var i = 0; i < _object.length; ++i) { keys.remove(i.toString()); result[i] = Reflect.clone(_object[i], _map, _function,
		... _clone_args); keys.remove('length'); }} else if(typeof _object === 'function') { if(Function.isNative(_object) || !_function) result = _object;
			else try { eval('result = ' + _object.toString()); } catch(_error) { result = _object; } keys.remove('length', 'name', 'arguments', 'caller', 'prototype'); }
	else if(Object.isNull(_object)) result = Object.create(null); else try { result = Object.create(Reflect.getPrototypeOf(_object)); }
	catch(_error) { result = {}; } _map.set(_object, result); _map.set(result, result); var desc; for(var i = 0; i < keys.length; ++i) {
		try { desc = Reflect.getOwnPropertyDescriptor(_object, keys[i]);
			if('value' in desc) { desc.value = Reflect.clone(desc.value, _map, _function, ... _clone_args); delete desc.get; delete desc.set; }
			else {	if(typeof desc.get === 'function') desc.get = Reflect.clone(desc.get, _map, _function, ... _clone_args); else delete desc.get;
				if(typeof desc.set === 'function') desc.set = Reflect.clone(desc.set, _map, _function, ... _clone_args); else delete desc.set; }
		} catch(_err) { desc = { value: _object[keys[i]] }; } Reflect.defineProperty(result, keys[i], desc); } return result; }});

Reflect.defineProperty(Object, 'clone', { value: Reflect.clone });

Reflect.defineProperty(Reflect, 'is', { value: (_object, ... _args) => {
	var className = true; for(var i = 0; i < _args.length; ++i) {
		if(typeof _args[i] === 'boolean') className = _args.splice(i--, 1)[0];
		else if(!String.isString(_args[i], false)) _args.splice(i--, 1); }
	const tryConstructorName = () => {
		try { return _object.constructor.name; }
		catch(_error) { return ''; }};
	const tryClassName = () => {
		try { return _object.name; }
		catch(_error) { return ''; }};
	if(_args.length > 0) _args = _args.unique();
	var result;
	if(typeof _object === 'undefined') result = 'undefined';
	else if(_object === null) result = 'null';
	else if(Object.isNull(_object)) result = 'Object[null]';
	else result = tryConstructorName();
	if(!result && className) result = tryClassName();
	if(!result && _args.length > 0) return false;
	else if(_args.length === 0) return result;
	return _args.includes(result); }});

Reflect.defineProperty(Object, 'isNull', { value: (... _args) => {
	if(_args.length === 0) return null;
	else for(var i = 0; i < _args.length; ++i) {
		if(typeof _args[i] !== 'object' || _args[i] === null) return false;
		else if(Reflect.getPrototypeOf(_args[i]) !== null) return false; }
	return true;
}});

//
Reflect.defineProperty(Array.prototype, 'unique', { value: function()
{ return Array.from(new Set(this.valueOf())); }});

Reflect.defineProperty(Array, '_isArray', { value: Array.isArray });

//
Reflect.defineProperty(process, 'aTTY', { get: () => {
	if(process.stdout.isTTY) return process.stdout;
	else if(process.stderr.isTTY) return process.stderr;
	return null; }});
Reflect.defineProperty(console, 'width', { get: () => {
	const tty = process.aTTY; if(!tty) return 0;
	return tty.rows; }});

//too simple version.. my library provides smth. w/ own String.format(), etc..
//so you'll only see '%' in the error message where I used String.printf(); ..
Reflect.defineProperty(global, 'error', { value: (_error, ... _args) => {
	throw new Error(_error);
}});

//
Reflect.defineProperty(String, 'fill', { value: (_count, _string) => (''.fill(_count, _string)) });
Reflect.defineProperty(String.prototype, 'fill', { value: function(_count, _string) {
	if(typeof _string !== 'string') return error('Invalid % argument', null, '_string');
	else if(_string.length === 0) return this.valueOf();
	if(!Number.isInt(_count)) return error('Invalid % argument (no %)', null, '_count', 'Integer');
	else if(_count <= 0) return this.valueOf(); var result = this.valueOf();
	for(var i = 0, j = 0; i < _count; ++i, j = (j + 1) % _string.length)
	result += _string[j]; return result; }});

//


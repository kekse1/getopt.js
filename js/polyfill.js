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
//
const _ownKeys = Reflect.ownKeys.bind(Reflect);

Reflect.defineProperty(Reflect, '_ownKeys', { value: _ownKeys });
Reflect.defineProperty(Reflect, 'ownKeys', { value: (... _args) => {
	try { return _ownKeys(... _args); } catch(_error) {}; return []; }});

//
Reflect.defineProperty(Reflect, 'clone', { value: (_object, _map = null, _function = DEFAULT_CLONE_FUNCTION, ... _clone_args) => {
	if(!_map) _map = new Map(); else if(_map.has(_object)) return _map.get(_object); else if(!Reflect.isExtensible(_object)) return _object;
	else if(typeof _object === 'undefined' || _object === null) return _object; const keys = Reflect.ownKeys(_object);
	const isArray = (Array._isArray(_object) ? _object.length : -1); var result; var hasCloneFunc = false; try {
		hasCloneFunc = (typeof _object.clone === 'function'); } catch(_err) {} if(hasCloneFunc) result = _object.clone(... _clone_args);
	else if(isArray > -1) { result = new Array(isArray); for(var i = 0; i < _object.length; ++i)
		result[i] = Reflect.clone(_object[i], _map, _function, ... _clone_args); for(var i = _object.length - 1; i >= 0; --i)
			keys.remove(i.toString()); keys.remove('length'); } else if(typeof _object === 'function') {
		if(Function.isNative(_object) || !_function) result = _object; else try { eval('result = ' + _object.toString()); } catch(_error) {
			result = _object; } keys.remove('length', 'name', 'arguments', 'caller', 'prototype'); }
	else if(Object.isNull(_object)) result = Object.create(null); else try { result = Object.create(Reflect.getPrototypeOf(_object)); }
	catch(_error) { result = {}; } _map.set(_object, result); _map.set(result, result); var desc; for(var i = 0; i < keys.length; ++i) {
	try { desc = Reflect.getOwnPropertyDescriptor(_object, keys[i]); } catch(_err) { desc = { value: _object[keys[i]] }; }
		if('value' in desc) desc.value = Reflect.clone(desc.value, _map, _function, ... _clone_args);
		else { if('get' in desc) desc.get = Reflect.clone(desc.get, _map, _function, ... _clone_args);
			if('set' in desc) desc.set = Reflect.clone(desc.set, _map, _function, ... _clone_args); }
	Reflect.defineProperty(result, keys[i], desc); } return result; }});

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

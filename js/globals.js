/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://norbert.com.es/
 */

//
const DEFAULT_FIXED = true;
const DEFAULT_UNIT_PREC = 2;
const DEFAULT_UNIT_BASE = 1024;
const DEFAULT_STYLES = false;
const DEFAULT_TIME_LONG = true;
const DEFAULT_TIME_SEP = ', ';
const DEFAULT_CLONE_FUNCTION = false;
const DEFAULT_OBJECT_SEP = '.';
const DEFAULT_OBJECT_NUL = true;
const DEFAULT_OBJECT_SET_BOOL = false;
const DEFAULT_TRUE = 'yes';
const DEFAULT_FALSE = 'no';
const DEFAULT_CAST_REGEXP = false;
const DEFAULT_TIME_MILLISEC = true;

//
if(typeof window === 'undefined')
{
	Reflect.defineProperty(global, 'BROWSER', { get: () => false });
	Reflect.defineProperty(global, 'window', { get: () => global });
}
else
{
	Reflect.defineProperty(window, 'BROWSER', { get: () => true });
	Reflect.defineProperty(window, 'global', { get: () => window });
}

//
export default global;

//
import MultiSet from './multiset.js';
global.MultiSet = MultiSet;
import JSON from './json.js';
import ID from './id.js';
global.id = global.ID = global.uuid = global.UUID = ID;

//
if(typeof global.__globals !== 'number')
{
	//
	global.__globals = Date.now();

	//
	global._isNaN = global.isNaN;
	global.isNaN = (... _args) => {
		if(typeof _args[0] === 'string' && _args[0].length === 0)
			return true;
		return global._isNaN(... _args);
	};

	//
	global.numeric = (_value, _string = false, _bigint = true) => {
		var result;

		if(typeof _value === 'number')
		{
			if(!Number.isFinite(_value))
			{
				result = false;
			}
			else if(Number.isNaN(_value))
			{
				result = false;
			}
			else
			{
				result = true;
			}
		}
		else if(_bigint && typeof _value === 'bigint')
		{
			result = true;
		}
		else if(_string && typeof _value === 'string')
		{
			result = !isNaN(_value);
		}
		else
		{
			result = false;
		}

		return result;
	};

	global.byte = (_value) => (int(_value) && _value >= 0 && _value <= 255);

	global.number = (_value) => global.numeric(_value, false, false);

	global.int = (_value, _string = false) => {
		if(global.numeric(_value, _string, false))
		{
			return ((_value % 1) === 0);
		}

		return false;
	};

	global.float = (_value, _string = false) => {
		if(global.numeric(_value, _string, false))
		{
			return ((_value % 1) !== 0);
		}

		return false;
	};

	global.string = (_value, _empty = true, _max = null) => {
		var result;

		if(typeof _value !== 'string')
		{
			return false;
		}
		else if(typeof _empty === 'boolean')
		{
			result = (_empty || _value !== '');
		}
		else if(!int(_empty))
		{
			result = true;
		}
		else if(_empty < 1)
		{
			result = true;
		}
		else
		{
			result = (_value.length >= _enpty);
		}

		if(result && int(_max))
		{
			result = (_value.length <= _max);
		}

		return result;
	};

	global.array = (_value, _empty = true, _max = null) => {
		var result;

		if(!Array.isArray(_value))
		{
			return false;
		}
		else if(typeof _empty === 'boolean')
		{
			result = (_empty || _value.length > 0);
		}
		else if(!int(_empty))
		{
			result = true;
		}
		else if(_empty < 1)
		{
			result = true;
		}
		else
		{
			result = (_value.length >= _empty);
		}

		if(result && int(_max))
		{
			result = (_value.length <= _max);
		}
		
		return result;
	};

	global.bigint = (_value) => (typeof _value === 'bigint');
	global.bool = (_value) => (typeof _value === 'boolean');
	global.func = (_value) => (typeof _value === 'function');
	global.object = (_value) => (typeof _value === 'object' && _value !== null);
	global.regexp = (_value) => RegExp.isRegExp(_value);
	global.nul = (_value) => (_value === null);
	global.undef = (_value) => (typeof _value === 'undefined');
	global.data = (_value) => {
		if(Reflect.is(_value, 'Uint8Array'))
		{
			return true;
		}
		else if(Reflect.is(_value, 'Buffer'))
		{
			return true;
		}

		return false;
	};

	//
	Reflect.defineProperty(Number, 'RADIX_MIN', { value: 2 });
	Reflect.defineProperty(Number, 'RADIX_MAX', { value: 36 });

	Reflect.defineProperty(Number, 'isRadix', { value: (_value) => {
		if(!int(_value)) return false;
		return (_value >= 2 && _value <= 36); }});
	global.isRadix = Number.isRadix.bind(Number);

	//
	const _ownKeys = Reflect.ownKeys.bind(Reflect);

	Reflect.defineProperty(Reflect, 'ownKeys', { value: (_item) => {
		try
		{
			return _ownKeys(_item);
		}
		catch(_err)
		{
		}

		return null;
	}});

	Reflect.defineProperty(Reflect, 'clone', { value: (_object, _map = null, _function = DEFAULT_CLONE_FUNCTION, ... _clone_args) => {
		if(!_map) _map = new Map(); else if(_map.has(_object)) return _map.get(_object); else if(!Reflect.isExtensible(_object)) return _object;
		else if(typeof _object === 'undefined' || _object === null) return _object; const keys = Reflect.ownKeys(_object);
		var cloneFunc; if(typeof _object?.clone === 'function') cloneFunc = _object.clone.bind(_object, ... _clone_args); else if(typeof _object?.cloneNode === 'function')
			cloneFunc = _object.cloneNode.bind(_object, true, ... _clone_args); else cloneFunc = null; if(cloneFunc === null && !Reflect.isExtensible(_object)) {
				_map.set(_object, _object); return _object; } const isArray = (cloneFunc !== null ? -1 : (Array.isArray(_object) ?
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
	global.clone = Reflect.clone;

	Reflect.defineProperty(Object, 'null', { value: (... _args) => {
		const result = Object.create(null);
		for(var i = 0; i < _args.length; ++i)
			if(Reflect.isExtensible(_args[i]))
				Object.assign(result, _args.splice(i--, 1)[0]);
		return result;
	}});

	Reflect.defineProperty(Reflect, 'isExtensible', { value: (_item) => Object.isExtensible(_item) });

	//
	Reflect.defineProperty(RegExp, 'parse', { value: (_value) => {
		if(Reflect.is(_value, 'RegExp'))
		{
			return _value;
		}
		else if(typeof _value !== 'string' || _value.length === 0)
		{
			return null;
		}

		const startedWithSlash = (_value[0] === '/');

		if(startedWithSlash)
		{
			_value = _value.substr(1);
		}

		const lastIdx = _value.lastIndexOf('/');

		if(startedWithSlash && lastIdx === -1)
		{
			return null;
		}

		var modifiers = '';

		if(lastIdx > -1)
		{
			if(lastIdx < (_value.length - 1))
			{
				modifiers = _value.substr(lastIdx + 1);
			}

			_value = _value.substr(0, lastIdx);
		}

		var result;

		try
		{
			result = new RegExp(_value, modifiers);
		}
		catch(_err)
		{
			result = null;
		}

		return result;
	}});

	Reflect.defineProperty(RegExp, 'isRegExp', { value: (_item) => {
		if(Reflect.is(_item, 'RegExp'))
		{
			return true;
		}
		else if(typeof _item === 'string' && _item.length >= 2)
		{
			if(_item[0] === '/' && _item.lastIndexOf('/', 1) > -1)
			{
				if(RegExp.parse(_item))
				{
					return true;
				}
			}
		}

		return false;
	}});

	//
	Reflect.defineProperty(Date.prototype, 'format', { value: function()
	{
		return this.toUTCString();
	}});

	Reflect.defineProperty(Date, 'format', { value: (_date = new Date()) => _date.format() });

	//
	const _indexOf = String.prototype.indexOf;
	const _lastIndexOf = String.prototype.lastIndexOf;

	Reflect.defineProperty(String.prototype, 'indexOf', { value: function(_needle, _position = 0, _case_sensitive = true)
	{
		if(typeof _case_sensitive !== 'boolean')
		{
			_case_sensitive = true;
		}

		if(typeof _position !== 'number')
		{
			_position = 0;
		}

		if(_case_sensitive)
		{
			return _indexOf.call(this.valueOf(), _needle, _position);
		}
		else
		{
			_needle = _needle.toLowerCase();
		}

		return _indexOf.call(this.toLowerCase(), _needle, _position);
	}});

	Reflect.defineProperty(String.prototype, 'lastIndexOf', { value: function(_needle, _position = +Infinity, _case_sensitive = true)
	{
		if(typeof _case_sensitive !== 'boolean')
		{
			_case_sensitive = true;
		}

		if(typeof _position !== 'number')
		{
			_position = +Infinity;
		}

		if(_case_sensitive)
		{
			return _lastIndexOf.call(this.valueOf(), _needle, _position);
		}
		else
		{
			_needle = _needle.toLowerCase();
		}

		return _lastIndexOf.call(this.toLowerCase(), _needle, _position);
	}});

	Reflect.defineProperty(String.prototype, 'indicesOf', { value: function(_needle, _case_sensitive = true)
	{
		if(typeof _needle !== 'string')
		{
			throw new Error('Invalid _needle argument');
		}
		else if(typeof _case_sensitive !== 'boolean')
		{
			_case_sensitive = true;
		}

		if(! _case_sensitive)
		{
			_needle = _needle.toLowerCase();
		}

		const result = [];
		const string = (_case_sensitive ? this.valueOf() : this.toLowerCase());
		var index = 0;
		var last = -1;

		do
		{
			if((last = _indexOf.call(string, _needle, last + 1)) > -1)
			{
				result[index++] = last;
			}
		}
		while(last > -1);

		return result;
	}});

	//
	Reflect.defineProperty(String.prototype, 'repeat', { value: function(_count = 2)
	{
		var result = '';
		while(--_count >= 0) result += this.valueOf();
		return result;
	}});

	//
	Reflect.defineProperty(String, 'quote', { get: () => {
		return [ '`', '\'', '"' ];
	}});

	Reflect.defineProperty(String.prototype, 'quotes', { get: function()
	{
		if(this.length === 0) return false; const q = String.quote;
		for(const quote of q) if(this.includes(quote)) return true;
		return false;
	}});

	Reflect.defineProperty(String.prototype, 'quoted', { get: function()
	{
		if(this.length === 0) return false;
		else if(this[0] !== this[this.length - 1]) return false;
		return String.quote.includes(this[0]);
	}});

	Reflect.defineProperty(String.prototype, 'unquote', { value: function(_unescape = true)
	{
		if(this.length < 2) return this.valueOf();
		else if(this[0] !== this[this.length - 1]) return this.valueOf();
		else if(!String.quote.includes(this[0])) return this.valueOf();
		const quote = this[0]; if(!_unescape) return this.slice(1, -1);
		var result = ''; for(var i = 1; i < this.length - 1; ++i) {
			if(this.at(i, '\\' + quote)) result += this[++i];
			else result += this[i]; } return result;
	}});

	Reflect.defineProperty(String.prototype, 'quote', { value: function(_quote = true, _escape = true)
	{
		if(!_quote)
		{
			return this.valueOf();
		}

		const selectQuote = () => {
			const quote = String.quote;
			const orig = [ ... quote ];

			for(var i = 0; i < quote.length; ++i)
			{
				quote[i] = [ quote[i], this.indicesOf(quote[i]).length ];
			}

			quote.sort(1, true);
			const same = [ quote[0][0] ];

			for(var i = 1; i < quote.length; ++i)
			{
				if(quote[i][1] === quote[0][1])
				{
					same[i] = quote[i][0];
				}
				else
				{
					break;
				}
			}

			var res;

			for(var i = 0; i < orig.length; ++i)
			{
				if(same.includes(orig[i]))
				{
					res = orig[i];
					break;
				}
			}

			return res;
		};

		if(typeof _escape !== 'boolean')
		{
			_escape = true;
		}

		if(!string(_quote, false))
		{
			_quote = selectQuote();
		}

		//
		var result;
		
		if(_escape)
		{
			result = '';
			
			for(var i = 0; i < this.length; ++i)
			{
				if(this.at(i, _quote))
				{
					result += (_quote + this[i]);
				}
				else
				{
					result += this[i];
				}
			}
		}
		else
		{
			result = this.valueOf()
		}

		return (_quote + result + _quote);
	}});

	//
	Reflect.defineProperty(String.prototype, 'reverse', { value: function()
	{
		var result = '';

		for(var i = this.length - 1; i >= 0; --i)
		{
			result += this[i];
		}

		return result;
	}});

	Reflect.defineProperty(String.prototype, 'tryCast', { value: function(_empty_true = false)
	{
		var result = this.valueOf();

		if(result.length === 0)
		{
			return (_empty_true ? true : result);
		}
		else if(!isNaN(result))
		{
			result = Number(result);
		}
		else switch(result.toLowerCase())
		{
			case 'no': result = false; break;
			case 'yes': result = true; break;
			case 'null': result = null; break;
			case 'undefined': result = undefined; break;
			default:
				if(DEFAULT_CAST_REGEXP && RegExp.isRegExp(result))
				{
					const regexp = RegExp.parse(result);
					if(regexp) result = regexp;
				}
				break;
		}
		
		return result;
	}});

	Reflect.defineProperty(String, 'tryCast', { value: (_value, _empty_true = false) => {
		if(typeof _value !== 'string')
		{
			return _value;
		}
		else if(_value.length === 0)
		{
			return (_empty_true ? true : '');
		}
		
		return _value.tryCast(_empty_true);
	}});

	Reflect.defineProperty(String.prototype, '_at', { value: String.prototype.at });
	Reflect.defineProperty(String.prototype, 'at', { value: function(_index, _needle, _case_sensitive = true)
	{
		if(typeof _needle !== 'string')
		{
			return String.prototype._at.call(this, _index);
		}
		else if((_index = Math.getIndex(_index, this.length)) === null)
		{
			return (_needle.length === 0);
		}
		else if(_needle.length === 0)
		{
			return false;
		}
		else if(_needle.length > (this.length - _index))
		{
			return false;
		}

		var cmp = this.substr(_index, _needle.length);

		if(!_case_sensitive)
		{
			_needle = _needle.toLowerCase();
			cmp = cmp.toLowerCase();
		}

		return (cmp === _needle);
	}});

	Reflect.defineProperty(String.prototype, 'removeBinary', { value: function(_space = false)
	{
		if(this.length === 0)
		{
			return '';
		}

		var result = '';
		var byte;

		for(var i = 0; i < this.length; ++i)
		{
			if((byte = this.charCodeAt(i)) <= (_space ? 32 : 31) || byte === 127)
			{
				continue;
			}

			result += this[i];
		}

		return result;
	}});

	//
	Reflect.defineProperty(String.prototype, 'isEmpty', { get: function()
	{
		var byte; for(var i = 0; i < this.length; ++i)
		{
			if((byte = this.charCodeAt(i)) >= 32 && byte !== 127)
			{
				return false;
			}
		}

		return true;
	}});

	//
	Reflect.defineProperty(Array.prototype, 'unique', { value: function()
	{
		return Array.from(new Set(this.valueOf()));
	}});

	//
	Reflect.defineProperty(Object, 'isNull', { value: (_item) => {
		if(typeof _item !== 'object' || _item === null) return false;
		else if(Reflect.getPrototypeOf(_item) !== null) return false;
		return true;
	}});

	//
	Reflect.defineProperty(Reflect, 'className', { value: (_item) => Reflect.is(_item, true) });

	Reflect.defineProperty(Reflect, 'is', { value: (_item, ... _args) => {
		var className = true; for(var i = 0; i < _args.length; ++i) {
			if(bool(_args[i])) className = _args.splice(i--, 1)[0];
			else if(!string(_args[i])) _args.splice(i--, 1); }
		if(_args.length > 0) _args = _args.unique();
		const tryConstructorName = () => {
			try { return _item.constructor.name; }
			catch(_error) { return ''; }};
		const tryClassName = () => {
			try { return _item.name; }
			catch(_error) { return ''; }};
		var result;
		if(typeof _item === 'undefined') result = 'undefined';
		else if(_item === null) result = 'null';
		else if(Object.isNull(_item)) result = 'Object[null]';
		else result = tryConstructorName();
		if(!result && className) result = tryClassName();
		if(!result && _args.length > 0) return false;
		else if(_args.length === 0) return result;
		return _args.includes(result);
	}});

	Reflect.defineProperty(global, 'is', { value: Reflect.is.bind(Reflect) });

	Reflect.defineProperty(Reflect, 'was', { value: (_item, ... _args) => {
		for(var i = _args.length - 1; i >= 0; --i)
			if(!string(_args[i])) _args.splice(i, 1);
		if(_args.length > 0) _args = _args.unique();
		const result = []; const prototypes = Reflect.getPrototypesOf(_item);
		if(prototypes.length === 0) return (_args.length === 0 ? [] : false);
		var name; for(var i = 0, j = 0; i < prototypes.length; ++i)
			if(string(name = Reflect.className(prototypes[i])))
				result[j++] = name;
		if(_args.length === 0) return result;
		for(var i = 0; i < result.length; ++i)
			if(_args.includes(result[i])) return true; return false;
	}});

	Reflect.defineProperty(global, 'was', { value: Reflect.was.bind(Reflect) });

	Reflect.defineProperty(Reflect, 'getPrototypesOf', { value: (_item) => {
		const result = []; var proto = _item; try { do {
			if(proto = Reflect.getPrototypeOf(proto)) {
				result.push(proto);
				if(proto.constructor.name) {
					if(result[proto.constructor.name])
					{
						if(!Array.isArray(result[proto.constructor.name]))
							result[proto.constructor.name] = [
								result[proto.constructor.name] ];
						result[proto.constructor.name].push(proto);
					}
					else result[proto.constructor.name] = proto; }
			}
			else break; }
		while(true); } catch(_err) {}; return result;
	}});

	//
	Reflect.defineProperty(Math, 'logBase', { value: (_base, _value) => {
		return (Math.log(_value) / Math.log(_base));
	}});
	
	//
	Reflect.defineProperty(Math, 'getIndex', { value: (_index, _length) => {
		if(_length < 1)
		{
			return null;
		}
		else if((_index %= _length) < 0)
		{
			_index = ((_length + _index) % _length);
		}

		return _index;
	}});

	Reflect.defineProperty(Math, 'int', { value: (_value, _prec = 0, _inverse = false) => {
		const a = (_value < 0);
		const b = (!!_inverse);
		return ((((a&&b)||!(a||b)) ? Math.floor : Math.ceil)(_value, _prec)); }});

	Reflect.defineProperty(Math, '_round', { value: Math.round });
	Reflect.defineProperty(Math, '_ceil', { value: Math.ceil });
	Reflect.defineProperty(Math, '_floor', { value: Math.floor });

	Reflect.defineProperty(Math, 'round', { value: (_value, _prec = 0) => {
		if(_prec <= 0)
		{
			return Math._round(_value);
		}

		const coefficient = Math.pow(10, _prec);
		return (Math._round(_value * coefficient) / coefficient);
	}});

	Reflect.defineProperty(Math, 'ceil', { value: (_value, _prec = 0) => {
		if(_prec <= 0)
		{
			return Math._ceil(_value);
		}

		const coefficient = Math.pow(10, _prec);
		return (Math._ceil(_value * coefficient) / coefficient);
	}});

	Reflect.defineProperty(Math, 'floor', { value: (_value, _prec = 0) => {
		if(_prec <= 0)
		{
			return Math._floor(_value);
		}

		const coefficient = Math.pow(10, _prec);
		return (Math._floor(_value * coefficient) / coefficient);
	}});

	Reflect.defineProperty(Math, 'size', { value: (_value, _unit_base = DEFAULT_UNIT_BASE, _prec = DEFAULT_UNIT_PREC, _fixed = DEFAULT_FIXED, _styles = DEFAULT_STYLES) => {
		if(bigint(_value))
		{
			_value = Number(_value);
		}
		else if(!number(_value))
		{
			return '-/-';
		}

		const negative = (_value < 0);
		var rest = Math.abs(_value);
		var index;
		var base;
		
		if(string(_unit_base))
		{
			[ index, base ] = Math.size.getUnit(_unit_base);
		}
		else
		{
			index = 0;
			
			if(int(_unit_base))
			{
				base = _unit_base;
			}
			else
			{
				base = 1024;
			}
		}

		if(rest < _unit_base)
		{
			var result = Math.round(_value, _prec).toLocaleString();

			if(_styles)
			{
				result = result.bold(true);
			}

			var unit = Math.size.unit[base][0];
			if(rest === 1 && unit[unit.length - 1] === 's')
				unit = unit.slice(0, -1);

			return (result + ' ' + unit);
		}
		
		if(index > 0) for(var i = 0; i < index; ++i)
		{
			rest /= base;
		}
		else while(rest >= base)
		{
			rest /= base;
			++index;
		}

		if(negative)
		{
			rest = -rest;
		}

		const orig = rest;
		var unit = Math.size.unit[base][index];
		
		if(_fixed)
		{
			rest = rest.toFixed(_prec);
		}
		else
		{
			rest = Math.round(rest, _prec);
		}
		
		var result = rest.toLocaleString();
		
		if(_styles)
		{
			result = result.bold(true);
		}

		if(index === 0)
		{
			if(Math.abs(rest) === 1 && unit[unit.length - 1] === 's')
			{
				unit = unit.slice(0, -1);
			}
			
			return (result + ' ' + unit);
		}
		
		return (result + ' ' + unit);
	}});

	Math.size.styled = (_value, _unit_base = DEFAULT_UNIT_BASE, _prec = DEFAULT_UNIT_PREC, _fixed = DEFAULT_FIXED) => Math.size(_value, _unit_base, _prec, _fixed, true);

	Math.size.getUnit = (_unit, _fallback = 0) => {
		if(!(_unit = _unit.trim()))
		{
			return [ _fallback, 1024 ];
		}
		else if((_unit = _unit.toLowerCase()) === 'b' || _unit === 'byte' || _unit === 'bytes')
		{
			return 0;
		}
		
		var base;
		var units;
		
		if(_unit.includes('i'))
		{
			units = Math.size.unit[base = 1024];
		}
		else
		{
			units = Math.size.unit[base = 1000];
		}
		
		for(var i = 0; i < units.length; ++i)
		{
			if(units[i].toLowerCase() === _unit)
			{
				return [ i, base ];
			}
		}
		
		return [ _fallback, base ];
	};

	Math.size.unit = {};
	Math.size.unit['1000'] = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
	Math.size.unit['1024'] = [ 'Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ];

	Reflect.defineProperty(Math, 'time', { value: (_value, _long = DEFAULT_TIME_LONG, _styles = DEFAULT_STYLES, _millisec = DEFAULT_TIME_MILLISEC, _sep = DEFAULT_TIME_SEP) => {
		if(bigint(_value))
		{
			_value = Number(_value / 1000000n);
		}
		else if(!number(_value))
		{
			return '-/-';
		}

		const orig = _value;

		const append = (_value, _unit) => { if(_value < 1) return;
			if(_long && (_value = Math.int(_value)) === 1 &&
					_unit[_unit.length - 1] === 's')
				_unit = _unit.slice(0, -1);
			if(index === 0 && orig >= 1000 && !_millisec) return;
			var res = Math.int(_value).toString();
			if(_styles) res = res.bold(true);
			return (result = (res + _unit + _sep) + result); };

		const unit = Math.time.unit;
		var result = '';
		var index = -1;
		var u, v;

		if(_value < 1)
		{
			return '0';
		}
		else while(_value >= 1)
		{
			if(!(u = unit[++index]))
			{
				break;
			}

			v = _value;
			if(u[0] > 1) v %= u[0];
			append(v, _long ? ' ' + u[1] : u[2]);
			if(u[0] > 0) _value /= u[0];
			else break;
		}

		result = result.slice(0, -_sep.length);
		return result.trim();
	}});

	Math.time.styled = (_value, _long = DEFAULT_TIME_LONG, _millisec = DEFAULT_TIME_MILLISEC, _sep = DEFAULT_TIME_SEP) => Math.time(_value, _long, true, _millisec, _sep);

	Math.time.unit = [
		[ 1000, 'milliseconds', 'M' ],
		[ 60, 'seconds', 's' ],
		[ 60, 'minutes', 'm' ],
		[ 24, 'hours', 'h' ],
		[ 7, 'days', 'D' ],
		[ 4, 'weeks', 'W' ],
		[ 12, 'months', 'M' ],
		[ 0, 'years', 'Y' ]
	];

	Reflect.defineProperty(Math.random, 'byte', { value: (_max = 255, _min = 0) => Math.random.int(_max, _min) });

	Reflect.defineProperty(Math.random, 'bytes', { value: (_count = 1, _max = 255, _min = 0) => {
		if(_count < 0) _count = Math.random.int(-_count);
		const result = new Uint8Array(_count);
		for(var i = 0; i < _count; ++i) result[i] = Math.random.byte(_max, _min);
		return result;
	}});

	Reflect.defineProperty(Math.random, 'int', { value: (_max = (2**32)-1, _min = 0) => {
		return (Math._floor(Math.random() * (_max - _min + 1)) + _min);
	}});

	Reflect.defineProperty(Math.random, 'float', { value: (_max = (2**32)-1, _min = 0) => {
		return (Math.random() * (_max - _min) + _min);
	}});

	Reflect.defineProperty(Math.random, 'string', { value: (_count = 32, _alphabet) => {
		if(!string(_alphabet, false))
		{
			_alphabet = Math.random.string.alphabet;
		}

		var result = '';

		for(var i = 0; i < _count; ++i)
		{
			result += _alphabet[Math.random.int(_alphabet.length - 1)];
		}

		return result;
	}});

	var randomStringAlphabet = '';

	for(var i = 48; i <= 57; ++i)
		randomStringAlphabet += String.fromCharCode(i);
	for(var i = 65; i <= 90; ++i)
		randomStringAlphabet += String.fromCharCode(i);
	for(var i = 97; i <= 122; ++i)
		randomStringAlphabet += String.fromCharCode(i);

	Math.random.string.alphabet = randomStringAlphabet;

	//
	Reflect.defineProperty(Array.prototype, 'remove', { value: function(... _args)
	{
		const result = [];

		for(var i = 0, k = 0; i < this.length; ++i)
		{
			for(var j = 0; j < _args.length; ++j)
			{
				if(this[i] === _args[j])
				{
					result[k++] = this.splice(i--, 1)[0];
					break;
				}
			}
		}

		return result;
	}});

	Reflect.defineProperty(Array.prototype, 'pushUnique', { value: function(... _args)
	{
		for(var i = 0; i < _args.length; ++i)
		{
			if(!this.includes(_args[i]))
			{
				this.push(_args[i]);
			}
		}

		return this.length;
	}});

	Reflect.defineProperty(Array.prototype, 'unshiftUnique', { value: function(... _args)
	{
		for(var i = _args.length - 1; i >= 0; --i)
		{
			if(!this.includes(_args[i]))
			{
				this.unshift(_args[i]);
			}
		}

		return this.length;
	}});

	Reflect.defineProperty(Array.prototype, 'trim', { value: function(_space = false)
	{
		const result = [];
		var byte, empty;

		for(var i = 0, k = 0; i < this.length; ++i)
		{
			if(typeof this[i] !== 'string')
			{
				continue;
			}
			else
			{
				empty = true;

				for(var j = 0; j < this[i].length; ++j)
				{
					byte = this[i].charCodeAt(j);

					if(byte > (_space ? 31 : 32) && byte !== 127)
					{
						empty = false;
						break;
					}
				}
				
				if(empty)
				{
					this.splice(i--, 1);
					result[k++] = (i + k);
				}
			}
		}

		return result;
	}});

	//
	const _sort = Array.prototype.sort;

	Reflect.defineProperty(Array.prototype, 'sort', { value: function(_path = null, _asc = true)
	{
		if(typeof _path === 'boolean')
		{
			_asc = _path;
			_path = null;
		}

		if(typeof _path === 'function')
		{
			return _sort.call(this, _path);
		}

		_sort.call(this, (_a, _b) => {
			var a, b;

			if(typeof _path === 'string' || typeof _path === 'number') {
				if(! (Object.has(_path, _a) && Object.has(_path, _b))) return 0;
				a = Object.get(_path, _a); b = Object.get(_path, _b);
			} else { a = _a; b = _b; }

			if(typeof a === 'number' && typeof b === 'number')
			{
				return (_asc ? a - b : b - a);
			}
			else if(typeof a === 'bigint' && typeof b === 'bigint')
			{
				if(a < b) return (_asc ? -1 : 1);
				if(a > b) return (_asc ? 1 : -1);
				return 0;
			}
			else if(typeof a === 'string' && typeof b === 'string')
			{
				if(_asc) return a.localeCompare(b);
				return b.localeCompare(a);
			}
			else if(Reflect.is(a, 'Date') && Reflect.is(b, 'Date'))
			{
				if(_asc) return (a.getTime() - b.getTime());
				return (b.getTime() - a.getTime());
			}
			else if(object(a) && object(b))
			{
				if(Array.isArray(a))
				{
					a = a.length;
				}
				else
				{
					a = Reflect.ownKeys(a).length;
				}

				if(Array.isArray(b))
				{
					b = b.length;
				}
				else
				{
					b = Reflect.ownKeys(b).length;
				}

				return (_asc ? a - b : b - a);
			}

			try
			{
				if(a < b) return (_asc ? -1 : 1);
				if(a > b) return (_asc ? 1 : -1);
				return 0;
			}
			catch(_error)
			{
				return 0;
				//throw new Error('Comparing different types, or trying to sort unknown types..');
			}
		});

		//
		return this;
	}});

	Reflect.defineProperty(Array.prototype, 'lengthSort', { value: function(_asc = true)
	{
		return this.sort('length', _asc);
	}});

	Reflect.defineProperty(Array, 'intersect', { value: (... _args) => {
		for(var i = _args.length - 1; i >= 0; --i) if(!Array.isArray(_args[i], false))
			_args.splice(i, 1); if(_args.length === 0) return [];
		const result = []; const map = new Map(); const sets = new Array(_args.length);
		for(var j = 0; j < _args.length; ++j) {
			sets[j] = new MultiSet(); for(var i = 0; i < _args[j].length; ++i) {
				sets[j].add(_args[j][i]);
				const mapItem = (map.has(_args[j][i]) ? map.get(_args[j][i]) : new Set());
				mapItem.add(j); map.set(_args[j][i], mapItem); }}
		var min; for(const item of map) { if(item[1].length < _args.length) continue;
			min = null; for(var i = 0; i < _args.length; ++i) {
				if(min === null) min = sets[i].get(item[0]);
				else min = Math.min(min, sets[i].get(item[0])); }
			while(min-- > 0) result.push(item[0]); }
		return result; }});

	//
	Reflect.defineProperty(String.prototype, 'isLowerCase', { get: function()
	{
		return (this.toLowerCase() === this.valueOf());
	}});

	Reflect.defineProperty(String.prototype, 'isUpperCase', { get: function()
	{
		return (this.toUpperCase() === this.valueOf());
	}});

	//
	Reflect.defineProperty(String.prototype, 'explode', { value: function(... _sep)
	{
		var TRIM = false;
		
		for(var i = 0; i < _sep.length; ++i)
		{
			if(!string(_sep[i], false))
			{
				if(bool(_sep[i]))
				{
					TRIM = _sep.splice(i--, 1)[0];
				}
				else
				{
					_sep.splice(i--, 1);
				}
			}
		}
		
		if(_sep.length === 0)
		{
			return [ this.valueOf() ];
		}
		else
		{
			_sep.lengthSort(false);
		}
		
		const result = [];
		var sub = '';
		
		mainLoop: for(var i = 0, j = 0; i < this.length; ++i)
		{
			if(TRIM && this[i] === '\r')
			{
				continue;
			}
			
			for(var k = 0; k < _sep.length; ++k)
			{
				if(this.at(i, _sep[k]))
				{
					i += _sep[k].length - 1;
					
					if(TRIM && (result[j++] = sub).length > 0)
					{
						result[j - 1] = result[j - 1].trim();
					}
					
					sub = '';
					continue mainLoop;
				}
			}
			
			sub += this[i];
		}
		
		if(sub.length > 0)
		{
			if(TRIM)
			{
				sub = sub.trim();
			}
			
			result.push(sub);
		}
		
		if(TRIM)
		{
			result.trim(false);
		}
		
		return result;
	}});

	//
	const getPathArray = (_path, _sep = DEFAULT_OBJECT_SEP) => {
		if(typeof _path === 'number')
		{
			return [ Math.int(_path) ];
		}
		else if(Array.isArray(_path))
		{
			return _path;
		}
		else if(typeof _path !== 'string')
		{
			return null;
		}
		else if(_path.length === 0)
		{
			return null;
		}
		
		const result = [ '' ];
		
		for(var i = 0, j = 0; i < _path.length; ++i)
		{
			if(_path.at(i, _sep))
			{
				if(result[j].length > 0)
				{
					result[++j] = '';
				}
			}
			else
			{
				result[j] += _path[i];
			}
		}
		
		for(var i = 0; i < result.length; ++i)
		{
			if(result[i].length === 0)
			{
				result.splice(i--, 1);
			}
			else if(!isNaN(result[i]))
			{
				result[i] = Math.int(Number(result[i]));
			}
		}
		
		if(result.length === 0)
		{
			return null;
		}
		
		return result;
	};

	Reflect.defineProperty(Object, 'has', { value: (_path, _context = global, _sep = DEFAULT_OBJECT_SEP) => {
		if((_path = getPathArray(_path, _sep)) === null) return _context; var ctx = _context; var done; try
		{
			for(var i = 0; i < _path.length; ++i)
			{
				done = false;
				
				if(Array.isArray(ctx))
				{
					if(ctx.length === 0)
					{
						return false;
					}
					else if(typeof _path[i] === 'number' && _path[i] < 0)
					{
						ctx = ctx[Math.getIndex(_path[i], ctx.length)];
						done = true;
					}
				}
				
				if(!done)
				{
					if(_path[i] in ctx)
					{
						ctx = ctx[_path[i]];
					}
					else
					{
						return false;
					}
				}
			}
		}
		catch(_err)
		{
			return false;
		}
		
		return true;
	}});

	Reflect.defineProperty(Object, 'get', { value: (_path, _context = global, _sep = DEFAULT_OBJECT_SEP) => {
		if((_path = getPathArray(_path, _sep)) === null) return _context; var ctx = _context; var done; const last = _path.pop(); try
		{
			for(var i = 0; i < _path.length; ++i)
			{
				done = false;
				
				if(Array.isArray(ctx))
				{
					if(ctx.length === 0)
					{
						return undefined;
					}
					else if(typeof _path[i] === 'number' && _path[i] < 0)
					{
						ctx = ctx[Math.getIndex(_path[i], ctx.length)];
						done = true;
					}
				}
				
				if(!done)
				{
					if(_path[i] in ctx)
					{
						ctx = ctx[_path[i]];
					}
					else
					{
						return undefined;
					}
				}
			}
			
			if(Array.isArray(ctx))
			{
				if(ctx.length === 0)
				{
					return undefined;
				}
				else if(typeof last === 'number' && last < 0)
				{
					return ctx[Math.getIndex(last, ctx.length)];
				}
			}
			
			if(last in ctx)
			{
				return ctx[last];
			}
		}
		catch(_err)
		{
			return undefined;
		}
		
		return undefined;
	}});

	Reflect.defineProperty(Object, 'set', { value: (_path, _value, _context = global, _sep = DEFAULT_OBJECT_SEP, _null = DEFAULT_OBJECT_NUL) => {
		if((_path = getPathArray(_path, _sep)) === null) return _context; var ctx = _context; var last = _path.pop(); var result; try
		{
			const getNextTargetItem = (_index) => {
				if(typeof _path[_index + 1] === 'undefined')
				{
					if(typeof last === 'number')
					{
						return [];
					}
					else if(_null)
					{
						return Object.create(null);
					}
					
					return {};
				}
				else if(typeof _path[_index + 1] === 'number')
				{
					return [];
				}
				else if(_null)
				{
					return Object.create(null);
				}
				
				return {};
			};

			for(var i = 0; i < _path.length; ++i)
			{
				if(Array.isArray(ctx) && typeof _path[i] === 'number')
				{
					if(_path[i] >= ctx.length)
					{
						ctx = ctx[_path[i]] = getNextTargetItem();
					}
					else
					{
						if(_path[i] < 0)
						{
							if(ctx.length === 0)
							{
								_path[i] = 0;
							}
							else
							{
								_path[i] = Math.getIndex(_path[i], ctx.length);
							}
						}

						ctx = ctx[_path[i]];
					}
				}
				else if(_path[i] in ctx)
				{
					ctx = ctx[_path[i]];
				}
				else
				{
					ctx = ctx[_path[i]] = getNextTargetItem();
				}
			}

			//
			if(Array.isArray(ctx) && typeof last === 'number')
			{
				if(last >= ctx.length)
				{
					result = ctx[last];
					ctx[last] = _value;
				}
				else
				{
					if(last < 0)
					{
						if(ctx.length === 0)
						{
							last = 0;
						}
						else
						{
							last = Math.getIndex(last, ctx.length);
						}
					}
					
					result = ctx[last];
					ctx[last] = _value;
				}
			}
			else
			{
				result = ctx[last];
				ctx[last] = _value;
			}
		}
		catch(_err)
		{
			if(DEFAULT_OBJECT_SET_BOOL)
			{
				return false;
			}
			
			return undefined;
		}
		
		if(DEFAULT_OBJECT_SET_BOOL)
		{
			return true;
		}

		return result;
	}});

	Reflect.defineProperty(Object, 'remove', { value: (_path, _context = global, _sep = DEFAULT_OBJECT_SEP) => {
		if((_path = getPathArray(_path, _sep)) === null) return _context; var ctx = _context; var done; const last = _path.pop(); try
		{
			for(var i = 0; i < _path.length; ++i)
			{
				done = false;
				
				if(Array.isArray(ctx))
				{
					if(ctx.length === 0)
					{
						return undefined;
					}
					else if(typeof _path[i] === 'number' && _path[i] < 0)
					{
						ctx = ctx[Math.getIndex(_path[i], ctx.length)];
						done = true;
					}
				}
				
				if(!done)
				{
					if(_path[i] in ctx)
					{
						ctx = ctx[_path[i]];
					}
					else
					{
						return undefined;
					}
				}
			}

			if(Array.isArray(ctx))
			{
				if(ctx.length === 0)
				{
					return undefined;
				}
				else if(typeof last === 'number')
				{
					if(last < 0)
					{
						const alternative = Math.getIndex(last, ctx.length);
						return ctx.splice(alternative, 1)[0];
					}
					
					return ctx.splice(last, 1)[0];
				}
			}
			
			if(last in ctx)
			{
				const result = ctx[last];
				delete ctx[last];
				return result;
			}
		}
		catch(_err)
		{
			return undefined;
		}
		
		return undefined;
	}});

	//
	Reflect.defineProperty(Boolean.prototype, 'toString', { value: function()
	{
		return (this.valueOf() ? DEFAULT_TRUE : DEFAULT_FALSE);
	}});

	//
	Reflect.defineProperty(Uint8Array, 'create', { value: function(... _args)
	{
		var length = 0;

		for(var i = 0; i < _args.length; ++i)
		{
			if(is(_args[i], 'Uint8Array'))
			{
				if(_args[i].length > 0)
				{
					length += _args[i].length;
				}
				else
				{
					_args.splice(i--, 1);
				}
			}
			else if(typeof _args[i] === 'string')
			{
				if(_args[i].length > 0)
				{
					const sub = new Uint8Array(_args[i].length);

					for(var j = 0; j < _args[i].length; ++j)
					{
						sub[j] = _args[i].charCodeAt(j);
					}

					_args[i] = sub;
					length += _args[i].length;
				}
				else
				{
					_args.splice(i--, 1);
				}
			}
			else if(number(_args[i]))
			{
				if(_args[i] >= 1)
				{
					length += Math.floor(_args[i]);
				}
				else
				{
					_args.splice(i--, 1);
				}
			}
			else
			{
				try
				{
					_args[i] = Uint8Array.from(_args[i]);

					if(_args[i].length > 0)
					{
						length += _args[i].length;
					}
					else
					{
						_args.splice(i--, 1);
					}
				}
				catch(_e)
				{
					_args.splice(i--, 1);
				}
			}
		}

		if(length < 1)
		{
			return new Uint8Array(0);
		}

		const result = new Uint8Array(length);
		var offset = 0;

		for(var i = 0; i < _args.length; ++i)
		{
			if(typeof _args[i] === 'number')
			{
				offset += _args[i];
			}
			else
			{
				result.set(_args[i], offset);
				offset += _args[i].length;
			}
		}

		return result;
	}});

	Reflect.defineProperty(Uint8Array.prototype, '_at', { value: Uint8Array.prototype.at });

	Reflect.defineProperty(Uint8Array.prototype, 'at', { value: function(_index, _needle, _case_sensitive = true)
	{
		if(typeof _needle === 'string')
		{
			_needle = Uint8Array.create(_needle);
		}
		else if(!is(_needle, 'Uint8Array'))
		{
			const result = Uint8Array.prototype._at.call(this, _index);
			
			if(_needle === true)
			{
				return String.fromCharCode(result);
			}
			
			return result;
		}

		if((_index = Math.getIndex(_index, this.length)) === null)
		{
			return (_needle.length === 0);
		}
		else if(_needle.length === 0)
		{
			return false;
		}
		else if(_needle.length > (this.length - _index))
		{
			return false;
		}

		var a, b;

		for(var i = _index, j = 0; j < _needle.length; ++i, ++j)
		{
			a = this[i];
			b = _needle[j];

			if(!_case_sensitive)
			{
				if(a >= 65 && a <= 90)
				{
					a += 32;
				}

				if(b >= 65 && b <= 90)
				{
					b += 32;
				}
			}

			if(a !== b)
			{
				return false;
			}
		}

		return true;
	}});

	//
	Reflect.defineProperty(String.prototype, 'eol', { value: function(_index = 0)
	{
		if(this[_index] === '\n' || this[_index] === '\r')
		{
			if(this.at(_index, '\r\n') || this.at(_index, '\n\r'))
			{
				return 2;
			}

			return 1;
		}

		return 0;
	}});

	//
}

//

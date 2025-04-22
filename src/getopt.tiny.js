/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/getopt.js/
 * v2.3.1
 */

//
const DEFAULT_THROW = true;
const DEFAULT_CAST = true;
const DEFAULT_CAST_EMPTY = true;
const DEFAULT_CAST_REGEXP = false; //prob: paths.. xD~
const DEFAULT_EQUAL_ASSIGN = true;
const DEFAULT_ARRAY = false;
const DEFAULT_UNESCAPE = true;
const DEFAULT_SPLIT = true;

//
const getopt = (_cast = DEFAULT_CAST, _array = DEFAULT_ARRAY, _unescape = DEFAULT_UNESCAPE, _equal_assign = DEFAULT_EQUAL_ASSIGN, _vector = process.argv, _start = 2) => {
	const result = new GetOpt();
	var end = false;
	var key = '';
	var idx, value;

	if(DEFAULT_SPLIT) for(var i = 0; i < _vector.length; ++i)
	{
		if(_vector[i] === '--')
		{
			break;
		}
		else if(_vector[i].startsWith('--'))
		{
			_vector[i] = _vector[i].split(' ');

			for(var j = 0, k = 0; j < _vector[i].length; ++j)
			{
				if(!_vector[i][j])
				{
					_vector[i].splice(j--, 1);
				}
				else if(j > 0)
				{
					_vector.splice(i + ++k, 0,
						_vector[i].splice(j--, 1)[0]);
				}
			}

			_vector[i] = _vector[i][0];
		}
	}
	
	const set = (_value, _equal_sign = false) => {
		if(_cast)
		{
			_value = _value.tryCast(
				DEFAULT_CAST_EMPTY,
				DEFAULT_CAST_REGEXP);
		}
		
		if(typeof _value === 'string' && _unescape)
		{
			_value = _value.unescape();
		}
		
		if(key = GetOpt.checkKey(key, false))
		{
			if(_array && !_equal_sign)
			{
				result.add(key, _value, false, false);
			}
			else
			{
				result.set(key, _value, false, false);
			}
				
			key = '';
		}
		else
		{
			result.push(_value);
		}
	};
	
	const checkKeyForEqualSign = () => {
		if(! (_equal_assign && key))
		{
			return null;
		}
		
		const idx = key.indexOf('=');
		
		if(idx === -1)
		{
			return false;
		}
		
		const value = key.substr(idx + 1);
		key = key.substr(0, idx);
		set(value, true);

		return true;
	};
	
	for(var i = _start; i < _vector.length; ++i)
	{
		if(end)
		{
			set(_vector[i], false);
		}
		else if(_vector[i] === '--')
		{
			if(key)
			{
				set('', false);
			}
			
			end = true;
		}
		else if(_vector[i][0] === '-' && _vector[i][1] === '-')
		{
			if(key)
			{
				set('', false);
			}
			
			key = _vector[i].substr(2);
			checkKeyForEqualSign();
		}
		else
		{
			set(_vector[i], false);
		}
	}
	
	if(key)
	{
		if(!checkKeyForEqualSign())
		{
			set('', false);
		}
	}

	return result;
};

const GetOpt = getopt.GetOpt = class GetOpt extends Array
{
	constructor(... _args)
	{
		super(... _args);

		this._keys = [];
	}

	static checkKey(_key, _throw = DEFAULT_THROW)
	{
		if(typeof _key !== 'string')
		{
			if(_throw)
			{
				throw new Error('Invalid _key argument (not a String)');
			}

			return null;
		}

		if(!_key.startsWith('--'))
		{
			_key = '--' + _key;
		}

		if(_key.length <= 2)
		{
			if(_throw)
			{
				throw new Error('Invalid _key argument (may not be empty)');
			}

			return null;
		}

		return _key;
	}
	
	clear()
	{
		const result = [ ... this._keys ];
		for(const k of this._keys) delete this[k];
		this._keys.length = 0;
		return result;
	}

	get values()
	{
		const result = Object.create(null);

		for(const key of this._keys)
		{
			result[key] =
				result[key.substr(2)] =
					this[key];
		}
		
		return result;
	}

	get vector()
	{
		return [ ... this ];
	}

	get object()
	{
		const result = this.vector;
		Object.assign(result, this.values);
		return result;
	}

	get keys()
	{
		return [ ... this._keys ];
	}

	get size()
	{
		return this._keys.length;
	}

	set(_key, _value, _cast = DEFAULT_CAST, _unescape = DEFAULT_UNESCAPE)
	{
		if(!(_key = GetOpt.checkKey(_key)))
		{
			return undefined;
		}

		if(typeof _value === 'string')
		{
			if(_cast)
			{
				_value = _value.tryCast(
					DEFAULT_CAST_EMPTY,
					DEFAULT_CAST_REGEXP);
			}

			if(_unescape && typeof _value === 'string')
			{
				_value = _value.unescape();
			}
		}

		if(!this._keys.include(_key))
		{
			this._keys.push(_key);
		}

		return this[_key] = _value;
	}

	add(_key, _value, _cast = DEFAULT_CAST, _unescape = DEFAULT_UNESCAPE)
	{
		if(!(_key = GetOpt.checkKey(_key)))
		{
			return undefined;
		}

		if(typeof _value === 'string')
		{
			if(_cast)
			{
				_value = _value.tryCast(
					DEFAULT_CAST_EMPTY,
					DEFAULT_CAST_REGEXP);
			}

			if(_unescape && typeof _value === 'string')
			{
				_value = _value.unescape();
			}
		}

		if(this._keys.includes(_key))
		{
			if(Array.isArray(this[_key]))
			{
				this[_key].push(
					_value);
			}
			else
			{
				this[_key] = [
					this[_key],
					_value ];
			}

			return this[_key];
		}

		this._keys.push(_key);
		return this[_key] = _value;
	}

	get(_key)
	{
		if(arguments.length === 0 || _key === '')
		{
			return this.values;
		}

		if(!(_key = GetOpt.checkKey(_key)))
		{
			return undefined;
		}

		if(!this._keys.include(_key))
		{
			return undefined;
		}

		return this[_key];
	}

	//
	//TODO/"Reflect.{is,was}()"! @ polyfill, e.g..
	//
	/*is(_key, ... _args)
	{
		return Reflect.is(
			this.get(_key),
			... _args);
	}

	was(_key, ... _args)
	{
		return Reflect.was(
			this.get(_key),
			... _args);
	}*/

	has(_key)
	{
		if(!(_key = GetOpt.checkKey(_key)))
		{
			return null;
		}

		return this._keys.includes(_key);
	}

	remove(_key)
	{
		if(!(_key = GetOpt.checkKey(_key)))
		{
			return null;
		}

		for(var i = this._keys.length - 1; i >= 0; --i)
		{
			if(this._keys[i] === _key)
			{
				this._keys.splice(i, 1);
				delete this[_key];
				return true;
			}
		}

		return false;
	}
}

export default getopt;

//
//including this here instead of extra 'polyfill.tiny.js'; ..
//
if(typeof global.__getopt_ext !== 'number')
{
	//
	global.__getopt_ext = Date.now();
	
	//
	Reflect.defineProperty(String.prototype, 'tryCast', { value: function(_empty_true = DEFAULT_CAST_EMPTY, _regexp = DEFAULT_CAST_REGEXP)
	{
		const result = this.valueOf();
		var tmp;

		if(result.length === 0)
		{
			return (_empty_true ? true : result);
		}
		
		if(!isNaN(result))
		{
			return Number(result);
		}

		if(result[result.length - 1] === 'n')
		{
			tmp = result.slice(0, -1);
			if(!isNaN(tmp)) return BigInt(tmp);
		}

		if(result.length <= 9) switch(result.toLowerCase())
		{
			case 'no': case 'false': case 'off': return false;
			case 'yes': case 'true': case 'on': return true;
			case 'null': return null;
			case 'undefined': return undefined;
		}

		if(DEFAULT_CAST_REGEXP && RegExp.isRegExp(result))
		{
			tmp = RegExp.parse(result);
			if(tmp) return tmp;
		}

		return result;
	}});

	Reflect.defineProperty(String, 'tryCast', { value: (_value, _empty_true = DEFAULT_CAST_EMPTY, _regexp = DEFAULT_CAST_REGEXP) => {
		if(typeof _value !== 'string') return _value;
		return _value.tryCast(_empty_true, _regexp);
	}});

	Reflect.defineProperty(RegExp, 'parse', { value: (_value) => {
		if(typeof _value === 'object' && _value !== null && _value.constructor.name === 'RegExp')
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
			return null;
		}

		return result;
	}});

	Reflect.defineProperty(RegExp, 'isRegExp', { value: (_item) => {
		if(typeof _value === 'object' && _value !== null && _value.constructor.name === 'RegExp')
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

	Reflect.defineProperty(String.prototype, 'unescape', { value: function()
	{
		var result = '', byte;

		for(var i = 0; i < this.length; ++i)
		{
			if(this[i] === '\\' && i < (this.length - 1))
			{
				if(this[i + 1] === '\\')
				{
					result += this[++i];
					continue;
				}

				byte = this.charCodeAt(++i);

				switch(byte)
				{
					case 48:
						result += String.fromCharCode(0);
						break;
					case 97:
						result += String.fromCharCode(7);
						break;
					case 98:
						result += String.fromCharCode(8);
						break;
					case 101:
						result += String.fromCharCode(27);
						break;
					case 116:
						result += String.fromCharCode(9);
						break;
					case 110:
						result += String.fromCharCode(10);
						break;
					case 118:
						result += String.fromCharCode(11);
						break;
					case 102:
						result += String.fromCharCode(12);
						break;
					case 114:
						result += String.fromCharCode(13);
						break;
					default:
						result += this[--i];
						break;
				}
			}
			else
			{
				result += this[i];
			}
		}

		return result;
	}});
}

//


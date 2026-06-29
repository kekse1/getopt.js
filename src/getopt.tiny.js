/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://norbert.com.es/
 */

//
const DEFAULT_THROW = true;
const DEFAULT_THROW_GET = false;
const DEFAULT_CAST = true;
const DEFAULT_CAST_REGULAR = true;
const DEFAULT_CAST_EMPTY = true;
const DEFAULT_CAST_REGEXP = false; //prob: paths.. xD~
const DEFAULT_EQUAL_ASSIGN = true;
const DEFAULT_ARRAY = false;
const DEFAULT_UNESCAPE = true;
const DEFAULT_SPLIT = true;
const DEFAULT_HELP = true;
const DEFAULT_FIX = true;
const DEFAULT_CHECK_TYPE = true;

//
import type from './type.js';

//
const getopt = (_cast = DEFAULT_CAST, _array = DEFAULT_ARRAY, _unescape = DEFAULT_UNESCAPE, _cast_regular = DEFAULT_CAST_REGULAR, _equal_assign = DEFAULT_EQUAL_ASSIGN, _vector = process.argv, _start = 2) => {
	if(object(_cast))
	{
		if('array' in _cast)
		{
			_array = _cast.array;
		}
		
		if('unescape' in _cast)
		{
			_unescape = _cast.unescape;
		}

		if('castRegular' in _cast)
		{
			_cast_regular = _cast.castRegular;
		}

		if('equalAssign' in _cast)
		{
			_equal_assign = _cast.equalAssign;
		}

		if('vector' in _cast)
		{
			_vector = _cast.vector;
		}
		else if(Array.isArray(_array))
		{
			_vector = _array;
		}

		if('start' in _cast)
		{
			_start = _cast.start;
		}
		else if(int(_unescape))
		{
			_start = _unescape;
		}

		if('cast' in _cast)
		{
			_cast = _cast.cast;
		}
		else
		{
			_cast = DEFAULT_CAST;
		}
	}

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
		key = result.checkKey(key, false);
		
		if(key && key.length > 1 && key[1] !== '-')
		{
			_equal_sign = false;
		}

		if(typeof _value === 'string' && (_cast || _cast_regular))
		{
			if((key && _cast) || (!key && _cast_regular))
			{
				_value = _value.tryCast(
					DEFAULT_CAST_REGEXP,
					DEFAULT_CAST_EMPTY);
			}
		}
		
		if(_unescape && typeof _value === 'string')
		{
			_value = _value.unescape();
		}
		
		if(key)
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
		
		key = result.checkKey(key, false);
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
	
	var min, short, split, next = []; for(var i = _start; i < _vector.length; ++i)
	{
		if(DEFAULT_HELP && (_vector[i] === '--help' || _vector[i] === '-?'))
		{
			result.help = true;
		}
		else if(end)
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
			_cast = _cast_regular = false;
		}
		else if(!isNaN(_vector[i]))
		{
			set(_vector[i], false);
		}
		else if(_vector[i][0] === '-')
		{
			if(_vector[i][1] === '-')
			{
				if(key)
				{
					set('', false);
				}
				
				key = _vector[i];
				checkKeyForEqualSign();
			}
			else if(_equal_assign && _vector[i].includes('='))
			{
				key = '-' + _vector[i].substr(1);
				checkKeyForEqualSign();
			}
			else if((short = _vector[i].substr(1).split('')).length > 0)
			{
				if(key)
				{
					set('', false);
				}

				if(short.length === 1)
				{
					key = '-' + short;
					checkKeyForEqualSign();
				}
				else
				{
					next.length = 0;
					
					for(++i, j = 0; i < _vector.length && j < short.length; ++i, ++j)
					{
						if(_vector[i][0] === '-')
						{
							break;
						}
						
						next[j] = _vector[i];
					}
					
					--i;
					
					if(next.length > 0)
					{
						min = Math.min(
							next.length, short.length);

						for(var j = 0; j < min; ++j)
						{
							key = '-' + short[j];
							set(next[j], false);
						}
						
						if(short.length > min) for(var j = min; j < short.length; ++j)
						{
							key = '-' + short[j];
							set('', false);
						}
					}
				}
			}
		}
		else
		{
			set(_vector[i], false);
		}
	}
	
	if(key && !checkKeyForEqualSign())
	{
		set('', false);
	}

	return result;
};

const GetOpt = getopt.GetOpt = class GetOpt extends Array
{
	constructor(... _args)
	{
		super(... _args);
		this._keys = [];
		this.help = (DEFAULT_HELP ? false : null);
	}

	checkTypes(_map, _all = false, _throw = DEFAULT_THROW)
	{
		const map = new Map();
		var key, value;

		if(is(_map, 'Map')) for(const item of _map)
		{
			if(!string(item[0], false))
			{
				if(_throw)
				{
					throw new Error('Invalid map');
				}
				
				return null;
			}
			
			if(item[0][0] !== '-')
			{
				if(item[0].length === 1)
				{
					key = '-' + item[0];
				}
				else if(item[0].length > 1)
				{
					key = '--' + item[0];
				}
				else
				{
					if(_throw)
					{
						throw new Error('Invalid map');
					}
					
					return null;
				}
			}
			else
			{
				key = item[0];
			}
			
			if(string(item[1], false))
			{
				value = [ item[1] ];
			}
			else if(array(item[1], false))
			{
				value = new Array(item[1].length);
				
				for(var i = 0; i < item[1].length; ++i)
				{
					if(!string(item[1][i], false))
					{
						if(_throw)
						{
							throw new Error('Invalid map');
						}
						
						return null;
					}
					
					value[i] = item[1][i];
				}
			}
			else
			{
				if(_throw)
				{
					throw new Error('Invalid map');
				}
				
				return null;
			}

			map.set(key, value);
		}
		else if(object(_map)) for(var idx in _map)
		{
			if(idx[0] !== '-')
			{
				if(idx.length === 1)
				{
					key = '-' + idx;
				}
				else if(idx.length > 1)
				{
					key = '--' + idx;
				}
				else
				{
					if(_throw)
					{
						throw new Error('Invalid map');
					}
					
					return null;
				}
			}
			else
			{
				key = idx;
			}
			
			if(string(_map[idx], false))
			{
				value = [ _map[idx] ];
			}
			else if(array(_map[idx], false))
			{
				value = new Array(_map[idx].length);
				
				for(const item of _map[idx])
				{
					if(!string(item, false))
					{
						if(_throw)
						{
							throw new Error('Invalid map');
						}
						
						return null;
					}
					
					value.push(item);
				}
			}
			else
			{
				if(_throw)
				{
					throw new Error('Invalid map');
				}
				
				return null;
			}

			map.set(key, value);
		}
		else
		{
			if(_throw)
			{
				throw new Error('Invalid map');
			}
			
			return null;
		}

		const result = [];

		if(_all) for(const item of map)
		{
			if(!this.type(item[0], item[1]))
			{
				result.push(item[0]);
			}
		}
		else for(const item of this.keys)
		{
			if(map.has(item))
			{
				if(!this.type(item, map.get(item)))
				{
					result.push(item);
				}
			}
			else
			{
				result.push(item);
			}
		}

		if(_throw && result.length > 0)
		{
			throw new Error('Invalid type' + (result.length === 1 ? '' : 's') +
				' [ ' + result.join(', ') + ' ]');
		}
		
		return result;
	}
	
	checkKeys(_keys, _throw = DEFAULT_THROW)
	{
		const set = new Set();
		
		if(array(_keys, false)) for(const item of _keys)
		{
			if(item[0] === '-')
			{
				set.add(item);
			}
			else if(item.length === 1)
			{
				set.add('-' + item);
			}
			else if(item.length > 1)
			{
				set.add('--' + item);
			}
			else
			{
				if(_throw)
				{
					throw new Error('Invalid set');
				}

				return null;
			}
		}
		else if(is(_keys, 'Set')) for(const item of _keys)
		{
			if(!string(item, false))
			{
				if(_throw)
				{
					throw new Error('Invalid set');
				}
				
				return null;
			}
			
			if(item[0] !== '-')
			{
				if(item.length === 1)
				{
					set.add('-' + item);
				}
				else if(item.length > 1)
				{
					set.add('--' + item);
				}
				else
				{
					if(_throw)
					{
						throw new Error('Invalid set');
					}
					
					return null;
				}
			}
			else
			{
				set.add(item);
			}
		}
		else
		{
			if(_throw)
			{
				throw new Error('Invalid set');
			}
			
			return null;
		}

		const result = [];
		
		for(const key of this.keys)
		{
			if(!set.has(key))
			{
				result.push(key);
			}
		}

		if(_throw && result.length > 0)
		{
			throw new Error('Invalid key' + (result.length === 1 ?
				'' : 's') + ' [ ' + result.join(', ') + ' ]');
		}

		return result;
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
		if(!(_key = this.checkKey(_key)))
		{
			return undefined;
		}

		if(typeof _value === 'string')
		{
			if(_cast)
			{
				_value = _value.tryCast(
					DEFAULT_CAST_REGEXP,
					DEFAULT_CAST_EMPTY);
			}

			if(_unescape && typeof _value === 'string')
			{
				_value = _value.unescape();
			}
		}

		if(!this._keys.includes(_key))
		{
			this._keys.push(_key);
		}
		
		return this[_key] = _value;
	}

	add(_key, _value, _cast = DEFAULT_CAST, _unescape = DEFAULT_UNESCAPE)
	{
		if(!(_key = this.checkKey(_key)))
		{
			return undefined;
		}

		if(typeof _value === 'string')
		{
			if(_cast)
			{
				_value = _value.tryCast(
					DEFAULT_CAST_REGEXP,
					DEFAULT_CAST_EMPTY);
			}

			if(_unescape && typeof _value === 'string')
			{
				_value = _value.unescape();
			}
		}

		if(this._keys.includes(_key))
		{
			if(array(this[_key], true))
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

	get(_key, _throw_type = DEFAULT_THROW_GET, _check_type = DEFAULT_CHECK_TYPE)
	{
		if(arguments.length === 0 || _key === '')
		{
			return this.values;
		}

		if(!(_key = this.checkKey(_key)))
		{
			return undefined;
		}

		if(!this._keys.includes(_key))
		{
			if(_throw_type === true)
			{
				throw new Error('Invalid key `' + _key + '`');
			}
			
			return undefined;
		}
		
		const result = this[_key];
		
		if(string(_throw_type, false) || array(_throw_type, false))
		{
			if(!type(result, _throw_type, _check_type))
			{
				return undefined;
			}
		}

		return this[_key];
	}

	is(_key, ... _args)
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
	}

	get types()
	{
		return this.constructor.types;
	}

	get TYPES()
	{
		return this.constructor.TYPES;
	}

	static get types()
	{
		return type.types;
	}

	static get TYPES()
	{
		return type.TYPES;
	}

	type(_key, _type)
	{
		return type(this.get(_key), _type);
	}

	has(_key, _type, _check_type = DEFAULT_CHECK_TYPE)
	{
		if(!(_key = this.checkKey(_key)))
		{
			return null;
		}

		const result = this._keys.includes(_key);

		if(!result || !_type)
		{
			return result;
		}

		return type(this[_key], _type, _check_type);
	}

	remove(_key)
	{
		if(!(_key = this.checkKey(_key)))
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
	
	checkKey(_key, _throw = DEFAULT_THROW, _fix = true)
	{
		if(!this.constructor.isValidKeyType(_key, _throw))
		{
			return null;
		}
		
		if(!DEFAULT_FIX)
		{
			_fix = null;
		}
		else if(!!_fix && _key.length === 1 && _key[0] !== '-')
		{
			if(this.keys.includes('--' + _key))
			{
				_fix = true;
			}
			else
			{
				_fix = false;
			}
		}
		else
		{
			_fix = null;
		}

		return this.constructor.checkKey(_key, _throw, _fix);
	}

	static isValidKeyType(_key, _throw = DEFAULT_THROW)
	{
		if(typeof _key !== 'string' || _key.length === 0)
		{
			if(_throw)
			{
				throw new Error('Invalid _key argument (not a non-empty String)');
			}
			
			return null;
		}
		
		return true;
	}
	
	static checkKey(_key, _throw = DEFAULT_THROW, _fix = null)
	{
		if(!this.isValidKeyType(_key, _throw))
		{
			return null;
		}

		if(_key && _key[0] !== '-')
		{
			if(_key.length === 1 && !_fix)
			{
				_key = '-' + _key;
			}
			else
			{
				_key = '--' + _key;
			}
		}

		if(_key.length < 2)
		{
			if(_throw)
			{
				throw new Error('Invalid _key argument (may not be empty)');
			}

			return null;
		}

		return _key;
	}
}

export default getopt;

//


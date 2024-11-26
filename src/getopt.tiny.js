/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://norbert.com.es/
 */

//
const DEFAULT_CAST = true;
const DEFAULT_CAST_EMPTY = true;
const DEFAULT_CAST_REGEXP = false; //prob: paths.. xD~
const DEFAULT_EQUAL_ASSIGN = true;
const DEFAULT_ARRAY = false;
const DEFAULT_UNESCAPE = true;

//
const getopt = (_cast = DEFAULT_CAST, _array = DEFAULT_ARRAY, _unescape = DEFAULT_UNESCAPE, _equal_assign = DEFAULT_EQUAL_ASSIGN, _vector = process.argv, _start = 2) => {
	const result = [];
	var end = false;
	var key = '';
	var idx, value;
	
	const set = (_value) => {
		if(_cast)
		{
			_value = _value.tryCast(
				DEFAULT_CAST_EMPTY,
				_unescape,
				DEFAULT_CAST_REGEXP);
		}
		
		if(key && !(key in Array.prototype))
		{
			if((key in result) && _array)
			{
				if(array(result[key]))
				{
					result[key].push(_value);
				}
				else
				{
					result[key] = [ result[key], _value ];
				}
			}
			else
			{
				result[key] = _value;
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
		set(value);

		return true;
	};
	
	for(var i = _start; i < _vector.length; ++i)
	{
		if(end)
		{
			set(_vector[i]);
		}
		else if(_vector[i] === '--')
		{
			if(key)
			{
				set('');
			}
			
			end = true;
		}
		else if(_vector[i][0] === '-')
		{
			if(_vector[i].length === 1)
			{
				set('-');
				continue;
			}
			else if(_vector[i][1] !== '-')
			{
				const numberTest = _vector[i].substr(1);

				if(numberTest.length > 0 && !isNaN(numberTest))
				{
					set('-' + numberTest);
					continue;
				}
			}

			if(key)
			{
				set('');
			}
			
			if(_vector[i][1] === '-')
			{
				key = _vector[i].substr(2);
			}
			else
			{
				key = _vector[i].substr(1);
			}
			
			checkKeyForEqualSign();
		}
		else
		{
			set(_vector[i]);
		}
	}
	
	if(key)
	{
		if(!checkKeyForEqualSign())
		{
			set('');
		}
	}

	return result;
};

export default getopt;

//
//including this here instead of extra 'polyfill.tiny.js'; ..
//
if(typeof global.__getopt_ext !== 'number')
{
	//
	global.__getopt_ext = Date.now();
	
	//
	Reflect.defineProperty(String.prototype, 'tryCast', { value: function(_empty_true = false)
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
			case 'no': case 'false': return false;
			case 'yes': case 'true': return true;
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

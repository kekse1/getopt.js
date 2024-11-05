/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://norbert.com.es/
 */

//
const DEFAULT_CAST = true;
const DEFAULT_EQUAL = true;
const DEFAULT_ARRAY = false;

//
const getopt = (_cast = DEFAULT_CAST) => {
	const result = [];
	var end = false;
	var key = '';
	var idx, value;
	
	const set = (_value) => {
		if(_cast)
		{
			if(_value.length === 0)
			{
				_value = true;
			}
			else
			{
				_value = _value.tryCast();
			}
		}
		
		if(key)
		{
			if((key in result) && DEFAULT_ARRAY)
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
		if(! (DEFAULT_EQUAL && key))
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
	
	for(var i = 2; i < process.argv.length; ++i)
	{
		if(end)
		{
			set(process.argv[i]);
		}
		else if(process.argv[i] === '--')
		{
			if(key)
			{
				set('');
			}
			
			end = true;
		}
		else if(process.argv[i][0] === '-')
		{
			if(process.argv[i].length === 1)
			{
				set('-');
				continue;
			}
			else if(process.argv[i][1] !== '-')
			{
				const numberTest = process.argv[i].substr(1);

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
			
			if(process.argv[i][1] === '-')
			{
				key = process.argv[i].substr(2);
			}
			else
			{
				key = process.argv[i].substr(1);
			}
			
			checkKeyForEqualSign();
		}
		else
		{
			set(process.argv[i]);
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
}

//

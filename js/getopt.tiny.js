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
if(typeof global.__getopt !== 'number')
{
	//
	global.__getopt = Date.now();
	
	//
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

}

//

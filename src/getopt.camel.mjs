/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

//
const
	DEFAULT_CAMEL = '-',
	DEFAULT_FIX = true;

//
import './getopt.ext.mjs';

//
const camel = (_string, _camel = DEFAULT_CAMEL) => {
	if(typeof _string !== 'string')
	{
		return null;
	}
	
	if(!(_string = _string.trim()))
	{
		return '';
	}
	
	if(typeof _camel !== 'string' || !(_camel = _camel.trim()))
	{
		_camel = DEFAULT_CAMEL;
	}
	
	if(_string.includes(_camel + _camel))
	{
		return null;
	}
	
	if(_string.includes(_camel))
	{
		return false;
	}
	
	if(!_string.isLowerCase)
	{
		return true;
	}
	
	return null;
};

export default camel;

//
camel.enable = (_string, _camel = DEFAULT_CAMEL, _fix = DEFAULT_FIX) => {
	if(typeof _string !== 'string')
	{
		return null;
	}
	
	if(!(_string = _string.trim()))
	{
		return '';
	}
	
	if(typeof _camel !== 'string' || !(_camel = _camel.trim()))
	{
		_camel = DEFAULT_CAMEL;
	}
	
	if(camel(_string, _camel) !== false)
	{
		return _string;
	}
	
	if(typeof _fix !== 'boolean')
	{
		_fix = DEFAULT_FIX;
	}

	const	split = _string.split(_camel);
	var	result = split.shift();
	
	for(const s of split)
	{
		if(s)
		{
			if(_fix)
			{
				result += s[0].toUpperCase() + s.substr(1).toLowerCase();
			}
			else
			{
				result += s[0].toUpperCase() + s.substr(1);
			}
		}
	}
	
	return result;
};

camel.disable = (_string, _camel = DEFAULT_CAMEL, _fix = DEFAULT_FIX) => {
	if(typeof _string !== 'string')
	{
		return null;
	}
	
	if(!(_string = _string.trim()))
	{
		return '';
	}
	
	if(typeof _camel !== 'string' || !(_camel = _camel.trim()))
	{
		_camel = DEFAULT_CAMEL;
	}
	
	if(camel(_string, _camel) !== true)
	{
		return _string;
	}

	if(typeof _fix !== 'boolean')
	{
		_fix = DEFAULT_FIX;
	}

	var	result = '',
		lastWasUpper = null;

	for(var i = 0; i < _string.length; ++i)
	{
		if(_string[i].isUpperCase)
		{
			if(lastWasUpper)
			{
				result += _string[i];
			}
			else if(_fix && i < (_string.length - 1))
			{
				if(_string[i + 1].isUpperCase)
				{
					result += _camel + _string[i];
				}
				else
				{
					result += _camel + _string[i].toLowerCase();
				}
			}
			else
			{
				result += _camel + _string[i].toLowerCase();
			}
			
			lastWasUpper = true;
		}
		else
		{
			lastWasUpper = false;
			result += _string[i];
		}
	}
	
	return result;
};

//

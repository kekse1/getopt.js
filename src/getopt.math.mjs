/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

//
Reflect.defineProperty(Math, 'getIndex', { value: (_index, _length) => {
	if(!Number.isInt(_index))
	{
		return undefined;
	}

	if(!Number.isInt(_length) || _length < 1)
	{
		return null;
	}

	if((_index %= _length) < 0)
	{
		return (_length + _index);
	}

	return _index;
}});

//
Reflect.defineProperty(String, 'radixCast', { value: (_string, _length_max = 256) => {
	if(typeof _string !== 'string')
	{
		return undefined;
	}

	// mehr effizienz vs. sicherheit; quasi?!
	if(_string.length > (_length_max || 256))
	{
		return null;
	}
	
	if(!(_string = _string.trim()))
	{
		return 0;
	}
	
	if(_string[0] !== '(')
	{
		if(isNumeric(_string, true))
		{
			if(_string[_string.length - 1] === 'n')
			{
				return BigInt(_string.slice(0, -1));
			}
			
			return Number(_string);
		}
		
		return null;
	}
	
	var	hasRadix = false,
		bigInt = false,
		radix = '',
		value = '',
		result;
	
	for(var i = 1; i < _string.length; ++i)
	{
		if(hasRadix)
		{
			value += _string[i];
		}
		else if(_string[i] === ')')
		{
			if(radix.length === 0)
			{
				return null;
			}
			
			if(Number.isNaN(radix = Number(radix)))
			{
				return null;
			}
			
			if(!Number.isRadix(radix))
			{
				return null;
			}
			
			hasRadix = true;
		}
		else if(bigInt)
		{
			return null;
		}
		else if(_string[i] === 'n')
		{
			bigInt = true;
		}
		else
		{
			radix += _string[i];
		}
	}
	
	if(radix[radix.length - 1] === 'n')
	{
		if(!value)
		{
			return 0n;
		}
		
		if(!(value = value.split('.')[0]))
		{
			return 0n;
		}
	}
	else if(!value)
	{
		return (bigInt ? 0n : 0);
	}

	if(bigInt)
	{
		return BigInt.parse(value, radix);
	}
	
	return Number.parse(value, radix);
}});

Reflect.defineProperty(Number, 'isRadix', { value: (_value) => {
	if(!Number.isInt(_value))
	{
		return false;
	}
	
	return (_value >= 2 && _value <= 36);
}});

const	ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const	sign = (_string) => {
		if(!_string)
		{
			return [ null, 0 ];
		}
		
		var minus = false, cut;
		
		for(cut = 0; cut < _string.length; ++cut)
		{
			if(_string[cut] === '-')
			{
				minus = !minus;
			}
			else if(_string[cut] !== '+')
			{
				break;
			}
		}
		
		return [ minus, cut ];
	};

/*	... gegen rundungsfehler in javascript (w/ `Number.EPSILON`); siehe <lol> auch: ..
		# < https://0.30000000000000004.com/ >
			# < https://github.com/erikwiffin/0.30000000000000004/ >
		# < https://floating-point-gui.de/ >
		# < https://docs.oracle.com/cd/E19957-01/806-3568/ >
... */
const	artefactThreshold = 5;
Reflect.defineProperty(Number, 'artefactThreshold', { value: artefactThreshold });

Reflect.defineProperty(Number, 'parse', { value: (_value, _radix = 10, _int_threshold = artefactThreshold) => {
	if(typeof _value === 'number')
	{
		if(Number.isNumber(_value))
		{
			return _value;
		}
		
		return null;
	}
	
	if(typeof _value !== 'string')
	{
		return null;
	}
	
	const [ negative, cut ] = sign(_value);

	if(cut)
	{
		_value = _value.substr(cut);
	}

	if(!(_value = _value.trim()))
	{
		return 0;
	}
	
	if(!Number.isRadix(_radix))
	{
		if(Number.isInt(_radix))
		{
			throw new Error('Invalid radix/base argument [ 2 .. 36 ]');
		}
		
		_radix = 10;
	}

	if(typeof _int_threshold !== 'boolean' && !Number.isInt(_int_threshold))
	{
		_int_threshold = artefactThreshold;
	}

	const	alphabet = ALPHABET.substr(0, _radix),
		split = _value.split('.');
	var	result = 0,
		mul = 1,
		index;

	if(split.length > 2)
	{
		return null;
	}
	else if(_int_threshold === true)
	{
		split.length = 1;
	}

	var c = 0;
	while(split[0][c++] === '0');
	if(--c) { split[0] = split[0].substr(c); c = 0; }
	if(split[1]) { while(split[1][split[1].length - ++c] === '0');
		if(--c) split[1] = split[1].slice(0, -c); }

	if(split[0]) for(var i = split[0].length - 1; i >= 0; --i)	
	{
		if(split[0][i] === '.')
		{
			if(_int_threshold === false)
			{
				point = i;
			}

			break;
		}
		
		if((index = alphabet.indexOf(split[0][i])) === -1)
		{
			return null;
		}
		
		result += (mul * index);
		mul *= _radix;
	}

	if(split[1])
	{
		mul = (1 / _radix);
		
		for(var i = 0; i < split[1].length; ++i)
		{
			if((index = alphabet.indexOf(split[1][i])) === -1)
			{
				return null;
			}
			
			result += (mul * index);
			mul /= _radix;
		}
	}

	if(negative && result)
	{
		result = -result;
	}
	
	if(result && typeof _int_threshold === 'number')
	{
		var test = result.toString().split('.');

		if(test.length > 1)
		{
			var	digit = null,
				artefact = 0,
				intact = 0;

			test = test[1];
			
			for(var i = 0; i < test.length; ++i)
			{
				if(test[i] === '0')
				{
					if(digit === null)
					{
						digit = 0;
					}
					else if(digit !== 0)
					{
						digit = null;
						artefact = 0;
						++intact;
					}
					else if(++artefact >= _int_threshold)
					{
						break;
					}
				}
				else if(test[i] === '9')
				{
					if(digit === null)
					{
						digit = 9;
					}
					else if(digit !== 9)
					{
						digit = null;
						artefact = 0;
						++intact;
					}
					else if(++artefact >= _int_threshold)
					{
						break;
					}
				}
				else
				{
					artefact = 0;
					++intact;
				}
			}

			if(artefact >= _int_threshold && intact)
			{
				const factor = Math.pow(10, _int_threshold);
				result = (Math.round(result * factor) / factor);
			}
		}
	}
	
	return result;
}});

Reflect.defineProperty(BigInt, 'parse', { value: (_value, _radix = 10) => {
	if(typeof _value === 'bigint')
	{
		return _value;
	}
	
	if(Number.isNumber(_value))
	{
		return BigInt(_value);
	}
	
	if(typeof _value !== 'string')
	{
		return null;
	}
	
	if(!Number.isRadix(_radix))
	{
		if(Number.isInt(_radix))
		{
			throw new Error('Invalid radix/base argument [ 2 .. 36 ]');
		}

		_radix = 10;
	}
	
	if(_radix === 10 && _value[_value.length - 1] === 'n')
	{
		_value = _value.slice(0, -1);
	}
	
	const [ negative, cut ] = sign(_value);
	
	if(cut)
	{
		_value = _value.substr(cut);
	}
	
	var c = 0;
	while(_value[c++] === '0');
	if(--c) { _value = _value.substr(c); c = 0; }
	
	if(!_value)
	{
		return 0n;
	}
	
	const	alphabet = ALPHABET.substr(0, _radix),
		radix = BigInt(_radix);
	var	result = 0n,
		mul = 1n,
		index;
	
	if((_value = _value.split('.')).length > 2)
	{
		return null;
	}
	
	if(!(_value = _value[0]))
	{
		return 0n;
	}
	
	for(var i = _value.length - 1; i >= 0; --i)
	{
		if((index = alphabet.indexOf(_value[i])) === -1)
		{
			return null;
		}
		
		result += (mul * BigInt(index));
		mul *= radix;
	}
	
	if(negative)
	{
		result = -result;
	}
	
	return result;
}});

//
Reflect.defineProperty(globalThis, 'isNumeric', { value: (_value, _string = true) => {
	if(Number.isNumber(_value) || typeof _value === 'bigint')
	{
		return true;
	}

	if(!_string || typeof _value !== 'string')
	{
		return false;
	}

	if(!_value)
	{
		// i don't like the default behavior of `isNaN()`... :-/
		return false;
	}

	if(_value[_value.length - 1] === 'n' && !_value.includes('.'))
	{
		return !isNaN(_value.slice(0, -1));
	}

	return !isNaN(_value);
}});

Reflect.defineProperty(Number, 'isNumber', { value: (_value) => {
	return Number.isFinite(_value);
	
	/*if(typeof _value !== 'number')
	{
		return false;
	}

	if(!Number.isFinite(_value))
	{
		return false;
	}

	if(Number.isNaN(_value))
	{
		return false;
	}*/
}});

Reflect.defineProperty(Number, 'isInt', { value: (_value) => {
	if(!Number.isNumber(_value))
	{
		return false;
	}

	return ((_value % 1) === 0);
}});

Reflect.defineProperty(Number, 'isFloat', { value: (_value) => {
	if(!Number.isNumber(_value))
	{
		return false;
	}

	return ((_value % 1) !== 0);
}});

//


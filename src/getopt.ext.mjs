/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

//
Reflect.defineProperty(String.prototype, 'escape', { value: function()
{
	var result = '', byte;

	for(var i = 0; i < this.length; ++i)
	{
		if((byte = this.charCodeAt(i)) < 32) switch(byte)
		{
			case 0: result += '\\0'; break;
			case 7: result += '\\a'; break;
			case 8: result += '\\b'; break;
			case 9: result += '\\t'; break;
			case 10: result += '\\n'; break;
			case 11: result += '\\v'; break;
			case 12: result += '\\f'; break;
			case 13: result += '\\r'; break;
			case 27: result += '\\e'; break;
			default: result += this[i]; break;
		}
		else
		{
			result += this[i];
		}
	}

	return result;
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

Reflect.defineProperty(String, 'tryCast', { value: (_item, _empty_true = false, _array = false) => {
	if(typeof _item !== 'string')
	{
		return _item;
	}

	var original = _item;
	_item = _item.trim();
	
	if(_item.length === 0)
	{
		return (_empty_true ? true : '');
	}

	if(isNumeric(_item, true))
	{
		if(_item[_item.length - 1] === 'n')
		{
			return BigInt(_item.slice(0, -1));
		}

		return Number(_item);
	}

	switch(_item.toLowerCase())
	{
		case 'true':
		case 'yes':
		case 'on':
			return true;
		case 'false':
		case 'no':
		case 'off':
			return false;
		case 'null':
			return null;
		case 'undefined':
			return undefined;
	}

	if(_array && _item.includes(':'))
	{
		_item = _item.split(':');
		const res = new Array(_item.length);

		for(var i = 0; i < _item.length; ++i)
		{
			res[i] = String.tryCast(
				_item[i].trim(),
				_empty_true,
				false);
		}

		return res;
	}

	return original;
}});

//
Reflect.defineProperty(global, 'isNumeric', { value: (_value, _string = true) => {
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
Reflect.defineProperty(Object, 'isObject', { value: (_item) => {
	return (typeof _item === 'object' && _item !== null);
}});

//
const _sort = Array.prototype.sort;
Reflect.defineProperty(Array.prototype, '_sort', { value: _sort });
Reflect.defineProperty(Array.prototype, 'sort', { value: function(_asc = true)
{
	return _sort.call(this, (_a, _b) => {
		if((_a instanceof Date) && (_b instanceof Date))
		{
			_a = _a.getTime();
			_b = _b.getTime();
		}
		else if(Object.isObject(_a) && Object.isObject(_b))
		{
			_a = Object.keys(_a).length;
			_b = Object.keys(_b).length;
		}

		if(Number.isFinite(_a) && Number.isFinite(_b))
		{
			return (_asc ? (_a - _b) : (_b - _a));
		}
		
		if(typeof _a === 'bigint' && typeof _b === 'bigint')
		{
			if(_a < _b) return (_asc ? -1 : 1);
			if(_a > _b) return (_asc ? 1 : -1);
			return 0;
		}
		
		if(typeof _a === 'string' && typeof _b === 'string')
		{
			if(_asc) return _a.localeCompare(_b);
			return _b.localeCompare(_a);
		}
		
		try
		{
			if(_a < _b) return (_asc ? -1 : 1);
			if(_a > _b) return (_asc ? 1 : -1);
			return 0;
		}
		catch(_err)
		{
		}

		return 0;
	});
}});

//


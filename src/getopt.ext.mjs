/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

//
import './getopt.math.mjs';

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

Reflect.defineProperty(String, 'tryCast', { value: (_item, _opts) => {
	if(typeof _item !== 'string')
	{
		return _item;
	}
	
	_opts = Object.assign({},
		{ empty: false, array: false },
		_opts);

	var original = _item;
	_item = _item.trim();
	
	if(_item.length === 0)
	{
		return (_opts.empty ? true : '');
	}

	if(isNumeric(_item, true))
	{
		if(_item[_item.length - 1] === 'n')
		{
			return BigInt(_item.slice(0, -1));
		}

		return Number(_item);
	}
	
	if(_opts.radix)
	{
		const radixCast = String.radixCast(_item);
		
		if(radixCast !== null)
		{
			return radixCast;
		}
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

	if(_opts.array && _item.includes(':'))
	{
		_item = _item.split(':');
		const res = new Array(_item.length);

		for(var i = 0; i < _item.length; ++i)
		{
			res[i] = String.tryCast(_item[i].trim(),
				Object.assign({}, _opts, { array: false }));
		}

		return res;
	}

	return original;
}});

//
Reflect.defineProperty(Object, 'isObject', { value: (_item) => {
	return (typeof _item === 'object' && _item !== null);
}});

//
const _sort = Array.prototype.sort;
Reflect.defineProperty(Array.prototype, '_sort', { value: _sort });
Reflect.defineProperty(Array.prototype, 'sort', { value: function(_asc = true, ... _args)
{
	if(typeof _asc === 'function')
	{
		return _sort.call(this, _asc, ... _args);
	}

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
		}
		catch(_err)
		{
		}

		return 0;
	});
}});

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


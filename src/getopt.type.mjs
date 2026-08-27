/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

//
const DEFAULT_THROW = true;

//
import './getopt.ext.mjs';

//
const types = [
	'path',
	'directory',
	'dir',
	'file',
	'link',
	'symlink',
	'device',
	'fifo',
	'socket',
	'hostname',
	'host',
	'port',
	'string',
	'str',
	'char',
	'character',
	'byte',
	'integer',
	'int',
	'float',
	'double',
	'number',
	'numeric',
	'radix',
	'rdx',
	'boolean',
	'bool',
	'regexp',
	'bigint',
	'big',
	'function',
	'func',
	'object',
	'obj',
	'null',
	'nul',
	'undefined',
	'undef'
];

//
//TODO/the specific tests.. atm mostly only string-check, etc... ^_^
//
const type = (_value, _types, _throw = DEFAULT_THROW) => {
	if(type.noTypes(_types))
	{
		return undefined;
	}

	if(!(_types = typesArgument(_types)))
	{
		if(_throw)
		{
			throw new Error('Invalid _types argument');
		}
		
		return null;
	}
	
	for(const t of _types) switch(t)
	{
		case 'string':
		case 'str':
		case 'path':
		case 'directory':
		case 'dir':
			if(typeof _value === 'string')
			{
				return true;
			}
			break;
		case 'file':
		case 'link':
		case 'symlink':
		case 'device':
		case 'fifo':
		case 'socket':
		case 'hostname':
		case 'host':
			if(typeof _value === 'string' && _value.length > 0)
			{
				return true;
			}
			break;
		case 'port':
			if(Number.isInt(_value) && _value >= 0 && _value < 65536)
			{
				return true;
			}
			break;
		case 'char':
		case 'character':
			if(typeof _value === 'string' && _value.length === 1)
			{
				return true;
			}
			break;
		case 'byte':
			if(Number.isInt(_value) && _value >= 0 && _value <= 255)
			{
				return true;
			}
			break;
		case 'integer':
		case 'int':
			if(Number.isInt(_value))
			{
				return true;
			}
			break;
		case 'float':
		case 'double':
			if(Number.isFloat(_value))
			{
				return true;
			}
			break;
		case 'number':
			if(Number.isNumber(_value))
			{
				return true;
			}
			break;
		case 'numeric':
			if(typeof _value === 'bigint')
			{
				return true;
			}
			
			if(Number.isNumber(_value))
			{
				return true;
			}
			break;
		case 'radix':
		case 'rdx':
			if(Number.isInt(_value) && _value >= 2 && _value <= 36)
			{
				return true;
			}
			break;
		case 'boolean':
		case 'bool':
			if(typeof _value === 'boolean')
			{
				return true;
			}
			break;
		case 'regexp':
			if(_value instanceof RegExp)
			{
				return true;
			}
			break;
		case 'bigint':
		case 'big':
			if(typeof _value === 'bigint')
			{
				return true;
			}
			break;
		case 'function':
		case 'func':
			if(typeof _value === 'function')
			{
				return true;
			}
			break;
		case 'object':
		case 'obj':
			if(Object.isObject(_value))
			{
				return true;
			}
			break;
		case 'null':
		case 'nul':
			if(_value === null)
			{
				return true;
			}
			break;
		case 'undefined':
		case 'undef':
			if(typeof _value === 'undefined')
			{
				return true;
			}
			break;
	}
	
	return false;
};

//
type.noTypes = (_types) => (typeof _types ===
		'undefined' || _types === null);

type.validTypesString = (_types) => {
	if(typeof _types === 'string')
	{
		if(_types.length === 0)
		{
			return '[]';
		}

		return '[ ' + _types.toLowerCase() + ' ]';
	}

	if(Array.isArray(_types))
	{
		if(_types.length === 0)
		{
			return '[]';
		}

		var result = '[ ';

		for(var i = 0; i < _types.length; ++i)
		{
			result += _types[i].toLowerCase() + ', ';
		}

		return (result.slice(0, -2) + ' ]');
	}

	return null;
};

type.isError = (_types) => {
	if(type.noTypes(_types))
	{
		return false;
	}

	if(typesArgument(_types))
	{
		return false;
	}

	return true;
};

type.isTypes = (_types) => {
	if(type.noTypes(_types))
	{
		return null;
	}

	if(typesArgument(_types))
	{
		return true;
	}

	return false;
};

const typesArgument = (_types) => {
	if(type.noTypes)
	{
		return undefined;
	}

	var result;
	
	if(typeof _types === 'string')
	{
		result = [ _types ];
	}
	else if(Array.isArray(_types))
	{
		result = _types;
	}
	else
	{
		return null;
	}
	
	if(result.length === 0)
	{
		return null;
	}
	
	for(var i = 0; i < result.length; ++i)
	{
		if(typeof result[i] !== 'string')
		{
			return null;
		}
		
		if(!(result[i] = result[i].trim()))
		{
			return null;
		}
		
		result[i] = result[i].toLowerCase();
	}
	
	return result;
};

//
Reflect.defineProperty(type, 'types', {
	get: () => [ ... types ] });
Reflect.defineProperty(type, 'TYPES', {
	get: () => new Set(types) });

//
const TYPES = new Set(types);

//
export default type;

//


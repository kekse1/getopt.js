/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://norbert.com.es/
 */

//
const DEFAULT_CHECK = true;

//
const type = (_value, _types, _check = DEFAULT_CHECK) => {
	var result = '';

	if(string(_types, false))
	{
		_types = [ _types ];
	}
	else if(!array(_types, false))
	{
		throw new Error('Invalid _types argument');
	}

	if(_check) for(var i = 0; i < _types.length; ++i)
	{
		if(typeof _types[i] !== 'string' || _types[i].length === 0)
		{
			throw new Error('Invalid type[' + i + ']');
		}

		if(!TYPES.has(_types[i] = _types[i].toLowerCase()))
		{
			throw new Error('Unknown type[' + i + ']: `' + _types[i] + '`');
		}
	}
	
	for(const t of _types) switch(t)
	{
		case 'path':
		case 'directory':
		case 'dir':
		case 'file':
		case 'link':
		case 'symlink':
		case 'device':
		case 'fifo':
		case 'socket':
			if(string(_value, false)) return true;
			break;
		case 'hostname':
			if(hostname(_value)) return true;
			break;
		case 'host':
			if(host(_value)) return true;
			break;
		case 'port':
			if(port(_value)) return true;
			break;
		case 'string':
		case 'str':
			if(string(_value)) return true;
			break;
		case 'char':
		case 'character':
			if(char(_value)) return true;
			break;
		case 'byte':
			if(byte(_value)) return true;
			break;
		case 'integer':
		case 'int':
			if(int(_value)) return true;
			break;
		case 'float':
		case 'double':
			if(float(_value)) return true;
			break;
		case 'number':
			if(number(_value)) return true;
			break;
		case 'numeric':
			if(numeric(_value)) return true;
			break;
		case 'radix':
		case 'rdx':
			if(isRadix(_value)) return true;
			break;
		case 'boolean':
		case 'bool':
			if(bool(_value)) return true;
			break;
		case 'regexp':
			if(regexp(_value)) return true;
			break;
		case 'bigint':
		case 'big':
			if(bigint(_value)) return true;
			break;
		case 'function':
		case 'func':
			if(func(_value)) return true;
			break;
		case 'object':
		case 'obj':
			if(object(_value)) return true;
			break;
		case 'null':
		case 'nul':
			if(nul(_value)) return true;
			break;
		case 'undefined':
		case 'undef':
			if(undef(_value)) return true;
			break;
	}
	
	return false;
};

//
type.validTypesString = (_types) => {
	if(string(_types, false)) return '[ ' + _types.toLowerCase() + ' ]';
	else if(!array(_types, false)) return '[]';
	var result = '[ '; for(const t of _types)
		result += t.toLowerCase() + ', ';
	result = result.slice(0, -2) + ' ]';
	return result;
};

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

Reflect.defineProperty(type, 'types', {
	get: () => [ ... types ] });
Reflect.defineProperty(type, 'TYPES', {
	get: () => new Set(types) });

const TYPES = new Set(types);

//
export default type;

//


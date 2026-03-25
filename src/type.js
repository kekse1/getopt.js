/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/
 */

//
const type = (_value, _types) => {
	var result = '';

	if(string(_types, false))
	{
		_types = [ _types ];
	}
	else if(!array(_types, false))
	{
		throw new Error('Invalid _types argument');
	}
	
	for(const t of _types) switch(t.toLowerCase())
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
			if(nul(_value)) return true;
			break;
		case 'undefined':
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
Reflect.defineProperty(type, 'types', { get: () => [
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
	'undefined'
]});

export default type;

//


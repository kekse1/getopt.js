/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

/*
 * TODO * options(/vect..) wie v.a. {index} umsetzen.
 *	.. v.a. denke ich an {vector}-usage. w/ .parse(); ...
 */

//
const
	DEFAULT_LIST = true,
	DEFAULT_CAST = true,
	DEFAULT_CAST_REGULAR = false,
	DEFAULT_INDEX = -1,
	DEFAULT_UNESCAPE = true,
	DEFAULT_UNESCAPE_REGULAR = false,
	DEFAULT_PARAM = 0,
	DEFAULT_ASSIGN = true,
	DEFAULT_SPLIT = true,
	DEFAULT_HELP = true,
	DEFAULT_MAKE = true,
	DEFAULT_EXPAND = false,
	DEFAULT_ARRAY = true,
	DEFAULT_THROW = false,
	DEFAULT_ALL = false;

//
var	ALLOWED_KEY_CHARACTERS = '',
	_ALLOWED_KEY_CHARACTERS;

(() => {
	//
	for(var i = 33; i <= 44; ++i)
	{
		ALLOWED_KEY_CHARACTERS +=
			String.fromCharCode(i);
	}
	
	for(var i = 46; i <= 57; ++i)
	{
		ALLOWED_KEY_CHARACTERS +=
			String.fromCharCode(i);
	}
	
	for(var i = 63; i <= 90; ++i)
	{
		ALLOWED_KEY_CHARACTERS +=
			String.fromCharCode(i);
	}
	
	for(var i = 94; i <= 95; ++i)
	{
		ALLOWED_KEY_CHARACTERS +=
			String.fromCharCode(i);
	}
	
	for(var i = 97; i <= 122; ++i)
	{
		ALLOWED_KEY_CHARACTERS +=
			String.fromCharCode(i);
	}
	
	ALLOWED_KEY_CHARACTERS +=
		String.fromCharCode(126);

	//
	_ALLOWED_KEY_CHARACTERS = new Set(
		ALLOWED_KEY_CHARACTERS.
			split(''));
})();

//
import './getopt.ext.mjs';
import type from './getopt.type.mjs';

//
class GetOpt extends Array
{
	constructor(_vector, _options, _argv = process.argv, _start)
	{
		super();

		this.options = Object.assign(this.
			constructor.options,
			_options);
		this.map = new Map();

		if(!Array.isArray(_argv))
		{
			_argv = process.argv;
		}

		if(!Number.isInt(_start))
		{
			if(_argv === process.argv)
			{
				_start = 2;
			}
			else
			{
				_start = 0;
			}
		}

		this.start = _start;
		this.argv = _argv;

		if(Object.isObject(_vector))
		{
			this.vector = _vector;
		}
		else
		{
			this.long = null;
			this.short = null;
		}
	}

	get object()
	{
		const result = [ ... this ];

		Object.assign(result, {
			exec: this.exec,
			script: this.script,
			argv: this.argv,
			start: this.start,
			isEmpty: this.isEmpty,
			isParsed: this.isParsed,
			simple: this.simple,
			extended: this.extended,
			allowedKeyCharacters:
				ALLOWED_KEY_CHARACTERS,
			vector: this.vector,
			KEYS: this.KEYS,
			size: this.size,
			length: this.length,
			keys: this.keys,
			map: this.map,
		});

		return result;
	}

	get exec()
	{
		var result;

		if(this.start >= 1)
		{
			result = (this.argv[0] || null);
		}

		if(!result)
		{
			result = process.argv[0];
		}

		return result;
	}

	get script()
	{
		var result;

		if(this.start >= 2)
		{
			result = (this.argv[1] || null);
		}

		if(!result)
		{
			result = process.argv[1];
		}

		return result;
	}
	
	get start()
	{
		return this.options.start;
	}

	set start(_value)
	{
		if(!Number.isInt(_value))
		{
			if(this.argv === process.argv)
			{
				_value = 2;
			}
			else
			{
				_value = 0;
			}
		}
		else if(_value < 0)
		{
			_value = 0;
		}

		return (this.options.start = _value);
	}

	static get type()
	{
		return type;
	}

	get isParsed()
	{
		return !!this._isParsed;
	}

	get vector()
	{
		return (this._vector || null);
	}

	set vector(_value)
	{
		if(!Object.isObject(_value))
		{
			this.long = this.short = null;
			return this._vector = null;
		}

		if(Object.keys(_value).length === 0)
		{
			this.long = this.short = null;
			return this._vector = null;
		}

		return this._vector = this.
			handleVector(_value);
	}

	get simple()
	{
		return !this._vector;
	}
	
	get extended()
	{
		return !!this._vector;
	}

	static get options()
	{
		return {
			cast: DEFAULT_CAST,
			castRegular: DEFAULT_CAST_REGULAR,
			array: DEFAULT_ARRAY,
			list: DEFAULT_LIST,
			index: DEFAULT_INDEX,
			unescape: DEFAULT_UNESCAPE,
			unescapeRegular: DEFAULT_UNESCAPE_REGULAR,
			assign: DEFAULT_ASSIGN,
			split: DEFAULT_SPLIT,
			throw: DEFAULT_THROW,
			help: DEFAULT_HELP,
			expand: DEFAULT_EXPAND,
			param: DEFAULT_PARAM,
			make: DEFAULT_MAKE,
			all: DEFAULT_ALL
		};
	}

	static create(_param)
	{
		if(!Object.isObject(_param))
		{
			_param = {};
		}

		const result = new GetOpt(
			_param.vector,
			_param.options,
			_param.argv,
			_param.start);

		result.parse(_param.throw, true);
		return result;
	}

	//
	//todo/...
	//
	static createItem(_index, ... _args)
	{
		const result = Object.assign(
			this.item, ... _args);
		return result;
	}

	get item()
	{
		const keys = this.constructor.sameKeys;
		const result = this.constructor.item;
		const opts = this.options;
		for(const k of keys) result[k] = opts[k];
		return result;
	}

	static get item()
	{
		return {
			param: DEFAULT_PARAM,
			index: DEFAULT_INDEX,
			array: DEFAULT_ARRAY,
			list: DEFAULT_LIST,
			long: '',
			short: '',
			cast: DEFAULT_CAST,
			unescape: DEFAULT_UNESCAPE,
			assign: DEFAULT_ASSIGN,
			split: DEFAULT_SPLIT,
			make: DEFAULT_MAKE
		};
	}

	static get sameKeys()
	{
		return [
			'assign',
			'split',
			'array',
			'list',
			'cast',
			'index',
			'make',
			'param',
			'unescape'
		];
	}

	getIndex(_key, _index = this.options.index)
	{
		const value = this.get(_key);

		if(!Array.isArray(value))
		{
			return null;
		}

		return Math.getIndex(_index,
			value.length);
	}

	static handleVector(_vector)
	{
throw new Error('todo');
		/*const result = {};

		var key; for(const idx in _vector)
		{
			if(!_vector[idx])
			{
				continue;
			}

			key = this.removePrefix(idx);

			_vector[idx].index = this.removePrefix(
				_vector[idx].index);
			_vector[idx].long = this.removePrefix(
				_vector[idx].long);
			_vector[idx].short = this.removePrefix(
				_vector[idx].short);

			//
			result[key] = _vector[idx];
		}

		return result;*/
	}
	
	static checkVector(_vector, _throw = DEFAULT_THROW)
	{
throw new Error('todo');
		/*const set = new Set();
		
		for(const idx in _vector)
		{
			if(_vector[idx].long)
			{
				if(set.has(_vector[idx].long))
				{
					if(_throw) throw new Error('The long key `' +
							_vector[idx].long + '` ' +
							'already exists');
					return false;
				}
			}
			else
			{
			
			if(set.has(_vector[idx].short))
			{
				if(_throw) throw new Error('The short key `' +
						_vector[idx].short + '` ' +
						'already exists');
				return false;
			}
			
			set.add(_vector[idx].long);
			set.add(_vector[idx].short);
		}
		
		return true;*/
	}
//zzzzzzzzzzz
	//
	//todo/u.a. fehlende {long} mit vektor-index fuellen,
	//	.. alles auf mehrfache testen, .. make-shorts, ...
	//
	handleVector(_vector)
	{
		_vector = this.constructor.
			handleVector(_vector);
		this.constructor.
			checkVector(_vector);

		if(this.options.make)
		{
			this.constructor.
				makeShorts(
					_vector);
		}

		this.indexVector(_vector);
		return _vector;
	}

	indexVector(_vector)
	{
		this.long = new Map();
		this.short = new Map();

		for(const idx in _vector)
		{
			if(_vector[idx].long)
			{
				this.long.set(_vector[idx].
					long, idx);
			}

			if(_vector[idx].short)
			{
				this.short.set(_vector[idx].
					short, idx);
			}
		}
	}

	static makeShorts(_vector, _item)
	{
		const	set = new Set(),
			result = [],
			todo = [];
		var	rand = 65,
			short, s;

		for(const idx in _vector)
		{
			if(_vector[idx].short)
			{
				if(set.has(_vector[idx].short))
				{
					throw new Error('Invalid short key (is not unique)');
				}

				set.add(_vector[idx].short);
			}
			else
			{
				todo.push(idx);
			}
		}

		const findShort = (_item, _key) => {
			var	key;

			if(_item.long)
			{
				key = _item.long;
			}
			else
			{
				key = _key;
			}

			for(var i = 0; i < key.length; ++i)
			{
				if(!set.has(key[i]))
				{
					set.add(key[i]);
					return _item.short = key[i];
				}
			}
			
			if(_item.long && _item.long !== _key)
			{
				key = _key;

				for(var i = 0; i < key.length; ++i)
				{
					if(!set.has(key[i]))
					{
						set.add(key[i]);
						return _item.short = key[i];
					}
				}
			}

			do
			{
				key = String.fromCharCode(rand++);

				if(rand === 91)
				{
					rand = 97;
				}

				if(!set.has(key))
				{
					set.add(key);
					return _item.short = key;
				}
			}
			while(rand <= 122);

			return '';
		};

		while(todo.length > 0)
		{
			s = todo.shift();

			if(!findShort(_vector[s], s))
			{
				result.push(s);
				break;
			}
		}

		result.push(... todo);
		return result;
	}
	
	reset()
	{
		this.options = this.
			constructor.options;
		this.vector = null;
		this.clear();
	}

	clear()
	{
		this.length = 0;
		this.map.clear();
		this._isParsed = false;
	}

	lookUp(_key, _throw = this.options.throw)
	{
		const vector = this._vector;

		if(!vector)
		{
			if(_throw)
			{
				throw new Error('No vector defined');
			}

			return undefined;
		}

		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(_key.length === 1)
		{
			if(this.short.has(_key))
			{
				return this.short.get(_key);
			}

			if(_throw)
			{
				throw new Error('No such short key `' + _key + '`');
			}

			return null;
		}

		if(this.long.has(_key))
		{
			return this.long.get(_key);
		}

		if(_throw)
		{
			throw new Error('No such long key `' + _key + '`');
		}

		return null;
	}

	handleResult(_result)
	{
		if(_result && this.vector && this.options.help && this.help)
		{
			//
			//this.HELP(); ...
			//
			throw new Error('todo');
		}
		
		return _result;
	}

	parse(_throw = null, _force = false)
	{
		if(typeof _throw === 'boolean')
		{
			this.options.throw = _throw;
		}
		else
		{
			_throw = this.options.throw;
		}

		if(this._isParsed)
		{
			if(_force)
			{
				this.clear();
			}
			else
			{
				throw new Error('It\'s already parsed..');
			}
		}
		
		if(this.isEmpty)
		{
			return null;
		}

		const result = this.PARSE();

		if(result)
		{
			this._isParsed = true;
		}

		return this.handleResult(result);
	}
	
	PARSE()
	{
		const	vector = this.vector,
			hasVector = !!vector,
			argv = this.argv,
			keys = [];
		var	index = 0,
			unescape,
			idx, tmp,
			string,
			array,
			list,
			item,
			cast,
			key,
			esc,
			i;

		const push = (_value) => {
			this[index++] = this.constructor.handleString(
				_value, this.options.unescapeRegular,
				this.options.castRegular, false,
				this.options.array);
			return true;
		};

		const set = (_value, _reset = false) => {
			if(keys.length === 0)
			{
				return push(_value);
			}

			key = this.constructor.key(
				keys.shift(), false,
				this.options.all === null);

			if(hasVector)
			{
				if(item = this.lookUp(key,
					this.options.throw))
				{
					key = item;
					item = vector[item];

					unescape = item.unescape;
					array = item.array;
					list = item.list;
					cast = item.cast;
				}
				else if(!this.options.all)
				{
					if(this.options.all === null)
					{
						throw new Error('Unknown key `' + key + '`');
					}

					return false;
				}
			}
			else
			{
				unescape = this.options.unescape;
				array = this.options.array;
				list = this.options.list;
				cast = this.options.cast;
			}

			_value = this.constructor.handleString(
				_value, unescape, cast, true, array);

			//
			if(!_reset && this.options.list && this.map.has(key))
			{
				item = this.map.get(key);

				if(Array.isArray(item))
				{
					item.push(_value);
				}
				else
				{
					this.map.set(key,
						[ item,
						  _value ]);
				}
			}
			else
			{
				this.map.set(key, _value);
			}
			
			return true;
		};

		//
		for(i = this.options.start; i < argv.length; ++i)
		{
			string = argv[i];

			if(string.length === 0)
			{
				set('', false);
			}
			else if(string === '-')
			{
				set('-', false);
			}
			else if(string === '--')
			{
				while(keys.length > 0)
				{
					set('', false);
				}

				break;
			}
			else if(string[0] === '-' && isNaN(string))
			{
				while(keys.length > 0)
				{
					set('', false);
				}

				if(string[1] === '-')
				{
					key = string.substr(2);
					
					if(key.length < 2)
					{
						if(this.options.throw)
						{
							throw new Error('One character keys are SHORTs, using one `-`');
						}
						
						push(string);
					}
					else
					{
						tmp = esc = '';
						idx = -1;

						for(var j = 0; j < key.length; ++j)
						{
							if(key[j] === '\\')
							{
								if(j < (key.length - 1))
								{
									tmp += key[++j];
								}
								else
								{
									tmp += '\\';
								}
							}
							//TODO/alle hiesigen opts{} bei vector{}..!!
							else if(key[j] === '=' && this.options.assign)
							{
								idx = j;
								esc = '=';
								break;
							}
							//TODO/alle hiesigen opts{} bei vecror{}..!!
							else if(key[j] === ' ' && this.options.split)
							{
								idx = j;
								esc = ' ';
								break;
							}
							else
							{
								tmp += key[j];
							}
						}

						if(idx > -1)
						{
							if(idx > 0)
							{
								keys[0] = tmp;
							}

							set(	key.substr(idx + 1),
								(esc === '='));
						}
						else
						{
							keys[0] = key;
						}
					}
				}
				else
				{
					key = string.substr(1);
					
					if(this.options.expand)
					{
						tmp = esc = '';
						idx = -1;

						for(var j = 0; j < key.length; ++j)
						{
							if(key[j] === '\\')
							{
								if(j < (key.length - 1))
								{
									tmp += key[++j];
								}
								else
								{
									tmp += '\\';
								}
							}
							//TODO/alle hiesigen opts{} bei vector{}..!!
							else if(key[j] === '=' && this.options.assign)
							{
								idx = j;
								esc = '=';
								break;
							}
							//TODO/alle hiesigen opts{} bei vector{}..!!
							else if(key[j] === ' ' && this.options.split)
							{
								idx = j;
								esc = ' ';
								break;
							}
							else
							{
								tmp += key[j];
							}
						}

						if(idx > -1)
						{
							if(tmp.length === 0)
							{
								set(	key.substr(idx + 1),
									(esc === '='));
							}
							else if(tmp.length === 1)
							{
								keys[0] = tmp;
								set(	key.substr(idx + 1),
									(esc === '='));
							}
							else
							{
								if(esc === '=')
								{
									tmp = tmp.split('');

									for(var j = 0; j < tmp.length; ++j)
									{
										keys[0] = tmp[j];
										set(	key.substr(idx + 1),
											true);
									}
								}
								else
								{
									keys.push(... tmp.split(''));
									set(	key.substr(idx + 1),
										false);
								}
							}
						}
						else if(key.length === 1)
						{
							keys[0] = key;
						}
						else
						{
							keys.push(... key.split(''));
						}
					}
					else
					{
						keys[0] = key[0];
						set(	key.substring(1),
							false);
					}
				}
			}
			else
			{
				set(string, false);
			}
		}

		while(keys.length > 0)
		{
			set('', false);
		}

		for(; i < argv.length; ++i)
		{
			push(argv[i]);
		}

		//
		return true;
	}

	static handleString(_item, _unescape = true, _cast = true, _empty_true = null, _array = DEFAULT_ARRAY)
	{
		var result = _item;

		if(typeof result !== 'string')
		{
			return result;
		}

		if(_cast)
		{
			result = String.tryCast(result, _empty_true, _array);

			if(typeof result !== 'string')
			{
				return result;
			}
		}

		if(_unescape)
		{
			result = result.unescape();
		}

		return result;
	}

	get isEmpty()
	{
		return (this.argv.length <= this.options.start);
	}

	get help()
	{
		return !!(	this.map.get('--help') ||
				this.map.get('-h') ||
				this.map.get('-?'));
	}
	
	HELP()
	{
		if(!this.vector)
		{
			return null;
		}
		
		const	keys = Object.keys(this.vector).sort(true),
			stream = this.constructor.getTTY(),
			vector = this.vector,
			result = [];
		var	lines = 0;

		if(keys.length === 0)
		{
			return [ result, stream ];
		}

		//
		//TODO/auto-generated (lines @ result[]); ...
		//...
		//
		//const	long = .....,
		//	short = ....;

		//
		return [ result, stream ];
	}

	static getTTY()
	{
		if(process.stdout.isTTY)
		{
			return process.stdout;
		}

		if(process.stderr.isTTY)
		{
			return process.stderr;
		}

		return null;
	}

	get size()
	{
		return this.map.size;
	}

	get keys()
	{
		return [ ... this.map.keys() ].sort(true);
	}
	
	get KEYS()
	{
		if(this.vector)
		{
			return Object.keys(this.vector).sort(true);
		}
		
		return null;
	}

	static removePrefix(_string)
	{
		if(typeof _string !== 'string') return '';
		var count = 0; while(_string[count++] === '-');
		if(--count) _string = _string.substr(count);
		return _string;
	}

	static keyCharacterFilter(_string, _throw = DEFAULT_THROW)
	{
		var result = '';
		
		for(var i = 0; i < _string.length; ++i)
		{
			if(_ALLOWED_KEY_CHARACTERS.has(_string[i]))
			{
				result += _string[i];
			}
			else if(_throw)
			{
				throw new Error('Invalid character');
			}
		}
		
		return result;
	}
	
	static key(_string, _prefix, _throw = DEFAULT_THROW)
	{
		if(typeof _string !== 'string' || _string.length === 0)
		{
			return null;
		}
		
		if(!(_string = this.keyCharacterFilter(this.
			removePrefix(_string), _throw)))
		{
			return null;
		}
		
		if(!_prefix)
		{
			return _string;
		}
		
		if(_string.length === 1)
		{
			return ('-' + _string);
		}
		
		return ('--' + _string);
	}

	static checkTypes(_item, _types, _throw = DEFAULT_THROW)
	{
		if(type.noTypes(_types))
		{
			return undefined;
		}
		
		return type(_item, _types, _throw);
	}
	
	checkTypes(_item, _types, _throw = this.options.throw)
	{
		return this.constructor.checkTypes(
			_item, _types, _throw);
	}
	
	prepareKeyUsage(_key, _throw = this.options.throw)
	{
		const result = this.constructor.key(
				_key, false, _throw);
		
		if(!result && _throw)
		{
			throw new Error('Invalid _key argument');
		}
		
		return result;
	}

	findKey(_key, _throw = this.options.throw)
	{
		if(!this._vector)
		{
			return _key;
		}

		if(this._vector[_key])
		{
			return _key;
		}

		const result = this.lookUp(_key, false);

		if(result)
		{
			return result;
		}

		if(_throw)
		{
			throw new Error('Unable to find vector index' +
				' for key `' + _key + '`');
		}

		return null;
	}

	has(_key, _types, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}

		if(!this.map.has(_key))
		{
			return false;
		}

		return this.checkTypes(this.
			map.get(_key), _types);
	}

	type(_key, _types, _throw = this.options.throw)
	{
		if(type.noTypes(_types))
		{
			if(_throw)
			{
				throw new Error('Invalid _types argument');
			}
			
			return null;
		}
		
		if(!this.has(_key))
		{
			return undefined;
		}

		return this.checkTypes(
			this.get(_key),
			_types, _throw);
	}

	get(_key, _types, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}
		
		if(!this.map.has(_key))
		{
			if(_throw)
			{
				throw new Error('No such key');
			}
			
			return undefined;
		}
		
		const result = this.map.get(_key);
		
		if(!type.noTypes(_types))
		{
			if(!(checkTypes(result, _types, _throw)))
			{
				return null;
			}
		}
		
		return result;
	}

	set(_key, _value, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}
		
		const result = this.map.get(_key);
		this.map.set(_key, _value);
		return result;
	}

	remove(_key, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}

		if(!this.map.has(_key))
		{
			return undefined;
		}

		const result = this.map.get(_key);
		this.map.delete(_key);
		return result;
	}

	push(_key, _value, _throw = this.options.throw)
	{
		var result = this.getList(_key, _throw);
		
		if(result)
		{
			result = result.push(_value);
		}
		
		return result;
	}
	
	unshift(_key, _value, _throw = this.options.throw)
	{
		var result = this.getList(_key, _throw);
		
		if(result)
		{
			result = result.unshift(_value);
		}
		
		return result;
	}
	
	pop(_key, _throw = this.options.throw)
	{
		var result = this.getList(_key, _throw);
		
		if(result)
		{
			result = result.pop();
		}
		
		return result;
	}
	
	shift(_key, _throw = this.options.throw)
	{
		var result = this.getList(_key, _throw);
		
		if(result)
		{
			result = result.shift();
		}
		
		return result;
	}

	insert(_key, _index, _value, _throw = this.options.throw)
	{
		var result = this.getList(_key, _throw);
		
		if(result && (_index = Math.getIndex(_index, result.length)) !== null)
		{
			result = result.splice(_index, 0, _value);
			result = result.length;
		}
		
		return result;
	}

	getList(_key, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}

		if(!this.map.has(_key))
		{
			if(_throw)
			{
				throw new Error('No such key');
			}
			
			return null;
		}
		
		const item = this.map.get(_key);
		
		if(Array.isArray(item))
		{
			return item;
		}
		
		if(_throw)
		{
			throw new Error('Item is not a List');
		}
		
		return null;
	}
	
	isList(_key, _throw = this.options.throw)
	{
		if(!(_key = this.prepareKeyUsage(_key, _throw)))
		{
			return null;
		}

		if(!(_key = this.findKey(_key, _throw)))
		{
			return undefined;
		}

		if(!this.map.has(_key))
		{
			if(_throw)
			{
				throw new Error('No such key');
			}
			
			return null;
		}
		
		return Array.isArray(this.map.get(_key));
	}
}

export default GetOpt;

//


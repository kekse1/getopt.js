/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/  https://github.com/kekse1/getopt/
 */

/*
 * TODO * options(/vect..) wie v.a. {index} umsetzen.
 *	.. u.a. denke ich an {vector}-usage. w/ .parse(); ...
 * TODO * some more things... please finish all of 'em!1!1 ..
 */

//
const
	DEFAULT_LIST = true,
	DEFAULT_CAST = true,
	DEFAULT_CAST_REGULAR = false,
	DEFAULT_CAST_RADIX = true,
	DEFAULT_CAST_EMPTY = true,
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
	DEFAULT_THROW_GETOPT = false,
	DEFAULT_THROW = true,
	DEFAULT_FORCE = false,
	DEFAULT_ALL = false,
	DEFAULT_CAMEL = true,
	DEFAULT_CAMEL_CHAR = '-',
	DEFAULT_CAMEL_FIX = true;

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
		this.vector = _vector;
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
			options: this.options,
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
		if(!this.constructor.checkVector(_value))
		{
			this.long = this.short = null;
			return this._vector = null;
		}

		this._vector = {};
		this.long = new Map();
		this.short = new Map();

		for(const idx in _value)
		{
			this.addItem(idx, _value);
		}

		return this._vector;
	}
	
	removeVector()
	{
		return this.vector = null;
	}

	setVector(_value)
	{
		return this.vector = _value;
	}

	addVector(_value)
	{
		if(!this.constructor.checkVector(_value))
		{
			return this.vector;
		}

		if(!this.isValidVector)
		{
			return this.vector = _value;
		}
		
		const	oldKeys = new Set(Object.keys(this._vector)),
			newKeys = Object.keys(_value);

		for(const key of newKeys)
		{
			if(!oldKeys.has(key) && this.constructor.checkVectorItem(_value[key]))
			{
				this.addItem(key, _value[key]);
			}
		}

		return this.vector;
	}

	//
	//TODO/maybe use this.. for filtering or error `throw` if(.options.throw); ..
	//
	static checkVector(_vector)
	{
		if(!Object.isObject(_vector))
		{
			return null;
		}

		for(const idx in _vector)
		{
			if(!this.checkVectorItem(_vector[idx]))
			{
				return false;
			}
		}

		return true;
	}
	
	//
	//TODO/maybe even more complex checks somewhere..!??!1
	//
	static checkVectorItem(_value)
	{
		return Object.isObject(_value);
	}

	get isValidVector()
	{
		const result = !!this.constructor.
			checkVector(this._vector);

		if(!result)
		{
			this._vector = this.long = this.short = null;
		}

		return result;
	}
	
	get simple()
	{
		return this.emptyVector;
	}
	
	get extended()
	{
		return !this.emptyVector;
	}

	static get options()
	{
		return {
			cast: DEFAULT_CAST,
			castRegular: DEFAULT_CAST_REGULAR,
			empty: DEFAULT_CAST_EMPTY,
			radix: DEFAULT_CAST_RADIX,
			array: DEFAULT_ARRAY,
			list: DEFAULT_LIST,
			index: DEFAULT_INDEX,
			unescape: DEFAULT_UNESCAPE,
			unescapeRegular: DEFAULT_UNESCAPE_REGULAR,
			assign: DEFAULT_ASSIGN,
			split: DEFAULT_SPLIT,
			throw: DEFAULT_THROW_GETOPT,
			force: DEFAULT_FORCE,
			help: DEFAULT_HELP,
			expand: DEFAULT_EXPAND,
			param: DEFAULT_PARAM,
			make: DEFAULT_MAKE,
			all: DEFAULT_ALL,
			camel: DEFAULT_CAMEL
		};
	}

	static create(... _args)
	{
		var	_parse = true,
			_param;
		
		for(var i = 0; i < _args.length; ++i)
		{
			if(typeof _args[i] === 'boolean')
			{
				_parse = _args[i];
			}
			else if(Object.isObject(_args[i]))
			{
				_param = _args[i];
			}
		}
		
		const	opts = this.options,
			keys = Object.keys(opts);

		_param = Object.assign({ vector: null, options: {},
			argv: process.argv, parse: null,
			throw: DEFAULT_THROW_GETOPT }, _param);
		
		if(!Object.isObject(_param.options))
		{
			_param.options = {};
		}

		for(const o of keys)
		{
			if(Object.hasOwn(_param, o) && !Object.hasOwn(_param.options, o))
			{
				if(!Object.isObject(_param[o]))
				{
					_param.options[o] = _param[o];
					delete _param[o];
				}
			}
		}
		
		_param.options = Object.assign(opts, _param.options);

		if(typeof _parse !== 'boolean' && typeof _param.parse === 'boolean')
		{
			_parse = _param.parse;
			delete _param.parse;
		}
		
		const result = new GetOpt(
			_param.vector,
			_param.options,
			_param.argv,
			_param.parse);
		
		var THROW;
		
		if(typeof _param.throw === 'boolean')
		{
			THROW = _param.options.throw = _param.throw;
			delete _param.throw;
		}
		else if(typeof _param.options.throw === 'boolean')
		{
			THROW = _param.options.throw;
		}
		else
		{
			THROW = _param.options.throw = DEFAULT_THROW_GETOPT;
		}

		if(_parse)
		{
			result.parse(_param.throw, true);
		}

		return result;
	}

	//
	removeItem(... _keys)
	{
		if(!this.isValidVector)
		{
			return null;
		}

		const	result = {};
		var	item;

		for(var i = 0, j = 0; i < _keys.length; ++i)
		{
			if(typeof _keys[i] !== 'string' || !_keys[i])
			{
				continue;
			}

			if(!(item = this._vector[_keys[i]]))
			{
				continue;
			}

			if(item.long)
			{
				this.long.delete(item.long);
			}

			if(item.short)
			{
				this.short.delete(item.short);
			}

			this.map.delete(_keys[i]);
			result[j++] = _keys[i];
		}

		return result;
	}

	purgeItem(_index)
	{
		if(!this.isValidVector)
		{
			return null;
		}

		const item = this._vector[_index];
		delete this._vector[_index];

		if(!this.constructor.checkVectorItem(item))
		{
			return undefined;
		}

		this.map.delete(_index);

		if(item.long)
		{
			this.long.delete(item.long);
		}

		if(item.short)
		{
			this.short.delete(item.short);
		}

		return item;
	}

	addItem(_index, _item, _force = this.options.force)
	{
		if(typeof _force !== 'boolean')
		{
			_force = this.options.force;
		}
		
		if(!this.isValidVector)
		{
			this.vector = {};
		}
		
		const result = Object.assign(this.item, _item);

		if(!(_index = this.prepareKey(_index, false, this.options.camel)))
		{
			if(result.long = this.prepareKey(result.long, false, this.options.camel))
			{
				_index = result.long;
			}
			else
			{
				throw new Error('Missing index/key');
			}
		}
		else if(!(result.long = this.prepareKey(result.long, false, this.options.camel)))
		{
			result.long = _index;
		}

		if(this.constructor.checkVectorItem(this._vector[_index]))
		{
			if(_force)
			{
				this.purgeItem(_index);
			}
			else
			{
				throw new Error('Index already exists');
			}
		}

		if(this.long.has(result.long) && !_force)
		{
			throw new Error('This long key already exists');
		}

		this.long.set(result.long, _index);
		
		if(Object.hasOwn(result, 'short'))
		{
			if(!(result.short = this.prepareKey(result.short, false)))
			{
				if(_force)
				{
					result.short = '';
				}
				else
				{
					throw new Error('Invalid short key');
				}
			}
		}
		else if(this.options.make)
		{
			if(!(result.short = this.makeShort(result)))
			{
				result.short = '';
			}
		}
		else
		{
			result.short = '';
		}

		if(result.short)
		{
			if(this.short.has(result.short) && !_force)
			{
				throw new Error('Short key already exists');
			}

			this.short.set(result.short, _index);
		}

		return this._vector[_index] = result;
	}

	makeShort()
	{
		throw new Error('todo (and remove the orig func???)');



		//return this.prepareKey(...., false);
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
			radix: DEFAULT_CAST_RADIX,
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
			'empty',
			'array',
			'list',
			'cast',
			'radix',
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

	//
	//TODO/take the logics to '.makeShort()' (called on each '.addItem()'),
	//	then remove this whole old, static version..!1
	//
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
		this._vector = this.long =
			this.short = null;
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

		if(!(_key = this.prepareKey(_key, _throw)))
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
		const	hasVector = this.extended,
			vector = (hasVector ?
				this._vector :
					null),
			argv = this.argv,
			keys = [];
		var	index = 0,
			unescape,
			idx, tmp,
			string,
			empty,
			radix,
			array,
			list,
			item,
			cast,
			key,
			esc,
			i;

		const push = (_value) => (this[index++] =
			this.constructor.handleString(_value, {
				unescape: this.options.unescapeRegular,
				cast: this.options.castRegular,
				radix: this.options.castRadix,
				array: this.options.array,
				empty: false }));

		const set = (_value, _reset = false) => {
			if(keys.length === 0)
			{
				return push(_value);
			}

			if(!(key = this.prepareKey(keys.shift(),
				this.options.all === null,
				this.options.camel)))
			{
				return push(_value);
			}

			if(hasVector)
			{
				if(item = this.lookUp(key, this.options.throw))
				{
					key = item;
					item = vector[item];

					unescape = item.unescape;
					empty = item.empty;
					array = item.array;
					radix = item.radix;
					list = item.list;
					cast = item.cast;
				}
				else if(!this.options.all)
				{
					if(this.options.all === null)
					{
						throw new Error('Unknown key `' + key + '`');
					}

					return;
				}
			}
			else
			{
				unescape = this.options.unescape;
				empty = this.options.empty;
				array = this.options.array;
				radix = this.options.radix;
				list = this.options.list;
				cast = this.options.cast;
			}

			_value = this.constructor.handleString(_value, {
				unescape, cast, array, radix, empty });

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
		};

		const flush = () => {
			while(keys.length > 0)
			{
				set('', false);
			}
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
				break;
			}
			else if(string[0] === '-' && isNaN(string))
			{
				flush();

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

		flush();

		for(; i < argv.length; ++i)
		{
			push(argv[i]);
		}

		//
		return true;
	}

	static handleString(_item, _opts)
	{
		if(typeof _item !== 'string')
		{
			return _item;
		}

		_opts = Object.assign({
				unescape: DEFAULT_UNESCAPE,
				radix: DEFAULT_CAST_RADIX,
				array: DEFAULT_ARRAY,
				cast: DEFAULT_CAST,
				empty: true },
			_opts);

		var result = _item;

		if(_opts.cast && typeof (result = String.tryCast(result, _opts)) !== 'string')
		{
			return result;
		}

		if(_opts.unescape)
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
		if(this.emptyVector)
		{
			if(this.options.throw)
			{
				throw new Error('No vector set, or it\'s empty');
			}

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
		if(!this.isValidVector)
		{
			return [];
		}

		return Object.keys(this.
			_vector).sort(true);
	}

	get emptyVector()
	{
		if(!this.isValidVector)
		{
			return !(this._vector =
				this.long =
				this.short =
					null);
		}

		return (Object.keys(this.
			_vector).length === 0);
	}

	static removePrefix(_string)
	{
		if(typeof _string !== 'string') return '';
		var count = 0; while(_string[count++] === '-');
		if(--count) _string = _string.substr(count);
		return _string;
	}

	static keyCharacterFilter(_string, _throw = DEFAULT_THROW_GETOPT)
	{
		var result = '';
		
		if(!(_string = this.removePrefix(_string.trim()).trim()))
		{
			throw new Error('Key string must have a length greater than zero');
		}
		
		while(_string[0] === '-')
		{
			if(_throw)
			{
				throw new Error('The `-` character is not allowed at the key\'s begin');
			}
			
			_string = _string.substr(1);
		}
		
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
		
		return result.trim();
	}
	
	static key(_string, _prefix, _throw = DEFAULT_THROW_GETOPT, _camel = DEFAULT_CAMEL)
	{
		if(typeof _string !== 'string' || _string.length === 0)
		{
			return null;
		}
		
		if(!(_string = this.keyCharacterFilter(_string, _throw)))
		{
			return null;
		}
		
		if(_camel && _string.length > 1)
		{
			_string = camel.disable(_string);
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

	static checkTypes(_item, _types, _throw = DEFAULT_THROW_GETOPT)
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
	
	prepareKey(_key, _throw = this.options.throw, _camel = this.options.camel)
	{
		const result = this.constructor.key(
			_key, false, _throw, _camel);
		
		if(!result && _throw)
		{
			throw new Error('Invalid _key argument');
		}
		
		return result;
	}

	findKey(_key, _throw = this.options.throw)
	{
		if(this.emptyVector)
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
		if(!(_key = this.prepareKey(_key, _throw)))
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
	
	static get allowedKeyCharacters()
	{
		return ALLOWED_KEY_CHARACTERS;
	}
	
	static get _allowedKeyCharacters()
	{
		return new Set(_ALLOWED_KEY_CHARACTERS);
	}
}

export default GetOpt;

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
	
	for(var i = 45; i <= 57; ++i)
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
const kekse1 = Symbol.for(import.meta?.url || 'kekse1/getopt.js');

if(!globalThis[kekse1])
{
	//
	globalThis[kekse1] = Date.now();
	
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
	const camel = globalThis.camel = (_string, _camel = DEFAULT_CAMEL_CHAR) => {
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
			_camel = DEFAULT_CAMEL_CHAR;
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

	//
	camel.enable = (_string, _camel = DEFAULT_CAMEL_CHAR, _fix = DEFAULT_CAMEL_FIX) => {
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
			_camel = DEFAULT_CAMEL_CHAR;
		}
		
		if(camel(_string, _camel) !== false)
		{
			return _string;
		}
		
		if(typeof _fix !== 'boolean')
		{
			_fix = DEFAULT_CAMEL_FIX;
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

	camel.disable = (_string, _camel = DEFAULT_CAMEL_CHAR, _fix = DEFAULT_CAMEL_FIX) => {
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
			_camel = DEFAULT_CAMEL_CHAR;
		}
		
		if(camel(_string, _camel) !== true)
		{
			return _string;
		}

		if(typeof _fix !== 'boolean')
		{
			_fix = DEFAULT_CAMEL_FIX;
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
	const TYPES = new Set(types);

	Reflect.defineProperty(type, 'types', {
		get: () => [ ... types ] });
	Reflect.defineProperty(type, 'TYPES', {
		get: () => new Set(types) });

	//
}

//

<img src="https://kekse.biz/github.php?draw&override=github:getopt.js&text=v4&draw" />

# Index
* [Start](#getoptjs)
    * [Download](#download)
    * [Description](#description)
        * [Features](#features)
        * [Vector items](#vector-items)
        * Finding best `short`s
        * [Configuration](#configuration)
        * `DEFAULT_EXPAND`
    	* [Dependencies](#dependencies)
	    * [Module and Namespace](#module-and-namespace)
    * [References](#references)
* [Copyright and License](#copyright-and-license)

## `getopt.js`
This is my own interpretation of the well known `getopt` functionality.
Just (nearly..) finished it (for my newest project `mudz`, etc.).

### Download
* [**`getopt.js`**](js/getopt.js)

### Description
//TODO/(describe it)//

#### TODO
Some things are still TODO here - I'm **currently** working on it! Maybe tomorrow I'm ready..

#### Features
//TODO/(describe 'em);

#### Function call
This is the exported function
`getopt(_vector, _parse, _parse_values, _list = process.argv, _start = 0)`

#### Vector items
These are the items your getopt vector (first argument to `getopt()`, is an object) supports.

| Key         | Type(s)          | Description |
| ----------: | :--------------- | :---------: |
| `long`      | Boolean, String  | ...         |
| `short`     | Boolean, String  | ...         |
| `env`       | Boolean, String  | ...         |
| `args`      | Boolean, Integer | ...         |
| `index`     | Boolean, Integer | ...         |
| `parse`     | Boolean          | ...         |
| `list`      | Boolean          | ...         |
| `group`     | String           | ...         |
| `default`   | **\***           | ...         |
| `null`      | **\***           | ...         |
| `undefined` | **\**            | ...         |
| `clone`     | Boolean, Integer | ...         |
| `help`      | String           | ...         |

//TODO/descriptions, pls..

#### Finding best **`short`s**
If a `short` is set to `true`, we're going to automatically find the best index key;
see the `findBestShort()` function.

#### Configuration
Just some `const DEFAULT_*` on top of the file:

| Name                  | Description |
| --------------------: | :---------- |
| `DEFAULT_PARSE`       | ...         |
| `DEFAULT_ASSIGN`      | ...         |
| `DEFAULT_ASSIGN_LIST` | ...         |
| `DEFAULT_EXPAND`      | ...         |
| `DEFAULT_ZERO_NULL`   | ...         |

MORE ARE COMING these days..! ;-)

#### **`DEFAULT_EXPAND`**
If enabled, arguments like `-abc` (so **short**s!) are expanded to `-a -b -c`, or with assignment
`-abc=def` will be `-a=def -b=def -c=def`.

**BUT** if enabled, you can't use strings with .length > 1, so only single chars! Otherwise also
possible 'd be `-short`..

#### Dependencies
I implemented it with the help of my own JavaScript Library (all my own, just from scratch).

The library is originally the [**libjs.de**](https://libjs.de/), but this one was replaced by a newer,
_more compact_ version which I'm using at [**kekse.biz**](https://kekse.biz/): this is the GitHub link
to my [**`v4`** repository](https://github.com/kekse1/v4/); also visible (with rendered `.md`) on my
[**kekse.biz**/projects page](https://kekse.biz/#github://kekse1/).

Maybe I'll give you a tiny replacement of the used extensions some day, but until then feel free to
modify the source or implement the necessary functions by yourself.. there are really not many.!

#### Module and Namespace
By default I'm using `export default getopt`.

If you are not running in ES module mode (so no `{ type: 'module' }` in `package.json`), you should
remove this statement. A regular `module.exports = getopt` is automatically done if not in EC module
mode (using `typeof this !== 'undefined'`).

At all, you don't need to use any export, since the `getopt` base function is also exported under the
global namespace (so `global.getopt()` is **always** available).

### References
Maybe also interesting for you: the **`config.js`**? And a reference to my documentation for this **`getopt.js`**:

* [**`getopt`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
* [**`config`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/config.md)

The documentation (located in my `v4` repository) is also still TODO.

## Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

![kekse.biz](favicon.png)


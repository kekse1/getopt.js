<img src="https://kekse.biz/github.php?draw&override=github:getopt.js&text=v4&draw" />

# `getopt.js`
This is my own interpretation of the well known `getopt` functionality.

## Index
* [Start](#getoptjs)
    * [Download](#download)
    * [Description](#description)
        * [Features](#features)
        * [Function call](#function-call)
        * [Vector items](#vector-items)
        * [Finding best `short` keys](#finding-best-short-keys)
        * [Configuration](#configuration)
        * [`DEFAULT_EXPAND`](#default_expand)
    	* [Dependencies](#dependencies)
	* [Module and Namespace](#module-and-namespace)
    * [References](#references)
* [Copyright and License](#copyright-and-license)

## Download
* [**`getopt.js`**](js/getopt.js) (**180** lines atm)

## Description
You all know the `getopt` feature, either in shells or in C and much more. Nearly every language will have an implementation of it.
Since I really love to implement any feature I need for myself, I also created this implementation. Maybe you like it, or my way of handling it? :-)

### Features
I'm not sure if the following list is really complete. But most things are encountered here:

* Efficient design using also `Map` and `Set`, resulting in better performance (even if not really much more here, since we're using relatively small amounts)
* Keys etc. are defined in a special 'vector', which is an `Object` for the main `getopt()` function
* The resulting object after parsing the/a command line (or list) is an array with: .. (a) regular elements pushed to it; .. (b) known keys by their vector indices
* The vector keys are those to be addressed when using the parse result, but they may(!) contain different { long, short }, etc.
* It's possible to enqueue multiple parameters consecutive, after which the values are collectable in order (so `-ab eins zwei` or `--one --two eins zwei`)
* Multiple short parameters with only one `-` prefix are possible (e.g. `-abc` will be enforced (then) to `-a -b -c`, or `-abc=def` to `-a=def -b=def -c=def`)
* Values after equal sign assignment can sometimes be an advantage (`--key=value`); they also can encode lists, separated by `,` (escapable!)
* All values can be parsed (so checking for Numbers, RegExp, Booleans, ..); also the regularily pushed parameters (without key match), if wished
* If a single `--` occures in the command line, the regular behavior is (usually) to abort the process and add the rest as regular list items
* Undefined parameters or those without any value will result in an Integer which counts the amount of their occurences
* BUT if defaults are defined in the vector, these will be used (can be either for all, or separately one for undefined keys and one for empty keys, without values)
* Defaults can be optionally cloned.. and if `.args>1` in a vector item plus an array as default value, the array items will be used adequately
* By default multiple values are possible (use `.args` vector item).
* It's possible to let short keys be found automatically (finding nearest possible character)
* Automatically created help pages/views (if no manuall `--help / -?` override defined in the vector); using `.help` vector items to show each ones descriptions

Some (not really many) items are still /TODO/, btw.. I'm currently working on it!

### Function call
This is the exported function `getopt(_vector, _parse, _parse_values, _assign, _assigned_list, _list = process.argv, _start = 0);`

All other functions are not reachable above the exported `getopt`, I'm most times using anonymous (closure) functions for the rest.

### Vector items
These are the items your getopt vector (first argument to `getopt()`, is an object) supports.

| Key         | Type(s)          | Description                                                                                               |
| ----------: | :--------------- | :-------------------------------------------------------------------------------------------------------: |
| `long`      | Boolean, String  | The long key index, with `--` double dash prefix in the command line                                      |
| `short`     | Boolean, String  | Short key index, with `-` single dash prefix                                                              |
| `env`       | Boolean, String  | (**TODO**!) Environment variable key index, without any dash                                              |
| `args`      | Boolean, Integer | How many arguments per key index, or if at all any                                                        |
| `index`     | Boolean, Integer | If multiple values are defined, in the end this setting will select one of the elements                   |
| `parse`     | Boolean          | Recongnizing RegExp, Numbers, etc..                                                                       |
| `assign`    | Boolean          | If '--key=value' are allowed (otherwise these ones will be only regular cmdline elements)                 |
| `list`      | Boolean          | If comma `,` in the values of `=` assignments (only there!) should create array elements (if not escaped) |
| `group`     | String           | **TODO**                                                                                                  |
| `default`   | Array, \*        | Default value(s) for unspecified parameters (if `.args > 0`!): will set BOTH `null` and `undefined`       |
| `null`      | Array, \*        | If a parameter is given by it's index keys, but no value for it defined                                   |
| `undefined` | Array, \*        | If a parameter is not given by index keys at all; so no `--key`, not only a missing value                 |
| `clone`     | Boolean, Integer | The both default values can optionally be cloned every time (**Integer**s are still TODO)                 |
| `help`      | String           | Automatically created help pages/views use this for the switches' descriptions                            |

### Configuration
Just some `const DEFAULT_*` on top of the file. The `DEFAULT_EXPAND` is the most important one, because it is a global setting,
no default value for the getopt vector.. the rest is just being used if it's vector items are not properly set-up.

| Name                  | Description                                                                                          |
| --------------------: | :--------------------------------------------------------------------------------------------------- |
| `DEFAULT_EXPAND`      | Multiple shorts in one dash `-` item (`-abc` to `-a -b -c` or `-abc=def` to `-a=def -b=def -c=def`)  |
| `DEFAULT_PARSE`       | If no `.parse` vector item defined, this will be the default (list parsing will have the same value) |
| `DEFAULT_ASSIGN`      | Default behavior for `=` assignments                                                                 |
| `DEFAULT_ASSIGN_LIST` | Default setting whether to enable assigned (only!) lists, separated by `,` (escpable)                |
| `DEFAULT_CLONE`       | The default setting for cloning default elements (or not, or the depth)                              |

### **`DEFAULT_EXPAND`**
If enabled, arguments like `-abc` (so **short**s!) are expanded to `-a -b -c`, or with assignment `-abc=def` to `-a=def -b=def -c=def`.

> **Warning**
> If enabled, you can't use strings with `.length > 1`, so only single chars! Otherwise also possible 'd be `-short`.

### Dependencies
I implemented it with the help of my own JavaScript Library (all my own, just from scratch).

The library is originally the [**libjs.de**](https://libjs.de/), but this one was replaced by a newer,
_more compact_ version which I'm using at [**kekse.biz**](https://kekse.biz/): this is the GitHub link
to my [**`v4`** repository](https://github.com/kekse1/v4/); also visible (with rendered `.md`) on my
[**kekse.biz**/projects page](https://kekse.biz/#github://kekse1/).

Maybe I'll give you a tiny replacement of the used extensions some day, but until then feel free to
modify the source or implement the necessary functions by yourself.. there are really not many.!

> **Warning**
> SO, if using stand-alone, you'll have to manually extend some elements.. **but** these are not so much, so _don't give up_! ^\_^

### Module and Namespace
By default I'm using `export default getopt`.

If you are not running in ES module mode (so no `{ type: 'module' }` in `package.json`), you should
remove this statement. A regular `module.exports = getopt` is automatically done if not in EC module
mode (using `typeof this !== 'undefined'`).

At all, you don't need to use any export, since the `getopt` base function is also exported under the
global namespace (so `global.getopt()` is **always** available).

## References
Maybe also interesting for you: the **`config.js`**? And a reference to my documentation for this **`getopt.js`**:

* [**`getopt`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
* [**`config`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/config.md)

The documentation (located in my `v4` repository) is also still TODO.

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

![kekse.biz](favicon.png)


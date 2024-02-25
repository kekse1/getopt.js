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
	* [Namespace](#namespace)
    * [References](#references)
* [Copyright and License](#copyright-and-license)

## News
* \[**2024-02-25**\] Updated the **`polyfill.js`** to be _really_ complete now; and the **`getopt.js`** also has a new **`test.js`** (BUT ONE BUG FOUND atm, TODO!)

## Bugs
* _ONE_ atm: multiple `[params]` are not being collected (but the first only).. even though they disappear from the list of regular cmd-line-arguments.. :-/

## Download
* [**`getopt.js`**](js/getopt.js) (**260** code lines, in **v0.3.0**)
* [`polyfill.js`](js/polyfill.js) (**321** code lines) if you don't use [my library](https://github.com/kekse1/v4/)

And here's also my [**`test.js`**](js/test.js)..

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
* All values can be parsed (so checking for Numbers, RegExp, Booleans, ..); also the normally pushed parameters (without key match), if wished
* If a single `--` occures in the command line, the regular behavior is (usually) to abort the process and add the rest as regular list items
* Undefined parameters or those without any value will result in an Integer which counts the amount of their occurences
* BUT if defaults are defined in the vector, these will be used (can be either for all, or separately one for undefined keys and one for empty keys, without values)
* Defaults can be optionally cloned.. and if `.params>1` in a vector item plus an array as default value, the array items will be used adequately
* By default multiple values are possible (use `.params` vector item).
* Use the `group` vector item to group all defined values together in the `(result).group[]` array (beneath their original `(result).index`s)
* It's possible to let short keys be found automatically (finding nearest possible character)
* Automatically created help pages/views (if no manuall `--help / -?` override defined in the vector); using `.help` vector items to show each ones descriptions
* \[2024-02-25\] **Update**: now w/ `-p8080`, e.g.. so _direct_ parameters on `[short]` items..

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
| `params`    | Boolean, Integer | How many arguments per key index, or if at all any                                                        |
| `index`     | Boolean, Integer | If multiple values are defined, in the end this setting will select one of the elements                   |
| `parse`     | Boolean          | Recongnizing RegExp, Numbers, etc..                                                                       |
| `assign`    | Boolean          | If '--key=value' are allowed (otherwise these ones will be only regular cmdline elements)                 |
| `list`      | Boolean          | If comma `,` in the values of `=` assignments (only there!) should create array elements (if not escaped) |
| `group`     | String           | All results will be referenced in a `(result)[GROUP]` array, too.. out of possibly more than one key/index|
| `default`   | Array, \*        | Default value(s) for unspecified parameters (if `.params > 0`!): will set BOTH `null` and `undefined`     |
| `null`      | Array, \*        | If a parameter is given by it's index keys, but no value for it defined                                   |
| `undefined` | Array, \*        | If a parameter is not given by index keys at all; so no `--key`, not only a missing value                 |
| `clone`     | Boolean, Integer | The both default values can optionally be cloned every time (**Integer**s are still TODO)                 |
| `help`      | String           | Automatically created help pages/views use this for the switches' descriptions                            |

### Configuration
Just some `const DEFAULT_*` on top of the file. The `DEFAULT_EXPAND` is the most important one, because it is a global setting,
no default value for the getopt vector.. the rest is just being used if it's vector items are not properly set-up.

| Name                         | Description                                                                                          |
| ---------------------------: | :--------------------------------------------------------------------------------------------------- |
| `DEFAULT_EXPAND`             | Multiple shorts in one dash `-` item (`-abc` to `-a -b -c` or `-abc=def` to `-a=def -b=def -c=def`)  |
| `DEFAULT_GROUPS`             | Possibility to globally disable any group feature (but why should you?)                              |
| `DEFAULT_PARSE`              | If no `.parse` vector item defined, this will be the default (list parsing will have the same value) |
| `DEFAULT_ASSIGN`             | Default behavior for `=` assignments                                                                 |
| `DEFAULT_ASSIGN_LIST`        | Default setting whether to enable assigned (only!) lists, separated by `,` (escpable)                |
| `DEFAULT_CLONE`              | The default setting for cloning default elements (or not, or the depth)                              |
| `DEFAULT_HELP`               | If `--help / -?` should be inserted automatically, if not already present                            |
| `DEFAULT_HELP_INDENT`        | Base indention for the help view                                                                     |
| `DEFAULT_HELP_INDENT_PREFIX` | Prefix for the real `[help]` strings                                                                 |
| `DEFAULT_HELP_INDENT_DOUBLE` | More indention for more types of (help) parameters                                                   |
| `DEFAULT_HELP_INDENT_KEYS`   | And the last indention (all above and this are integers (>=0)                                        |

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

> **Warning**
> If using this script stand-alone, without my library being loaded/used, you should also import the [**`polyfill.js`**](js/polyfill.js).
> I **hope** this file is complete, I neither tested any case, nor did I scrolled through the [**`getopt.js`**](js/getopt.js).. xD~

### Namespace
The whole base **`getopt()`** function is being exported under the **`global`** namespace! So you just have to **`getopt(vector, ...)`**.

## References
Maybe also interesting for you: the **`config.js`**? And a reference to my documentation for this **`getopt.js`**:

* [**`getopt`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
* [**`config`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/config.md)

The documentation (located in my `v4` repository) is also still TODO.

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

![kekse.biz](favicon.png)


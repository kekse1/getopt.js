<img src="without.svg" /><br>
<img src="https://kekse.biz/github.php?draw&override=github:getopt.js" />

<br><br>

> [!IMPORTANT]
> Currently I'm preparing one bigger version of all of this.
> But you'll have to wait some days/weeks (dunno exactly atm.).

<br><br>

# `getopt.js`
This is my own interpretation of the well known `getopt` functionality.
And now there's also a [**tiny alternative version**](#tiny-alternative-version).

<br>

> [!NOTE]
> The regular/big version has at least one bug. And my [**tiny alternative version**](#tiny-alternative-version)
> is maintained a bit more frequently (currently I'm not in the mood of fixing the regular version).

> [!TIP]
> So the [tiny alternative version](#tiny-alternative-version) (which got it's own polyfill, so it should
> run 'as is'..) got the latest feature of supporting multiple radix (if parsing/etc. of paramters is
> enabled), like `--perm '(8)1777'` or `--int '(16)ffff'`. ;-)

> [!NOTE]
> Polyfill `out of date`!

<br><br>

## Index
1. [News](#news)
2. [Start](#getoptjs)
    * [Download](#download)
    * [Tiny alternative version](#tiny-alternative-version)
    * [Description](#description)
        * [Features](#features)
        * [Function call](#function-call)
        * [Vector items](#vector-items)
        * [Finding best `short` keys](#finding-best-short-keys)
        * [Configuration](#configuration)
        * [`DEFAULT_EXPAND`](#default_expand)
    	* [Dependencies](#dependencies)
	* [Namespace](#namespace)
	* [Bugs](#bugs)
    * [References](#references)
3. [Contact](#contact)
4. [Copyright and License](#copyright-and-license)

<br><br><br>

## Download
* [**`getopt.js`**](src/getopt.js) (**252** code lines, in v**0.4.0**)
* [`polyfill.js`](src/polyfill.js) (**321** code lines) if you don't use [my library](https://github.com/kekse1/v4/)
* [**`getopt.tiny.js`**](src/getopt.tiny.js) (updated **2026-08-07**, w/ **887** code lines in total);
* [`test.js`](src/test.js) (tiny test, jfyi..);
* [`type.js`](src/type.js) (more **type check** features for the **tiny version**);

## Info
Just for your info: Both versions stop parsing the rest of the command line after the
occurence of an 'empty' `--` parameter. That's a (good) convention.

Another info: with enabled `_cast` also the regular parameters (not only those with the
`--` prefix, or rather (only) their values) are being converted (e.g. to Numbers).

## Tiny alternative version
The tiny alternative version doesn't have most of the features of the regular version. But works great as well.
There are not so many features, but the main difference is that you don't define a 'vector' with all possible/allowed
parameters, so any `--` prefixed parameter will be interpreted as valid key. So handling this version is
also much easier and quicker.

The [**`getopt.tiny.js`**](src/getopt.tiny.js) does **not** need an extra polyfill (at least until now.. I don't really know now);
Everything's included on the file's bottom.

> [!TIP]
> Since v**2.4.0** it also supports different radix/base, e.g. `--perm '(8)1777'`
> or `--int '(16)ffff'`. ;-) Well, it's really untested, but should work well..

### Newest features
The newest version also supports **C unescaping** now. So `--separator \\n` or `--separator '\n'`
will unescape the string to interprete with a newline character `\n`.

Since v**2.0.0** the keys are stored **with `--`** prefix, to prevent collisions with the
`.prototype` implementation of the resulting **Array** (which is preferred over
`Object.create(null)` because that's the best way to also store the complete (filtered)
command line).

With v**2.1.0** there's also an interface (`extends Array`) to manage this thing better.

And since v**2.2.0** assigning via `=` char (so e.g. `--key=value`) will directly replace
the whole value with the newest one, even when it's set to count multiple occurences of
the same key into an array (see parameter/const `_array = DEFAULT_ARRAY`).

These new features are **barely tested**...

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
> If using this script stand-alone, without my library being loaded/used, you should also import the [**`polyfill.js`**](src/polyfill.js).
> I **hope** this file is complete, I neither tested any case, nor did I scrolled through the [**`getopt.js`**](src/getopt.js).. xD~

### Namespace
The whole base **`getopt()`** function is being exported under the **`global`** namespace! So you just have to **`getopt(vector, ...)`**.

### Bugs
This only holds for the regular, big version. The tiny alternative version should have no bugs at all..

* _ONE_ atm: multiple `[params]` are not being collected (but the first only).. even though they disappear from the list of regular cmd-line-arguments.. :-/

## References
Maybe also interesting for you: the **`config.js`**? And a reference to my documentation for this **`getopt.js`**:

* [**`getopt`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
* [**`config`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/config.md)

The documentation (located in my `v4` repository) is also still TODO.

<br><br><br>

# Contact
<img src="https://kekse.biz/github.php?override=github:getopt.js&draw&text=getopt.js@kekse.biz&angle=6&size=38pt&fg=150,20,90&font=OpenSans&ro&readonly&h=64&v=16" />

<br>

# Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

<a href="https://kekse.biz/">
<img src="favicon.png" alt="Favicon" />
</a>


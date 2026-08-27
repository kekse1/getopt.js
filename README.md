<img src="without.svg" /><br>
<img src="https://kekse.biz/github.php?draw&override=github:getopt.js" />

<br><br>

> [!IMPORTANT]
> This is my **newest** version, updated **2026-08-26**.
> The original, old code is to be found in [`./src.ORIG/`](./src.ORIG/).
> And it works 'as is', all my extensions are available [here](./src/).
> The new code is really created **all from scratch**!

<br>

> [!NOTE]
> It's **not yet finished**.. just the current state.
> See also the [TODO section](#todo) (below) - more or less..

<br><br>

<!--# `getopt.js`-->
# `class GetOpt extends Array`
This is my own interpretation of the well known `getopt` functionality.

**No other dependencies**, only real plain **Vanilla JavaScript** (for
the [Node.js](https://nodejs.org/) interpreter). Run it 'as is' (in
**four modules**).

<br><br>

## Download
As said above.. this code is still **TODO**. It's a first preview snapshot.

* [`./src/`](./src/): the newest `.mjs` modules (plus some [`./src/test/`](./src/test/) scripts);
* [`./src.ORIG/`](./src.ORIG/): the old, original code base (from the previous here);

<br>

This whole **`class GetOpt extends Array`** is divided in (currently)
**four modules**. Use all of them to get this thing alive (so just
place them in one directory - or change the `import`s).

As usual, it's plain **Vanilla JavaScript**. So **no other dependencies**!!

<br><br>

## Features / TODO
- [x] Both **LONG** and **SHORT** parameters possible (optionally!). .. w/ an extended alphabet for your keys.
- [x] Possible (configurable) type casts, both for any parameter, specific parameters and/or the regular `argc`.
- [x] My favorite [`(cast)`](./src/getopt.num.mjs) logics, smth. like `--perm '(8)1777'` or `--big '(16n)ffff'`.
- [x] An (optional, as usual) automatic [`unescape`](./src/getopt.ext.mjs) of cmdline arguments and parameters.
- [x] Division into **four modules (atm.)** for some really clean/general/.. architecture.
- [x] Own [`type.js`](./src/getopt.type.mjs) for own, special **type checks** on the resulting getopt params.
- [x] Many `{options}`, both global per instance and local per {vector}-item (the possible parameters).
- [x] Either simple logics (to use all recognized parameters) or the possibility for a special {vector};
- [x] With a special {vector} each of its items can contain both **long** and **short** to be grouped under it!
- [x] When such items are defined without **short** keys, they can be automatically and kinda intelligent be auto-inserted.
- [x] Any `--help / -h / -?` parameter can be catched/queried/...
- [ ] .. but yet missing my automatic help generation (TTY output, when a {vector} is defined);
- [x] Short parameters can be 'extended' to define multiple keys and use kinda 'queue' waiting for the values
- [x] While with**out** extending shorts any following string (after the one char keys) will be the new value.
- [x] Throw errors or not.. configurable.
- [x] A special error case is handled by the 'all' option: allow or disallow/throw unknown parameters (w/ {vector});
- [x] Lists instead of only single skalars possible. Either by multiple usage of keys or via special list value syntax.
- [ ] Default (-/+) index possible if lists occur, so a parameter query will not return the whole list, but a special item
- [x] Assignments via `=` value syntax - also to reset any possible, previous list value..
- [x] Space splitting on arguments like `'--key value'` (so as one string);
- [x] Of course the well-known `--` argument is possible, to take all following arguments into the vector[] base (unhandled);
- [x] All in one `class GetOpt extends Array` - either access arguments by index, or use my interface with parameter keys.
- [ ] Some more features are missing yet...!! Also most of the {vector} thing.. it's prepared, but not yet (fully) running.
- [ ] Much testing is still necessary..!
- [ ] A good/full (markdown) **documentation** here in this repository is also still TODO!

<br>

> [!TIP]
> In this `README.md` there's some text commented out (see the source file, below this `[!TIP]`).
> I'll partially use it as a reference. Don't know how much of it. Just seeing ideas.

<!--
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

  -->

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


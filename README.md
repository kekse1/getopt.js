<img src="https://kekse.biz/github.php?draw&override=github:getopt.js&text=v4&draw" />

# Index
* [Start](#getoptjs)
    * [Features](#features)
    * [Download](#download)
    * [Dependencies](#dependencies)
    * [References](#references)
* [Copyright and License](#copyright-and-license)

## `getopt.js`
This is my own interpretation of the well known `getopt` functionality.
Just (nearly..) finished it (for my newest project `mudz`, etc.).

### Features
//TODO/(describe 'em)//


//if(!DEFAULT_EXPAND) also .short-strings w/ .length > 1 allowed..


### Download
* [**`getopt.js`**](js/getopt.js)

### TODO
- [ ] explain all features here.
- [ ] extend [the library api documentation @ **`getopt.md`**](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
- [ ] special `--help / -?` view (automatically generated)
- [ ] automatically generated `short`s
- [ ] `group`s
- [ ] `env`s
- [ ] (vector).parse
- [ ] optional (vector).index
- [ ] (optionally) clone defaults?

### Dependencies
I implemented it with the help of my own JavaScript Library (all my own, just from scratch).

The library is originally the [**libjs.de**](https://libjs.de/), but this one was replaced by a newer,
_more compact_ version which I'm using at [**kekse.biz**](https://kekse.biz/): this is the GitHub link
to my [**`v4`** repository](https://github.com/kekse1/v4/); also visible (with rendered `.md`) on my
[**kekse.biz**/projects page](https://kekse.biz/#github://kekse1/).

Maybe I'll give you a tiny replacement of the used extensions some day, but until then feel free to
modify the source or implement the necessary functions by yourself.. there are really not many.!

### Comment
Don't forget that I'm using `export` here. If you don't want a `package.json` with defined `{ "type": "module" }`
(for ES modules), you can remove this export statement in the file, or replace it by `module.exports = getopt;`.

And just for your info: the main `getopt()` function is available in the `global` namespace (so you don't really
need the export..).

### References
Maybe also interesting for you: the **`config.js`**? And a reference to my documentation for this **`getopt.js`**:

* [**`getopt`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/getopt.md)
* [**`config`**.md](https://github.com/kekse1/v4/blob/git/docs/modules/lib/config.md)

## Copyright and License
The Copyright is [(c) Sebastian Kucharczyk](COPYRIGHT.txt),
and it's licensed under the [MIT](LICENSE.txt) (also known as 'X' or 'X11' license).

![kekse.biz](favicon.png)


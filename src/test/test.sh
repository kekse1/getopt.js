#!/usr/bin/env bash

_real="$(realpath "$0")"
_dir="$(dirname "$_real")"
_test="${_dir}/test.js"

reset
cmd="'$_test' eins --zwei drei vier -vfs ab cd --efgi jk --wahr --wahr 3.14 --wahr 4096n --wahr2=xyz --wahr2 testing zwei '--wahr_:2zy abc: 3.14 :: no: null ::def' \"--split in'\" '--esc abc\tdef' --esc='abc\tdef' -p3.14 -2-4096n -sshort --a -aabc --hexa '(16)-+-ff' --bigInt '(16n)+-ffff.23' --number '(16)---ffff.34' --einsZweiDrei camel"
eval "$cmd"; echo -e "\n\n\`${cmd}\`"

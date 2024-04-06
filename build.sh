#!/bin/bash
bash setup-extism.sh
npm i 
export PATH="$PATH:$PWD/tmp/binaryen/bin:$PWD/tmp/extismjs/bin" 
export extismjs="$PWD/tmp/extismjs/bin/extism-js"


function build {
  d=$PWD
  cd $1
  node esbuild.cjs
  hash="`sha256sum bundle/index.js index.d.ts`"
  if [ ! -f .hash ] || [ "$hash" != "$(cat .hash)" ]; then
    echo "Rebuilding $2"
      RUST_BACKTRACE=1 $extismjs  bundle/index.js -i ./index.d.ts -o $d/$2
      echo "$hash" > .hash
  fi
  cd $d
}

build src/meta meta.wasm
build src/weather weather.wasm


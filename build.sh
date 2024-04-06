#!/bin/bash
bash setup-extism.sh
npm i 
export PATH="$PATH:$PWD/tmp/binaryen/bin:$PWD/tmp/extismjs/bin" 
export extismjs="$PWD/tmp/extismjs/bin/extism-js"
cd src
node esbuild.cjs

hash="`sha256sum bundle/index.js index.d.ts`"
if [ ! -f .hash ] || [ "$hash" != "$(cat .hash)" ]; then
  echo "Rebuilding plugin.wasm"
     RUST_BACKTRACE=1 $extismjs  bundle/index.js -i ./index.d.ts -o ../plugin.wasm
    echo "$hash" > .hash
fi


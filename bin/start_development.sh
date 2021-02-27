#!/bin/bash

cd "${0%/*}"
cd ..

if [ ! -d "tmp" ]; then
    echo unable to locate tmp directory
    exit 1;
fi

npx nodemon server/index.js > logs/nodemon.log 2>&1 &
echo $! > tmp/nodemon.pid

cd client
npm run serve > ../logs/npm_serve.log 2>&1 &
echo $! > ../tmp/npm_serve.pid



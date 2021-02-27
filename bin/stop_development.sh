#!/bin/bash

cd "${0%/*}"
cd ..

if [ ! -d "tmp" ]; then
    echo unable to locate tmp directory
    exit 1;
fi

echo killing nodemon server ..

pid=$(cat tmp/nodemon.pid)
kill $pid

echo killing npm serve ..

pid=$(cat tmp/npm_serve.pid)
kill $pid

echo removing pid files
rm tmp/nodemon.pid
rm tmp/npm_serve.pid



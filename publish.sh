#!/bin/sh -e
neokey=$(cat ~/.config/neocities/config)

cd "$(dirname $0)/www"
tsc
terser word.js -o word.min.js

curl -# \
    --user-agent "neoupload!" \
    -H "Authorization: Bearer $neokey" \
    -F "word/index.html=@index.html" \
    -F "word/word.js=@word.min.js;filename=word.js" \
    "https://neocities.org/api/upload" | jq .

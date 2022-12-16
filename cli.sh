#!/usr/bin/env bash

full_path="$(realpath "$0")"
dir_path="$(dirname $full_path)"
script_path="$dir_path/dist/main.js"

node_path="$(which node)"

$node_path $script_path "$@"
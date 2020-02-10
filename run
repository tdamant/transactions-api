#!/usr/bin/env bash
set -o errexit

run_arg="${1:-test}"
case "${run_arg}" in
"test")
    yarn
    yarn test
    ;;
"start")
    yarn start
    ;;
 "ci")
    yarn
    tsc
    yarn test
    ./deploy.sh
    ;;
 *)
   echo "Unexpected argument given:" $1
esac

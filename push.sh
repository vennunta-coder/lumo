#!/bin/bash
if [ -z "$1" ]; then
  echo "Uso: ./push.sh <git-remote-url>"
  exit 1
fi

git remote add origin $1 || true
git branch -M main
git push -u origin main

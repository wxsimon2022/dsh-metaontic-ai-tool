#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

message="${1:-Add MetaOntic AI management plugin}"
push="${PUSH:-1}"

git add -A

if git diff --cached --quiet; then
  echo "没有需要提交的改动。"
  exit 0
fi

git diff --cached --check
git commit -m "$message"

if [[ "$push" == "1" ]]; then
  branch="$(git symbolic-ref --short HEAD)"
  GIT_TERMINAL_PROMPT=0 git push github "$branch"
  GIT_TERMINAL_PROMPT=0 git push origin "$branch"
fi

echo "提交完成：$(git rev-parse --short HEAD)"

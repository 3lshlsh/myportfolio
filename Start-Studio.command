#!/bin/bash
set -eu
cd "$(dirname "$0")/studio"
if ! command -v npm >/dev/null || ! command -v node >/dev/null || ! node -e 'const [major,minor]=process.versions.node.split(".").map(Number);process.exit(major>22||major===22&&minor>=12?0:1)'; then
  echo 'يلزم تثبيت Node.js 22.12 أو أحدث من https://nodejs.org ثم فتح هذا الملف مجدداً.'
  read -r -p 'اضغط Enter للخروج.'
  exit 1
fi
export SANITY_STUDIO_PROJECT_ID=f61knmhk
export SANITY_STUDIO_DATASET=production
npm ci --no-audit --no-fund
./node_modules/.bin/sanity login
echo "افتح رابط localhost الذي سيظهر أدناه لتدخل لوحة التحكم."
exec ./node_modules/.bin/sanity dev

#!/bin/sh
set -e

echo "Packaging application..."

if [ -d "./dist" ]; then
  rm -r "./dist"
fi

mkdir "./dist"
mkdir "./dist/src"
cp -r "./build/." "./dist/src/"
cp -r "./node_modules" "./dist/"
cp "./google_api_credentials.json" "./dist/"
find "./dist/src" -type f -name "*.js.map" -delete

echo "#!/bin/sh\nNODE_ENV=production node src/main.js" > "./dist/run.sh"

echo "Application packaged"

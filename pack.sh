#!/bin/sh
set -e

echo "Packaging application..."

if [ -d "./dist" ]; then
  rm -r "./dist"
fi

mkdir "./dist"
mkdir "./dist/src"
cp -r "./build/." "./dist/src/"
cp "./google_api_credentials.json" "./dist/"

echo "#!/bin/sh\nNODE_ENV=production node src/main.js" > "./dist/run.sh"

echo "Application packaged"

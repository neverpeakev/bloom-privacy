#!/usr/bin/env bash
# Stages the web app into dist/ for Capacitor (webDir).
# The app has no build step — this is a straight copy of runtime assets.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist

cp index.html privacy.html manifest.webmanifest sw.js dist/
cp -r assets js dist/

echo "✅ dist/ staged for Capacitor ($(find dist -type f | wc -l) files)"
echo "Next: npx cap sync"

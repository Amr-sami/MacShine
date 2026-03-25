#!/bin/bash
# PyInstaller build script for macclean Python backend
# Builds a single executable to be bundled with the Electron app

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building macclean Python backend..."

python3 -m PyInstaller \
  --onefile \
  --distpath "${SCRIPT_DIR}/dist" \
  --workpath "${SCRIPT_DIR}/build" \
  --specpath "${SCRIPT_DIR}/build" \
  --name main \
  --clean \
  "${SCRIPT_DIR}/main.py"

echo "Build complete: ${SCRIPT_DIR}/dist/main"

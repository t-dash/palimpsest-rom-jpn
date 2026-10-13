#!/bin/bash
# Serve the site locally: ./serve.sh [port]
cd "$(dirname "$0")"
PORT="${1:-8000}"
echo "Quilted Languages -> http://localhost:$PORT"
python3 -m http.server "$PORT"

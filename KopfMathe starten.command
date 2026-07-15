#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
PORT=8080
echo "KopfMathe wird unter http://localhost:${PORT} gestartet."
echo "Fenster offen lassen; zum Beenden Ctrl+C drücken."
python3 -m http.server "$PORT" >/dev/null 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null' EXIT INT TERM
sleep 1
open "http://localhost:${PORT}"
wait "$PID"

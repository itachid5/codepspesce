#!/usr/bin/env bash

PORT=2222
LOG="$HOME/ngrok-ssh.log"

# ngrok installed না থাকলে skip
if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok not found" >> "$LOG"
  exit 0
fi

# আগে থেকেই চললে আবার start করবে না
if pgrep -f "ngrok tcp ${PORT}" >/dev/null 2>&1; then
  exit 0
fi

nohup ngrok tcp ${PORT} > "$LOG" 2>&1 &

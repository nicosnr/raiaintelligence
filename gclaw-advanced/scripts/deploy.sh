#!/usr/bin/env bash
# Gclaw Advanced deployment operator.
#
# Backs up any existing ~/.gclaw/config.json, drops in the advanced config,
# starts the orchestrator + dashboard, and prints the arm-live command.

set -euo pipefail

MODULE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GCLAW_HOME="${GCLAW_HOME:-$HOME/.gclaw}"
CONFIG_SRC="$MODULE_DIR/config/config.template.json"
CONFIG_DST="$GCLAW_HOME/config.json"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$GCLAW_HOME"

if [[ -f "$CONFIG_DST" ]]; then
  cp "$CONFIG_DST" "$GCLAW_HOME/config.json.bak.$STAMP"
  echo "backup: $GCLAW_HOME/config.json.bak.$STAMP"
fi

cp "$CONFIG_SRC" "$CONFIG_DST"
echo "config: $CONFIG_DST"

if [[ ! -f "$GCLAW_HOME/last-stage-safe.txt" ]]; then
  echo "seed" > "$GCLAW_HOME/last-stage-safe.txt"
fi

python3 -c "import json; json.load(open('$CONFIG_DST'))" \
  || { echo "config invalid JSON, aborting"; exit 1; }

echo
echo "next steps:"
echo "  1. cd \"$MODULE_DIR\" && python3 -m src.orchestrator      # paper for first 24h"
echo "  2. arm live trading (only when paper drift < 1%):"
echo "       touch \"$GCLAW_HOME/armed-live\""
echo "  3. kill switch: touch /tmp/gclaw.halt (flat immediately)"
echo "  4. revert:      $MODULE_DIR/scripts/revert-to-safe.sh"

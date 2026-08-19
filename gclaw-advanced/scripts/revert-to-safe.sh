#!/usr/bin/env bash
# Revert Gclaw Advanced to the last backed-up safe config, flatten all
# positions via the kill switch, and clear the armed-live flag.

set -euo pipefail

GCLAW_HOME="${GCLAW_HOME:-$HOME/.gclaw}"

# 1. Hard flat: any running orchestrator sees this file and stops entering
touch /tmp/gclaw.halt
echo "kill switch armed: /tmp/gclaw.halt"

# 2. Clear armed-live so the paper gate re-engages
rm -f "$GCLAW_HOME/armed-live"
echo "armed-live flag cleared"

# 3. Restore most recent config backup
LAST_BAK="$(ls -1t "$GCLAW_HOME"/config.json.bak.* 2>/dev/null | head -n 1 || true)"
if [[ -n "$LAST_BAK" ]]; then
  cp "$LAST_BAK" "$GCLAW_HOME/config.json"
  echo "restored config from $LAST_BAK"
else
  echo "no backup found; leaving current config in place"
fi

echo
echo "system is now paper-only + halted. Remove /tmp/gclaw.halt when ready to resume."

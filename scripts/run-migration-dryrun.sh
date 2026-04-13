#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT_PATH="${1:-$ROOT_DIR/u947130940_subscription.sql}"
OUT_DIR="${2:-$ROOT_DIR/backend/validation/out}"
PROFILE_PATH="$ROOT_DIR/docs/data/sql-dump-profile.json"

python3 "$ROOT_DIR/backend/validation/sql_dump_profile.py" \
  --input "$INPUT_PATH" \
  --output "$PROFILE_PATH"

python3 "$ROOT_DIR/backend/validation/sql_to_mongo_dryrun.py" \
  --input "$INPUT_PATH" \
  --out-dir "$OUT_DIR"

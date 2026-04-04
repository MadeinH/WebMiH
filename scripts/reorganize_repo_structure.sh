#!/usr/bin/env bash
set -euo pipefail

# Reorganiza la estructura del monorepo:
# - frontend -> apps/web
# - backend, mih-FrontEnd, mih-next -> legacy/*
# Es idempotente: no sobreescribe si destino ya existe.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p apps legacy

move_if_exists() {
  local src="$1"
  local dst="$2"

  if [[ ! -e "$src" ]]; then
    echo "[skip] No existe: $src"
    return 0
  fi

  if [[ -e "$dst" ]]; then
    echo "[skip] Destino ya existe: $dst"
    return 0
  fi

  echo "[move] $src -> $dst"
  mv "$src" "$dst"
}

move_if_exists "frontend" "apps/web"
move_if_exists "backend" "legacy/backend"
move_if_exists "mih-FrontEnd" "legacy/mih-FrontEnd"
move_if_exists "mih-next" "legacy/mih-next"

echo "\n[done] Reorganización base completada."
echo "Siguiente: actualizar rutas/CI/deploy que referencian frontend/."

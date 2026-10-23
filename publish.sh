#!/bin/bash
# Publish the extension to the VS Code Marketplace and the Open VSX Registry.
#
# Usage: VSCE_PAT=<token> OPEN_VSX_PAT=<token> ./publish.sh [--dry-run] [marketplace|openvsx|all]
#
# The Release workflow (.github/workflows/release.yml) runs this with the VSCE_PAT and
# OPEN_VSX_PAT repository secrets. Both CLIs read their token from the environment, so it
# never appears on a command line. --dry-run builds both VSIX files without publishing.

set -euo pipefail

MARKETPLACE_PUBLISHER="MohithShrivastava"
OPENVSX_NAMESPACE="msrivastav13"

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=true
  shift
fi
TARGET="${1:-all}"
VERSION=$(node -p "require('./package.json').version")

require_token() {
  if [ "$DRY_RUN" = false ] && [ -z "${!1:-}" ]; then
    echo "Error: set $1 (see the usage at the top of $0)" >&2
    exit 1
  fi
}

publish_marketplace() {
  require_token VSCE_PAT
  local vsix="dx-code-companion-$VERSION.vsix"
  echo "Packaging $vsix for the VS Code Marketplace ($MARKETPLACE_PUBLISHER)..."
  npx --no-install vsce package --out "$vsix"
  if [ "$DRY_RUN" = false ]; then
    npx --no-install vsce publish --packagePath "$vsix" --skip-duplicate
  fi
}

publish_openvsx() {
  require_token OPEN_VSX_PAT
  local vsix="dx-code-companion-$VERSION-openvsx.vsix"
  echo "Packaging $vsix for Open VSX ($OPENVSX_NAMESPACE)..."
  # Open VSX uses a different namespace; restore package.json even if packaging fails.
  # The backup lives outside the repo so vsce can't package it.
  local backup
  backup=$(mktemp)
  cp package.json "$backup"
  trap "cp '$backup' package.json && rm -f '$backup'" EXIT
  npm pkg set publisher="$OPENVSX_NAMESPACE"
  npx --no-install vsce package --out "$vsix"
  cp "$backup" package.json && rm -f "$backup"
  trap - EXIT
  if [ "$DRY_RUN" = false ]; then
    OVSX_PAT="$OPEN_VSX_PAT" npx --no-install ovsx publish --packagePath "$vsix" --skip-duplicate
  fi
}

case "$TARGET" in
  marketplace) publish_marketplace ;;
  openvsx) publish_openvsx ;;
  all) publish_marketplace; publish_openvsx ;;
  *) echo "Unknown target '$TARGET' (expected marketplace, openvsx or all)" >&2; exit 1 ;;
esac

if [ "$DRY_RUN" = true ]; then
  echo "Dry run: packaged $VERSION for $TARGET without publishing"
else
  echo "Published $VERSION to $TARGET"
fi

#!/bin/bash
# Publish to Open VSX Registry
# Usage: OVSX_PAT=<token> ./publish-openvsx.sh
# (passing the token as an argument still works but leaves it in shell history)

set -e

OPENVSX_NAMESPACE="msrivastav13"
MARKETPLACE_NAMESPACE="MohithShrivastava"
TOKEN="${1:-$OVSX_PAT}"

if [ -z "$TOKEN" ]; then
  echo "Error: Provide token as argument or set OVSX_PAT env variable"
  echo "Usage: OVSX_PAT=<token> ./publish-openvsx.sh"
  exit 1
fi

echo "Switching publisher to $OPENVSX_NAMESPACE..."
sed -i.bak "s/\"publisher\": \"$MARKETPLACE_NAMESPACE\"/\"publisher\": \"$OPENVSX_NAMESPACE\"/" package.json

echo "Packaging extension..."
vsce package --no-git-tag-version

echo "Restoring publisher to $MARKETPLACE_NAMESPACE..."
mv package.json.bak package.json

VSIX_FILE=$(ls -t *.vsix | head -1)
echo "Publishing $VSIX_FILE to Open VSX..."
# ovsx reads OVSX_PAT from the environment, keeping the token out of the process list
OVSX_PAT="$TOKEN" npx ovsx publish "$VSIX_FILE"

echo "Cleaning up..."
rm -f "$VSIX_FILE"

echo "Done! Published to Open VSX as $OPENVSX_NAMESPACE"

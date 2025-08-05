#!/bin/sh

# Get repo name from URL (e.g., Dummy from Dummy.git)
REPO_NAME=$(basename -s .git "$REPO_URL")

# Get current date and time
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Set dynamic output directory
CLONE_DIR="/app/output/${REPO_NAME}_${TIMESTAMP}"

echo "📥 Cloning $REPO_URL into $CLONE_DIR..."

# Try to clone the repo
if git clone "$REPO_URL" "$CLONE_DIR"; then
  echo "✅ Clone successful!"
  echo "📂 Files in $CLONE_DIR:"
  ls -la "$CLONE_DIR"
  exit 0
else
  echo "❌ Clone failed for $REPO_URL"
  exit 1
fi

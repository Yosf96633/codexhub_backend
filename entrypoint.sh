#!/bin/sh

# Get repo name from URL (e.g. Dummy from Dummy.git)
REPO_NAME=$(basename -s .git "$REPO_URL")

# Get current date and time
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Set dynamic output directory
CLONE_DIR="/app/output/${REPO_NAME}_${TIMESTAMP}"

# Clone the repo
echo "📥 Cloning $REPO_URL into $CLONE_DIR..."
git clone "$REPO_URL" "$CLONE_DIR"

# Show result
echo "✅ Done. Files in:"
ls -la "$CLONE_DIR"

#!/bin/bash
set -e

echo "🚀 Starting GitHub Pages deployment..."

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "💾 Current branch: $CURRENT_BRANCH"

# Ensure we're on main and up to date
git checkout main
git pull origin main 2>/dev/null || true

# Move API routes temporarily
echo "📦 Moving API routes..."
if [ -d "src/app/api" ]; then
    mv src/app/api "$TEMP_DIR/api-backup"
fi

# Build static site
echo "🔨 Building static site..."
npm run build

# Copy only the out directory contents to temp
echo "📋 Copying build files..."
if [ -d "out" ]; then
    cp -r out/* "$TEMP_DIR/"
else
    echo "❌ No out directory found!"
    exit 1
fi

# Restore API routes
echo "🔄 Restoring API routes..."
if [ -d "$TEMP_DIR/api-backup" ]; then
    mv "$TEMP_DIR/api-backup" src/app/api
fi

# Clean any uncommitted changes
git checkout -- . 2>/dev/null || true
git clean -fd 2>/dev/null || true

# Switch to gh-pages (create if doesn't exist)
echo "🌿 Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout -b gh-pages
fi

# Clean gh-pages branch (keep only static files)
echo "🧹 Cleaning gh-pages branch..."
find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '..' -exec rm -rf {} + 2>/dev/null || true

# Copy new build files
echo "📥 Copying new build files..."
cp -r "$TEMP_DIR"/* .

# Commit and push
echo "💾 Committing changes..."
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
git push origin gh-pages

# Return to original branch
echo "🔙 Returning to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

# Cleanup
echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://these-are-the.github.io/absence-bots-youve-been-looking-for/"

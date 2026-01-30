#!/bin/bash
# Local CI validation script
# Run this before pushing to catch issues early

set -e

echo "🚀 Running local CI checks..."
echo ""

echo "📋 Step 1/4: Linting..."
npm run lint
echo "✅ Linting passed"
echo ""

echo "🔍 Step 2/4: Type checking..."
npx tsc --noEmit
echo "✅ Type check passed"
echo ""

echo "💅 Step 3/4: Format checking..."
npm run format:check
echo "✅ Format check passed"
echo ""

echo "🏗️  Step 4/4: Building..."
npm run build
echo "✅ Build passed"
echo ""

echo "✅ All CI checks passed! Safe to push."

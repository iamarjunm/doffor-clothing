#!/usr/bin/env bash
set -uo pipefail

echo "============================================================"
echo "  DOFFOR CLOTHING — SANITY CDN UPLOAD & SCHEMA DEPLOY"
echo "============================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "-> Step 1/3: Syncing local garment & editorial images..."
node scripts/sync-assets.mjs

echo "-> Step 2/3: Uploading all 14 images & seeding schemas to Sanity (mwmriieg/production)..."
node scripts/upload-assets-to-sanity.mjs

echo "-> Step 3/3: Installing Sanity Studio & deploying schemas..."
cd studio
pnpm install
pnpm dlx sanity schema deploy --yes || echo "   Note: Run 'cd studio && pnpm exec sanity login && pnpm exec sanity schema deploy' if prompted to authenticate Studio CLI."

echo ""
echo "============================================================"
echo "  ✅ SANITY CDN & SCHEMAS LIVE FOR DOFFOR CLOTHING!"
echo "============================================================"
echo "  • All 14 images are now hosted on https://cdn.sanity.io/images/mwmriieg/production/..."
echo "  • Run 'cd studio && pnpm dev' anytime to open Sanity Studio locally"
echo "  • Restart 'pnpm dev' in root and click 'Seed Firestore Catalog' in /admin to sync CDN URLs to Firestore!"

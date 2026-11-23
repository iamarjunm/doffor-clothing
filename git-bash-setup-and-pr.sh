#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "  DOFFOR CLOTHING — GIT BASH SETUP, BUILD & GITHUB PR"
echo "========================================================"

# 1. Ensure we are in the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 2. Clean any pre-migration Vite/Express scaffolding so the PR is 100% pure Next.js + Firebase
echo "-> Cleaning unused legacy files..."
rm -rf server src vite.config.js index.html

# 3. Sync all 6 real uploaded clothing photos + 8 generated editorial assets into public/images/
echo "-> Syncing all 14 brand & product assets into public/images/..."
node scripts/sync-assets.mjs

# 4. Install dependencies & verify Next.js production build
echo "-> Installing dependencies with pnpm..."
pnpm install

echo "-> Running Next.js production build check..."
pnpm build

# 5. Connect GitHub CLI (prompts interactive browser login if not signed in)
echo ""
echo "-> Checking GitHub CLI authentication..."
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) is not installed. Install from https://cli.github.com/ and re-run."
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Please authenticate your GitHub account in the browser prompt..."
  gh auth login --web --git-protocol https
fi

# 6. Initialize Git & configure remote repository
if [ ! -d ".git" ]; then
  git init -b main
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo ""
  read -r -p "Enter your GitHub repository URL (e.g. https://github.com/username/doffor-clothing.git) OR leave blank to create a new repo 'doffor-clothing': " REPO_URL
  if [ -z "$REPO_URL" ]; then
    echo "-> Creating new GitHub repository 'doffor-clothing'..."
    gh repo create doffor-clothing --private --source=. --remote=origin
  else
    git remote add origin "$REPO_URL"
  fi
fi

# Ensure base branch 'main' has an initial commit on origin if repo is brand new
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git checkout -b main
  git add README.md .gitignore .env.example
  git commit -m "chore: initial repository setup for Doffor Clothing"
  git push -u origin main || true
fi

# 7. Create feature branch, commit complete storefront, push, and open Pull Request
BRANCH_NAME="feat/doffor-clothing-nextjs-storefront"
echo "-> Creating feature branch: $BRANCH_NAME"
git checkout -B "$BRANCH_NAME"

git add .
git commit -m "feat: complete Doffor Clothing Next.js storefront with Firebase Auth/Firestore, Razorpay & Admin Panel"

echo "-> Pushing branch to origin..."
git push -u origin "$BRANCH_NAME" --force-with-lease

echo "-> Opening Pull Request on GitHub..."
gh pr create \
  --title "feat: Doffor Clothing — Complete Next.js Storefront, Firebase Auth/Firestore, Razorpay & Admin Panel" \
  --body "## Summary
Complete flagship e-commerce build for **Doffor Clothing** using **Next.js 15 App Router**, **Firebase** (Google Sign-In/Sign-Up, Email Auth, Cloud Firestore, Firebase Storage), and **Razorpay** payments.

### What's Included
- **Storefront Pages**: Home (Hero Campaign, Drop 04 Countdown, Bento Silhouettes, Featured Drop Grid, 260 GSM Fabric Showcase, Lookbook Strip), Shop All (full filters & sort), Dynamic Collections, Deep Product Detail Page (multi-photo gallery, colorway swatches, S–XXL stock matrix, Pincode ETA, Interactive Fit Calculator, Verified Reviews), Shoppable Lookbook, About, Community & Collabs, Order Tracker, Size Guide, Shipping/Returns, Contact, Privacy & Terms.
- **Authentication**: Firebase Google Sign-In/Sign-Up + Email/Password Auth + zero-config local preview mode.
- **External Database**: Cloud Firestore & Firebase Storage integration (`lib/firebase.js`, `lib/dataService.js`, `firestore.rules`, `storage.rules`) — zero local DB.
- **Razorpay Integration**: Next.js Route Handlers (`/api/razorpay/create-order`, `/api/razorpay/verify`) with HMAC-SHA256 signature verification + built-in Razorpay Test Checkout modal.
- **Full Admin Command Center (`/admin`)**: Analytics KPIs & Charts, Product CRUD with Firebase Storage Image Upload, Order Fulfillment & Tracking, Size Stock Matrix, Promo Codes, Storefront Banner/Countdown Config, Customer Roles & Inquiries.
- **Assets**: All 6 real garment photographs + 8 custom editorial campaign & studio images synced into `public/images/`.

### Verification
- [x] `node scripts/sync-assets.mjs`
- [x] `npm install`
- [x] `npm run build` passed cleanly"

echo ""
echo "✅ ALL DONE! Your Doffor Clothing Pull Request is live on GitHub!"

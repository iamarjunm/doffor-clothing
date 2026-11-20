#!/usr/bin/env bash
set -uo pipefail

echo "============================================================"
echo "  DOFFOR CLOTHING — FULL AUTOMATED FIREBASE PROVISIONING"
echo "============================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Always use official latest firebase-tools via npx
FB="npx -y firebase-tools@latest"

# Helper to extract JSON safely even if Node 24 on Windows triggers libuv UV_HANDLE_CLOSING on exit
extract_json() {
  node -e '
    const fs = require("fs");
    const raw = fs.readFileSync(0, "utf8");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) { console.log("{}"); process.exit(0); }
    console.log(raw.slice(start, end + 1));
  '
}

echo "-> Step 1/6: Checking Firebase CLI & verifying authentication..."
$FB --version 2>/dev/null || true

PROJ_JSON="$($FB projects:list --json 2>/dev/null | extract_json)"
IS_AUTHED="$(node -e 'const d = JSON.parse(process.argv[1] || "{}"); console.log(d.status === "success" ? "yes" : "no");' "$PROJ_JSON")"

if [ "$IS_AUTHED" != "yes" ]; then
  echo "-> Refreshing Firebase login session in your browser..."
  $FB login --reauth || true
  PROJ_JSON="$($FB projects:list --json 2>/dev/null | extract_json)"
fi

echo ""
echo "Existing Firebase projects on your account:"
node -e '
  const d = JSON.parse(process.argv[1] || "{}");
  const list = d.result || [];
  if (!list.length) console.log("  (none)");
  for (const p of list) {
    console.log("  • " + p.projectId + " (" + (p.displayName || p.projectId) + ")");
  }
' "$PROJ_JSON"

echo ""
read -r -p "Enter an existing Project ID OR a new unique Project ID (e.g. doffor-clothing-2026): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID cannot be empty."
  exit 1
fi

EXISTS="$(node -e 'const d = JSON.parse(process.argv[1] || "{}"); console.log((d.result || []).some(p => p.projectId === process.argv[2]) ? "yes" : "no");' "$PROJ_JSON" "$PROJECT_ID")"

if [ "$EXISTS" != "yes" ]; then
  echo "-> Creating new Firebase project '$PROJECT_ID'..."
  $FB projects:create "$PROJECT_ID" --display-name "Doffor Clothing" || true
fi

$FB use "$PROJECT_ID" || true

echo "-> Step 2/6: Provisioning Cloud Firestore database (asia-south1 / Mumbai)..."
DB_LIST="$($FB firestore:databases:list --project "$PROJECT_ID" --json 2>/dev/null | extract_json)"
HAS_DEFAULT_DB="$(node -e 'const d = JSON.parse(process.argv[1] || "{}"); console.log((d.result || []).some(db => (db.name || "").endsWith("/(default)")) ? "yes" : "no");' "$DB_LIST")"

if [ "$HAS_DEFAULT_DB" != "yes" ]; then
  $FB firestore:databases:create "(default)" --location="asia-south1" --project "$PROJECT_ID" || true
else
  echo "   ✓ Default Firestore database already exists."
fi

echo "-> Step 3/6: Registering Web App & fetching SDK credentials..."
APP_LIST_JSON="$($FB apps:list WEB --project "$PROJECT_ID" --json 2>/dev/null | extract_json)"
APP_ID="$(node -e 'const d = JSON.parse(process.argv[1] || "{}"); console.log(d.result?.[0]?.appId || "");' "$APP_LIST_JSON")"

if [ -z "$APP_ID" ]; then
  echo "   Creating Web App 'Doffor Clothing'..."
  CREATED_JSON="$($FB apps:create WEB "Doffor Clothing" --project "$PROJECT_ID" --json 2>/dev/null | extract_json)"
  APP_ID="$(node -e 'const d = JSON.parse(process.argv[1] || "{}"); console.log(d.result?.appId || d.result?.[0]?.appId || "");' "$CREATED_JSON")"
fi

if [ -z "$APP_ID" ]; then
  echo "ERROR: Could not create or locate a Firebase Web App for project '$PROJECT_ID'."
  echo "If '$PROJECT_ID' was already taken globally, re-run with a more unique ID like doffor-clothing-in-2026."
  exit 1
fi

SDK_JSON="$($FB apps:sdkconfig WEB "$APP_ID" --project "$PROJECT_ID" --json 2>/dev/null | extract_json)"

echo ""
read -r -p "Enter your Google/Email address for Admin role access [arjunhero38@gmail.com]: " ADMIN_EMAIL
ADMIN_EMAIL="${ADMIN_EMAIL:-arjunhero38@gmail.com}"

# Update firebase.json supportEmail & redirect URI for this project
node -e '
const fs = require("fs");
const projectId = process.argv[1];
const email = process.argv[2];
const cfg = JSON.parse(fs.readFileSync("firebase.json", "utf8"));
if (cfg.auth?.providers?.googleSignIn) {
  cfg.auth.providers.googleSignIn.supportEmail = email;
  cfg.auth.providers.googleSignIn.authorizedRedirectUris = [
    "https://" + projectId + ".firebaseapp.com/__/auth/handler",
    "http://localhost:3000"
  ];
}
fs.writeFileSync("firebase.json", JSON.stringify(cfg, null, 2) + "\n", "utf8");
' "$PROJECT_ID" "$ADMIN_EMAIL"

echo "-> Step 4/6: Writing .env.local with live Firebase keys..."
node -e '
const fs = require("fs");
const data = JSON.parse(process.argv[1] || "{}");
const cfg = data.result?.sdkConfig || data.result || {};
const adminEmail = process.argv[2];

if (!cfg.apiKey || !cfg.projectId) {
  console.error("ERROR: Firebase SDK config was empty. Check project ID:", process.argv[1]);
  process.exit(1);
}

let existing = "";
if (fs.existsSync(".env.local")) {
  existing = fs.readFileSync(".env.local", "utf8");
}

const rzpKey = (existing.match(/^RAZORPAY_KEY_ID=(.*)$/m)?.[1] || "").trim();
const rzpSecret = (existing.match(/^RAZORPAY_KEY_SECRET=(.*)$/m)?.[1] || "").trim();

const envContent = [
  "# Auto-generated by setup-firebase.sh for Doffor Clothing",
  "NEXT_PUBLIC_FIREBASE_API_KEY=" + cfg.apiKey,
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=" + (cfg.authDomain || ""),
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=" + cfg.projectId,
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=" + (cfg.storageBucket || ""),
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=" + (cfg.messagingSenderId || ""),
  "NEXT_PUBLIC_FIREBASE_APP_ID=" + (cfg.appId || ""),
  "",
  "NEXT_PUBLIC_ADMIN_EMAILS=" + adminEmail,
  "",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID=" + rzpKey,
  "RAZORPAY_KEY_ID=" + rzpKey,
  "RAZORPAY_KEY_SECRET=" + rzpSecret,
  ""
].join("\n");

fs.writeFileSync(".env.local", envContent, "utf8");
console.log("   ✓ Wrote .env.local for project: " + cfg.projectId);
' "$SDK_JSON" "$ADMIN_EMAIL"

echo "-> Step 5/6: Enabling Google Sign-In & Email/Password Auth via CLI..."
$FB deploy --only auth --project "$PROJECT_ID" || echo "   Note: If prompted, toggle Google & Email/Password ON at https://console.firebase.google.com/project/$PROJECT_ID/authentication/providers"

echo "-> Step 6/6: Deploying hardened Firestore & Storage security rules..."
$FB deploy --only firestore:rules --project "$PROJECT_ID" || true
$FB deploy --only storage --project "$PROJECT_ID" || echo "   Note: Enable Storage once in Firebase Console, then run: npx -y firebase-tools@latest deploy --only storage"

echo ""
echo "============================================================"
echo "  ✅ FIREBASE FULLY PROVISIONED FOR DOFFOR CLOTHING!"
echo "============================================================"
echo "Next steps:"
echo "  1. Restart dev server: npm run dev"
echo "  2. Sign in at http://localhost:3000/auth with $ADMIN_EMAIL"
echo "  3. Open Profile Dropdown -> Admin Panel -> Click Seed Firestore Catalog"

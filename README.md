# DOFFOR CLOTHING — Heavyweight Archive Streetwear

A flagship full-stack **Next.js 15 (App Router)** streetwear e-commerce platform built for **Doffor Clothing**, powered by **Firebase** (Google Sign-In/Sign-Up, Email Auth, Cloud Firestore, Firebase Storage) and **Razorpay** (UPI, GPay, PhonePe, Cards, Netbanking, Wallets, HMAC-SHA256 verification), with a complete **Admin Command Center**.

---

## Key Features

- **Storefront & Editorial Pages**: Home (Hero Campaign + Live Drop 04 Countdown + Bento Silhouettes + Fabric Engineering + Lookbook Strip), Shop All (Multi-facet filters & sorting), Dynamic Collections, Deep Product Detail Page (Multi-image gallery, colorway swatches, S–XXL stock matrix, Indian Pincode ETA, Interactive Fit Calculator, Verified Reviews), Shoppable Lookbook, About, Community & Collaborations, Order Tracker, Size Guide, Shipping/Returns, Contact, Privacy & Terms.
- **Google Sign-In / Sign-Up + Email Auth (Firebase Auth)**: Real `GoogleAuthProvider` popup OAuth and Email/Password authentication synced to Firestore `users/{uid}`, plus a zero-config Preview Mode out of the box.
- **External Cloud Database (Firebase Firestore + Storage)**: Zero local database files. Products, Orders, Stock Matrices, Promo Codes, Users, Reviews, Storefront Config, and Custom Inquiries live in Cloud Firestore; Admin product photo uploads go directly to Firebase Storage.
- **Razorpay Payments**: Next.js App Router API routes (`/api/razorpay/create-order` & `/api/razorpay/verify`) supporting live/test Razorpay Checkout SDK with HMAC-SHA256 signature verification, plus a built-in Razorpay Test Checkout Simulator before keys are added.
- **Complete Admin Panel (`/admin`)**: KPI Analytics & Revenue Charts, Full Product CRUD with Drag-and-Drop Image Upload, Order Fulfillment & Tracking Number Management, Spreadsheet Size-Stock Matrix, Promo Code Manager, Live Storefront Banner/Countdown Editor, Customer Role Management, and Inquiries/Newsletter Dashboard.

---

## Quick Start (Git Bash)

```bash
cd /c/Users/arjun/Downloads/doffor-clothing

# 1. Sync all product & campaign images and install dependencies
npm run sync-assets
npm install

# 2. (Optional) Copy .env.example to .env.local and add Firebase + Razorpay keys
cp .env.example .env.local

# 3. Start Next.js dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Connecting Firebase & Razorpay (`.env.local`)

The entire storefront and Admin Panel work **immediately** in Preview Mode without any keys. When you're ready to connect your live external Firebase project and Razorpay account:

1. Create a project at [Firebase Console](https://console.firebase.google.com):
   - Enable **Authentication** → Sign-in methods: **Google** & **Email/Password**
   - Enable **Cloud Firestore** (deploy `firestore.rules`)
   - Enable **Firebase Storage** (deploy `storage.rules`)
2. Paste your Web App credentials into `.env.local` (see `.env.example`).
3. Set `NEXT_PUBLIC_ADMIN_EMAILS=youremail@gmail.com` to grant yourself Admin access.
4. Open `/admin` and click **"Seed Firestore Catalog"** once to populate Drop 04 in Firestore.
5. Add your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) into `.env.local` to switch from the built-in Razorpay Simulator to the live Razorpay SDK.

---

## Creating a GitHub Pull Request (Git Bash)

Run the included script in **Git Bash**:

```bash
bash git-bash-setup-and-pr.sh
```

It automatically cleans up any legacy files, copies all 14 garment & campaign images into `public/images/`, installs dependencies, verifies the production Next.js build, prompts you to authenticate GitHub (`gh auth login`), pushes a feature branch, and opens a Pull Request!
# doffor-clothing

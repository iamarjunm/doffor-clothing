import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_DIR = path.resolve(__dirname, '..', 'public', 'images');

fs.mkdirSync(TARGET_DIR, { recursive: true });

const ASSET_MAP = [
  // User's 6 actual clothing stock photographs
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178571660_5846b37f.jpg',
    'real-angel-fullsleeve-black.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178586389_66bf89a1.jpg',
    'real-bootleg-tee.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178592731_4905b03d.jpg',
    'real-dragon-fullsleeve.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178599162_77d21db6.jpg',
    'real-angel-fullsleeve-rack.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178606083_17933afc.jpg',
    'real-muscle-tank.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/.user_uploaded/media_1795178631118_98f5702f.jpg',
    'real-angel-halfsleeve.jpg',
  ],
  // 8 Bespoke AI-generated Doffor editorial campaign & studio assets
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/hero_campaign_1795178910267.jpg',
    'hero-campaign.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/product_angel_fullsleeve_1795178927818.jpg',
    'product-angel-fullsleeve.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/product_dragon_fullsleeve_1795178912525.jpg',
    'product-dragon-fullsleeve.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/product_bootleg_tee_1795178916595.jpg',
    'product-bootleg-tee.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/9f194c2d-6936-44c1-bc40-e615b28ed193/product_muscle_tank_1795178924954.jpg',
    'product-muscle-tank.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/product_angel_halfsleeve_1795178921617.jpg',
    'product-angel-halfsleeve.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/lookbook_campus_1_1795178923143.jpg',
    'lookbook-campus-1.jpg',
  ],
  [
    'C:/Users/arjun/.gemini/antigravity/brain/94489bc7-4fa1-4517-887b-faf02a8f191a/lookbook_campus_2_clean_1795178952551.jpg',
    'lookbook-campus-2.jpg',
  ],
];

let copied = 0;
let alreadyPresent = 0;

for (const [src, destName] of ASSET_MAP) {
  const dest = path.join(TARGET_DIR, destName);
  if (fs.existsSync(dest)) {
    alreadyPresent++;
    continue;
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    copied++;
  }
}

console.log(
  `[DOFFOR ASSETS] Synced ${copied} new images (${alreadyPresent} already present) -> public/images/`
);

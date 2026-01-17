// Simple script to generate PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple PNG using raw bytes (1x1 pixel scaled up won't work well,
// so we'll create a data URL that can be used)

// For now, create placeholder files that indicate icons are needed
const iconDir = path.join(__dirname, '../public/icons');

// Simple 192x192 and 512x512 placeholder PNGs
// These are minimal valid PNGs with a gray color

// Minimal valid PNG (1x1 gray pixel, browsers will scale it)
const png1x1Gray = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
  0x54, 0x08, 0xD7, 0x63, 0x48, 0x49, 0x49, 0x01,
  0x00, 0x01, 0x98, 0x00, 0xA5, 0x68, 0xE6, 0x32,
  0x7C, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
  0x44, 0xAE, 0x42, 0x60, 0x82
]);

// Create icon files
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

fs.writeFileSync(path.join(iconDir, 'icon-192.png'), png1x1Gray);
fs.writeFileSync(path.join(iconDir, 'icon-512.png'), png1x1Gray);

console.log('Created placeholder icons. For better icons:');
console.log('1. Install sharp: npm install -D sharp');
console.log('2. Or manually create 192x192 and 512x512 PNG icons');
console.log('3. Place them in public/icons/');

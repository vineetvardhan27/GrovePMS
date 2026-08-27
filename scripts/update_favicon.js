const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\VINEET VARDHAN\\.gemini\\antigravity-ide\\brain\\ec87d3eb-c643-4b91-b6cb-6cf5fa7b0de6\\.user_uploaded\\media_1787824780371.jpg';

const imageBuffer = fs.readFileSync(srcPath);

const destinations = [
  'app/favicon.ico',
  'app/icon.png',
  'app/apple-icon.png',
  'public/Grove.png',
  'public/favicon.ico',
  'public/favicon.png',
  'public/icon.png',
  'public/apple-touch-icon.png',
  'public/logo.png'
];

destinations.forEach(dest => {
  const fullDest = path.resolve(process.cwd(), dest);
  fs.writeFileSync(fullDest, imageBuffer);
  console.log(`✓ Copied to ${dest} (${imageBuffer.length} bytes)`);
});

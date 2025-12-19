/**
 * Image Optimization Script
 *
 * Compresses existing images and generates WebP/AVIF versions
 * for optimal performance.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Large images that need optimization
const imagesToOptimize = [
  'pexels-alex-andrews-271121-816608.jpg',
  'pexels-philippedonn-1257860.jpg',
  'crystal-x-logo.png',
  'planetss.jpg',
  '0-02-0b-dc8309f78922d0dee476df28963e2c64893e4d445d332a01bcfa906cf950e5bc_dd1baa978b74c3a3.jpg',
  'crystal-x-logo.jpg',
  'Untitled.jpg',
];

async function optimizeImage(filename) {
  const inputPath = path.join(publicDir, filename);

  // Check if file exists
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${filename} - file not found`);
    return;
  }

  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  try {
    const stats = fs.statSync(inputPath);
    const originalSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`\n📸 Processing: ${filename} (${originalSizeKB} KB)`);

    // Generate WebP version (80% quality)
    const webpPath = path.join(publicDir, `${name}.webp`);
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    const webpSizeKB = (webpStats.size / 1024).toFixed(2);
    console.log(`  ✓ WebP: ${webpSizeKB} KB (${((1 - webpStats.size / stats.size) * 100).toFixed(1)}% reduction)`);

    // Generate AVIF version (70% quality - better compression)
    const avifPath = path.join(publicDir, `${name}.avif`);
    await sharp(inputPath)
      .avif({ quality: 70 })
      .toFile(avifPath);

    const avifStats = fs.statSync(avifPath);
    const avifSizeKB = (avifStats.size / 1024).toFixed(2);
    console.log(`  ✓ AVIF: ${avifSizeKB} KB (${((1 - avifStats.size / stats.size) * 100).toFixed(1)}% reduction)`);

    // Optimize original
    const optimizedPath = path.join(publicDir, `${name}-optimized${ext}`);

    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(inputPath)
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toFile(optimizedPath);
    } else if (ext === '.png') {
      await sharp(inputPath)
        .png({ quality: 85, compressionLevel: 9, adaptiveFiltering: true })
        .toFile(optimizedPath);
    }

    const optimizedStats = fs.statSync(optimizedPath);
    const optimizedSizeKB = (optimizedStats.size / 1024).toFixed(2);
    console.log(`  ✓ Optimized ${ext}: ${optimizedSizeKB} KB (${((1 - optimizedStats.size / stats.size) * 100).toFixed(1)}% reduction)`);

  } catch (error) {
    console.error(`  ❌ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📁 Public directory: ${publicDir}\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  // Process each image
  for (const filename of imagesToOptimize) {
    await optimizeImage(filename);

    const inputPath = path.join(publicDir, filename);
    if (fs.existsSync(inputPath)) {
      totalOriginalSize += fs.statSync(inputPath).size;

      const ext = path.extname(filename);
      const name = path.basename(filename, ext);
      const optimizedPath = path.join(publicDir, `${name}-optimized${ext}`);

      if (fs.existsSync(optimizedPath)) {
        totalOptimizedSize += fs.statSync(optimizedPath).size;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Image optimization complete!');
  console.log('='.repeat(60));
  console.log(`\n📊 Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Total optimized size: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📊 Total savings: ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%`);

  console.log('\n💡 Next steps:');
  console.log('  1. Review the optimized images in the public/ directory');
  console.log('  2. Replace <img> tags with Next.js <Image> component');
  console.log('  3. Update image paths to use -optimized versions or .webp/.avif');
  console.log('  4. Remove original large images if satisfied with optimized versions\n');
}

main().catch(console.error);

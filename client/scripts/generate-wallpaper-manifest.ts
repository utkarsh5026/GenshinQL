import fs from 'fs';
import { logger } from 'logger.js';
import path from 'path';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../public');
const WALLPAPERS_DIR = path.join(PUBLIC_DIR, 'images/wallpapers');
const MANIFEST_PATH = path.join(WALLPAPERS_DIR, 'manifest.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function scanFolder(folderPath: string): string[] {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => `images/wallpapers/${path.basename(folderPath)}/${file}`);
}

function generate() {
  logger.info('Scanning wallpaper folders...');

  const categories = fs
    .readdirSync(WALLPAPERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const manifest: Record<string, string[]> = {};

  for (const category of categories) {
    const images = scanFolder(path.join(WALLPAPERS_DIR, category));
    manifest[category] = images;
    logger.debug(`  ${category}: ${images.length} image(s)`);
  }

  const totalImages = Object.values(manifest).reduce(
    (sum, imgs) => sum + imgs.length,
    0
  );

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  logger.success(
    `Manifest generated: ${totalImages} images across ${categories.length} categories`
  );
  logger.debug(`  Written to ${MANIFEST_PATH}`);
}

generate();

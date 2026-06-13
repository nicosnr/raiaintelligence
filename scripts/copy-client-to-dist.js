import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const sourceDir = join(process.cwd(), 'dist', 'client');
const targetDir = join(process.cwd(), 'dist');

if (!existsSync(sourceDir)) {
  console.error('Error: dist/client does not exist. Did Vite build run successfully?');
  process.exit(1);
}

function copyRecursive(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

copyRecursive(sourceDir, targetDir);

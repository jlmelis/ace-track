#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function fileExists(path) {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

function bumpVersion() {
  try {
    console.log('🚀 Starting version bump...');
    
    // Get current version from package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = readJson(packageJsonPath);
    const currentVersion = packageJson.version;
    console.log(`📦 Current version: ${currentVersion}`);
    
    // Bump version using npm version patch
    console.log('⬆️  Bumping patch version...');
    execSync('npm version patch --no-git-tag-version', { stdio: 'inherit', cwd: rootDir });
    
    // Read new version
    const updatedPackageJson = readJson(packageJsonPath);
    const newVersion = updatedPackageJson.version;
    console.log(`✅ New version: ${newVersion}`);
    
    // Update metadata.json
    const metadataPath = join(rootDir, 'metadata.json');
    if (fileExists(metadataPath)) {
      const metadata = readJson(metadataPath);
      metadata.version = newVersion;
      writeJson(metadataPath, metadata);
      console.log(`📝 Updated metadata.json to version ${newVersion}`);
    } else {
      console.log('⚠️  metadata.json not found, skipping...');
    }
    
    // Update App.tsx
    const appTsxPath = join(rootDir, 'App.tsx');
    let appTsx = readFileSync(appTsxPath, 'utf8');
    // Match any version pattern like 'v25' or 'v1.0.0'
    appTsx = appTsx.replace(/const VERSION = 'v[^']+';/, `const VERSION = 'v${newVersion}';`);
    writeFileSync(appTsxPath, appTsx);
    console.log(`⚛️  Updated App.tsx VERSION to v${newVersion}`);
    
    // Update service worker
    const swPath = join(rootDir, 'public', 'sw.js');
    let swContent = readFileSync(swPath, 'utf8');
    // Match any cache name pattern like 'acetrack-v25' or 'acetrack-v1.0.0'
    swContent = swContent.replace(/const CACHE_NAME = 'acetrack-v[^']+';/, `const CACHE_NAME = 'acetrack-v${newVersion}';`);
    writeFileSync(swPath, swContent);
    console.log(`🔧 Updated service worker CACHE_NAME to acetrack-v${newVersion}`);
    
    console.log('🎉 Version bump complete!');
    console.log(`📋 Files updated: package.json, metadata.json, App.tsx, public/sw.js`);
    
  } catch (error) {
    console.error('❌ Error during version bump:', error.message);
    process.exit(1);
  }
}

// Run the script
bumpVersion();
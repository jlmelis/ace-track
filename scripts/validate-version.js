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

function fileExists(path) {
  try {
    readFileSync(path);
    return true;
  } catch {
    return false;
  }
}

function getCurrentVersion() {
  const packageJsonPath = join(rootDir, 'package.json');
  const packageJson = readJson(packageJsonPath);
  return packageJson.version;
}

function getPreviousVersionFromGit() {
  try {
    // Try to get version from previous commit
    const output = execSync('git log -1 --pretty=format:"%B"', { cwd: rootDir, encoding: 'utf8' });
    const versionMatch = output.match(/version (\d+\.\d+\.\d+)/);
    if (versionMatch) {
      return versionMatch[1];
    }
    
    // Try to get from package.json in previous commit
    const packageJsonContent = execSync('git show HEAD:package.json 2>/dev/null || echo ""', { 
      cwd: rootDir, 
      encoding: 'utf8' 
    });
    if (packageJsonContent) {
      const previousPackageJson = JSON.parse(packageJsonContent);
      return previousPackageJson.version;
    }
  } catch (error) {
    // Git might not be available or repo might be shallow
    console.log('⚠️  Could not get previous version from git:', error.message);
    return getPreviousVersionFromFileFallback();
  }
  return null;
}

function getPreviousVersionFromFileFallback() {
  try {
    const previousVersionPath = join(rootDir, '.previous-version');
    if (fileExists(previousVersionPath)) {
      const previousVersion = readFileSync(previousVersionPath, 'utf8').trim();
      console.log(`📄 Previous version from file fallback: ${previousVersion}`);
      return previousVersion;
    }
    
    // Check dist directory for previous build artifacts
    const distPackageJsonPath = join(rootDir, 'dist', 'package.json');
    if (fileExists(distPackageJsonPath)) {
      const distPackageJson = readJson(distPackageJsonPath);
      console.log(`📦 Previous version from dist artifact: ${distPackageJson.version}`);
      return distPackageJson.version;
    }
    
    console.log('⚠️  No previous version found in file fallback');
    return null;
  } catch (error) {
    console.log('⚠️  File fallback failed:', error.message);
    return null;
  }
}

function checkFileConsistency(currentVersion) {
  const errors = [];
  
  // Check App.tsx
  const appTsxPath = join(rootDir, 'App.tsx');
  const appTsx = readFileSync(appTsxPath, 'utf8');
  const appVersionMatch = appTsx.match(/const VERSION = 'v([^']+)';/);
  if (!appVersionMatch || appVersionMatch[1] !== currentVersion) {
    errors.push(`App.tsx VERSION mismatch: expected 'v${currentVersion}', found '${appVersionMatch ? 'v' + appVersionMatch[1] : 'not found'}'`);
  }
  
  // Check service worker
  const swPath = join(rootDir, 'public', 'sw.js');
  const swContent = readFileSync(swPath, 'utf8');
  const swVersionMatch = swContent.match(/const CACHE_NAME = 'acetrack-v([^']+)';/);
  if (!swVersionMatch || swVersionMatch[1] !== currentVersion) {
    errors.push(`Service worker CACHE_NAME mismatch: expected 'acetrack-v${currentVersion}', found '${swVersionMatch ? 'acetrack-v' + swVersionMatch[1] : 'not found'}'`);
  }
  
  // Check metadata.json
  const metadataPath = join(rootDir, 'metadata.json');
  if (fileExists(metadataPath)) {
    const metadata = readJson(metadataPath);
    if (metadata.version !== currentVersion) {
      errors.push(`metadata.json version mismatch: expected '${currentVersion}', found '${metadata.version}'`);
    }
  }
  
  return errors;
}

function saveCurrentVersionForFallback(currentVersion) {
  try {
    const previousVersionPath = join(rootDir, '.previous-version');
    writeFileSync(previousVersionPath, currentVersion);
    console.log(`💾 Saved current version for future fallback: ${currentVersion}`);
  } catch (error) {
    console.log('⚠️  Could not save version for fallback:', error.message);
  }
}

function validateVersion() {
  try {
    console.log('🔍 Starting version validation...');
    
    const currentVersion = getCurrentVersion();
    console.log(`📦 Current version in package.json: ${currentVersion}`);
    
    // Skip validation in development mode
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log('⚡ Development mode detected, skipping version validation');
      return true;
    }
    
    // Get previous version from git
    const previousVersion = getPreviousVersionFromGit();
    
    if (previousVersion) {
      console.log(`📜 Previous version: ${previousVersion}`);
      
      // Parse versions
      const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number);
      const [prevMajor, prevMinor, prevPatch] = previousVersion.split('.').map(Number);
      
      // Check if version has been incremented
      if (currentMajor === prevMajor && currentMinor === prevMinor && currentPatch === prevPatch) {
        console.error('❌ VERSION VALIDATION FAILED');
        console.error(`   Version has not been incremented since last commit`);
        console.error(`   Current: ${currentVersion}, Previous: ${previousVersion}`);
        console.error(`   Please increment the version in package.json before building`);
        console.error(`   You can run: npm run version:bump`);
        return false;
      }
      
      // Check if version was decremented
      if (currentMajor < prevMajor || 
          (currentMajor === prevMajor && currentMinor < prevMinor) ||
          (currentMajor === prevMajor && currentMinor === prevMinor && currentPatch < prevPatch)) {
        console.error('❌ VERSION VALIDATION FAILED');
        console.error(`   Version has been decremented`);
        console.error(`   Current: ${currentVersion}, Previous: ${previousVersion}`);
        console.error(`   Version numbers should only increase`);
        return false;
      }
      
      console.log(`✅ Version incremented correctly: ${previousVersion} → ${currentVersion}`);
    } else {
      console.log('⚠️  Could not determine previous version, skipping increment validation');
    }
    
    // Check file consistency
    console.log('🔗 Checking file consistency...');
    const consistencyErrors = checkFileConsistency(currentVersion);
    
    if (consistencyErrors.length > 0) {
      console.error('❌ FILE CONSISTENCY VALIDATION FAILED');
      consistencyErrors.forEach(error => console.error(`   ${error}`));
      console.error(`   Please run: npm run version:bump to synchronize all files`);
      return false;
    }
    
    console.log('✅ All versioned files are consistent');
    
    // Save current version for future fallback
    saveCurrentVersionForFallback(currentVersion);
    
    console.log('🎉 Version validation passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Error during version validation:', error.message);
    return false;
  }
}

// Run validation
const isValid = validateVersion();
if (!isValid) {
  process.exit(1);
}
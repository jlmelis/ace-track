# Version Management for AceTrack PWA

## Overview

AceTrack now has automated version management to ensure PWA updates are properly recognized by users. The system automatically increments version numbers and validates them before allowing production deployments.

## How It Works

### Version Synchronization
- **Source of truth**: `package.json` version field
- **Synchronized files**:
  - `metadata.json` - PWA manifest version
  - `App.tsx` - VERSION constant for UI display
  - `public/sw.js` - CACHE_NAME for service worker cache busting

### Build Process
1. **Development builds** (`npm run dev`): No version validation or bumping
2. **Regular builds** (`npm run build`): Standard Vite build without version changes
3. **Production builds** (`npm run build:prod`):
   - Validates version has been incremented
   - Automatically bumps patch version
   - Synchronizes all versioned files
   - Builds the application

### Version Validation
The system validates that:
1. Version has been incremented since last commit (using git history)
2. Version follows semantic versioning format (X.Y.Z)
3. All versioned files are consistent with package.json
4. Version has not been decremented

## Commands

### Available Scripts
- `npm run build:prod` - Production build with version validation and bumping
- `npm run version:bump` - Manually bump version and synchronize files
- `npm run version:validate` - Validate version without bumping

### Manual Version Management
```bash
# Bump version manually
npm run version:bump

# Validate version without building
npm run version:validate

# Production build (recommended for deployments)
npm run build:prod
```

## File Locations

### Version Scripts
- `scripts/version-bump.js` - Version bumping and synchronization
- `scripts/validate-version.js` - Version validation

### Versioned Files
- `package.json` - Source version (line 4)
- `metadata.json` - PWA manifest version
- `App.tsx` - VERSION constant (line 17)
- `public/sw.js` - CACHE_NAME (line 1)

## Error Handling

### Common Errors and Solutions

1. **"Version has not been incremented since last commit"**
   - Run: `npm run version:bump`
   - Or manually update version in `package.json`

2. **"File consistency validation failed"**
   - Run: `npm run version:bump` to synchronize all files

3. **"Version has been decremented"**
   - Fix version in `package.json` to be higher than previous version

4. **Development mode warnings**
   - Normal - validation is skipped in development (`NODE_ENV=development`)

## Service Worker Updates

When a new version is deployed:
1. Service worker detects new CACHE_NAME
2. New cache is created, old caches are cleaned
3. App shows update notification to user
4. User clicks "Reload" to activate new version

## Best Practices

1. **Always use `npm run build:prod` for deployments**
2. **Commit version changes** after production builds
3. **Check version display** in app header after updates
4. **Test service worker updates** by deploying to staging first

## Troubleshooting

### Git History Issues
If git is not available or history is shallow:
- Version increment validation is skipped
- File consistency validation still runs
- Build proceeds if files are consistent

### Manual Overrides
If automated system fails:
1. Manually update version in `package.json`
2. Run `npm run version:bump` to synchronize
3. Run `npm run build` for standard build
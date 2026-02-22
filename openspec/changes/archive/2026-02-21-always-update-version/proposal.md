## Why

PWA updates are not being recognized by users because version numbers are not consistently updated. When we deploy new features or bug fixes, the PWA service worker cache prevents users from seeing changes until they manually refresh or clear cache. This creates a poor user experience where users continue using outdated versions of the application.

## What Changes

- **Add automated version bumping** to package.json and metadata.json during build process
- **Synchronize version** in App.tsx (VERSION constant) and service worker (CACHE_NAME) with package.json version
- **Create version validation** to ensure version is always incremented before deployment
- **Implement build-time checks** that fail if version hasn't been updated since last commit
- **Add version display** in the application UI to show current version to users
- **BREAKING**: Builds will fail if version hasn't been incremented, requiring manual version updates

## Capabilities

### New Capabilities
- `version-management`: Automated version bumping and validation during build process
- `pwa-update-detection`: Service worker and UI updates to detect and notify users of new versions
- `build-validation`: Pre-build checks to ensure version increments and prevent stale deployments

### Modified Capabilities
<!-- No existing capabilities need modification -->

## Impact

- **package.json**: Version field will be automatically updated during build
- **metadata.json**: Version metadata will be synchronized with package.json
- **App.tsx**: VERSION constant will be synchronized with package.json version
- **Service Worker**: CACHE_NAME will be synchronized with package.json version
- **Build process**: Additional validation steps added to vite build pipeline
- **Service Worker**: Enhanced update detection and notification logic
- **UI Components**: Version display added to application footer or settings
- **CI/CD**: Builds will fail if version hasn't been incremented, requiring manual intervention
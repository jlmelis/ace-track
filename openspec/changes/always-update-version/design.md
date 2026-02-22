## Context

The AceTrack volleyball application is a PWA built with React, TypeScript, and Vite. Currently, version numbers in package.json and metadata.json are manually updated, which leads to inconsistencies and stale deployments. Users don't receive updates because the service worker caches the old version, and there's no mechanism to force or notify about updates.

Current constraints:
- Version is stored in package.json and metadata.json
- Build process uses Vite with basic configuration
- Service worker (sw.js) handles caching but lacks update detection
- No automated version validation exists

## Goals / Non-Goals

**Goals:**
1. Automatically increment version numbers during build process
2. Validate that version has been incremented before allowing deployment
3. Display current version in UI for transparency
4. Enhance service worker to detect and notify about updates
5. Prevent deployment of builds with unchanged version numbers

**Non-Goals:**
1. Complex semantic versioning rules (simple patch increments only)
2. Version history tracking or changelog generation
3. Multi-environment version management (dev/staging/prod)
4. Rollback capabilities for version increments

## Decisions

1. **Version bumping approach**: Use npm version patch during build process
   - Rationale: Simple, standard approach that works with npm ecosystem
   - Alternative: Custom script to parse and increment version - more complex

2. **Validation timing**: Pre-build validation using git history comparison
   - Rationale: Catch issues before build starts, preventing wasted CI time
   - Alternative: Post-build validation - less efficient

3. **Version storage**: Keep version in package.json as source of truth, sync to metadata.json, App.tsx, and service worker
   - Rationale: package.json is standard for npm projects, App.tsx and service worker need version for UI display and cache busting
   - Alternative: Separate version file - adds complexity

4. **UI display**: Add version to application footer
   - Rationale: Non-intrusive, always visible location
   - Alternative: Settings page only - less discoverable

5. **Update detection**: Enhance existing service worker with version-based cache busting
   - Rationale: Leverages existing PWA infrastructure
   - Alternative: Complete service worker rewrite - higher risk

## Risks / Trade-offs

**Risks:**
1. **Build failures due to version validation** → Mitigation: Clear error messages with instructions
2. **Accidental version increments in development** → Mitigation: Only increment in production builds
3. **Service worker update conflicts** → Mitigation: Graceful fallback to manual refresh
4. **Git history dependency for validation** → Mitigation: Fallback to file comparison if git unavailable

**Trade-offs:**
1. **Simplicity vs. robustness**: Chose simple patch increments over semantic versioning
2. **Development friction vs. deployment safety**: Added validation may slow development but prevents stale deployments
3. **Automatic vs. manual**: Automatic versioning reduces human error but removes control
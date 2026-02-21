## Why

During local development, the service worker unconditionally caches application files, interfering with Vite's Hot Module Replacement (HMR) and causing developers to see stale code. This creates friction in the development workflow where manual cache clearing is required to see code changes, and masks actual network behavior testing.

## What Changes

- Add environment detection to conditionally register the service worker
- Skip service worker registration when running in development mode (`import.meta.env.DEV`)
- Maintain existing production behavior unchanged (caching, update prompts)
- No breaking changes to existing functionality

## Capabilities

### New Capabilities
- `service-worker-registration`: Defines how the application registers and manages service workers, including environment-based registration control, caching strategies, and update handling.

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- **Affected Code**: `App.tsx` service worker registration logic (lines 84-116)
- **Dependencies**: Uses Vite's `import.meta.env.DEV` environment variable
- **Testing**: Development workflow will no longer cache files; production behavior unchanged
- **Performance**: No performance impact in production; development mode avoids caching overhead
## Context

The AceTrack volleyball statistics application is built with React + TypeScript + Vite and uses a service worker for PWA capabilities. Currently, the service worker is unconditionally registered in `App.tsx` (lines 84-116), caching assets and enabling offline functionality. This caching interferes with Vite's Hot Module Replacement (HMR) during local development, requiring manual cache clearing to see code changes and masking network behavior testing.

The existing service worker (`public/sw.js`) implements:
- Install-time caching of core assets (`/`, `/index.html`, `/manifest.json`)
- Cache-first with network fallback for GET requests
- Update prompting for new versions

## Goals / Non-Goals

**Goals:**
- Prevent service worker registration during local development to avoid caching interference
- Maintain identical production behavior (caching, update prompts)
- Use Vite's environment detection (`import.meta.env.DEV`) for mode determination
- Zero impact on existing production functionality

**Non-Goals:**
- Modifying the service worker caching strategy
- Changing PWA update behavior
- Adding development-specific service worker logic
- Supporting other build tools or bundlers

## Decisions

### 1. Environment Detection via `import.meta.env.DEV`
**Decision**: Use Vite's built-in `import.meta.env.DEV` flag to detect development mode.
**Rationale**: 
- Vite automatically sets this flag during `npm run dev` (`true`) and build (`false`)
- No need for custom environment variable configuration
- Aligns with Vite's ecosystem and HMR integration
- Simpler than checking `window.location.hostname` or custom flags

**Alternative Considered**: Checking `window.location.hostname` for localhost/127.0.0.1.
**Rejected**: Less reliable (different dev server hosts), doesn't align with Vite's mode concept.

### 2. Conditional Registration in App.tsx
**Decision**: Add environment check at the beginning of the existing service worker registration `useEffect`.
**Rationale**:
- Minimal code change (2-3 lines)
- Leverages existing registration logic for production
- Clear separation of concerns (environment check before registration)
- Easy to test and reason about

**Alternative Considered**: Creating a separate service worker registration hook.
**Rejected**: Unnecessary abstraction for a simple conditional check.

### 3. Skip Registration (Not Unregister) in Development
**Decision**: Skip registration entirely rather than registering a no-op service worker.
**Rationale**:
- No service worker means no caching interference with HMR
- Simpler implementation (early return vs. different SW logic)
- No need to handle unregistration of previously registered workers

**Alternative Considered**: Register a development-mode service worker that bypasses caching.
**Rejected**: Adds complexity, still registers a service worker which could interfere with HMR.

### 4. No Automatic Unregistration of Existing Workers
**Decision**: Do not automatically unregister existing service workers during development.
**Rationale**:
- Developers can manually unregister via browser dev tools if needed
- Avoiding unexpected behavior during development
- Simpler implementation focus on preventing new registrations

**Alternative Considered**: Adding development-time unregistration logic.
**Rejected**: Edge case that adds complexity; developers can handle manually if needed.

## Risks / Trade-offs

**Risk**: `import.meta.env.DEV` may not be available in certain build configurations.
- **Mitigation**: Vite guarantees this variable; TypeScript types confirm availability.

**Risk**: Developers running production build locally (`npm run preview`) will still get service worker registration.
- **Mitigation**: This is correct behavior for testing production builds; developers should use `npm run dev` for development.

**Risk**: Existing registered service workers may persist across development sessions.
- **Mitigation**: Developers can use browser dev tools (Application → Service Workers) to unregister.

**Trade-off**: Development mode loses ability to test PWA update flow.
- **Acceptance**: PWA update testing can be done with production builds; development focus is on code changes.

## Migration Plan

1. **Implementation**: Modify `App.tsx` to add environment check before service worker registration.
2. **Testing**:
   - Verify service worker not registered when running `npm run dev`
   - Verify HMR works without cache interference
   - Verify service worker registered when running `npm run build && npm run preview`
3. **Deployment**: Single-file change with no breaking changes; can be deployed anytime.
4. **Rollback**: Revert the conditional check if issues arise.

## Open Questions

None - the approach is straightforward with minimal unknowns.
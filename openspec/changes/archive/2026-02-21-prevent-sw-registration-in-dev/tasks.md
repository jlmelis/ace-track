## 1. Implementation

- [x] 1.1 Add environment import check to App.tsx
  - Import `import.meta.env` if not already available
  - Add type declaration for Vite environment variables if needed

- [x] 1.2 Modify service worker registration useEffect in App.tsx
  - Add conditional check at beginning of useEffect (lines 84-116)
  - Skip registration when `import.meta.env.DEV` is true
  - Add console log for development mode indication (optional)

- [x] 1.3 Verify TypeScript compilation
  - Run `npm run build` to ensure no TypeScript errors
  - Confirm `import.meta.env.DEV` is properly typed

## 2. Testing

- [x] 2.1 Test development mode behavior
  - Start development server with `npm run dev`
  - Open browser dev tools → Application → Service Workers
  - Verify no service worker is registered
  - Make code change and verify HMR updates immediately without cache clearing

- [x] 2.2 Test production build behavior  
  - Build production bundle with `npm run build`
  - Preview production build with `npm run preview`
  - Verify service worker is registered at `/sw.js`
  - Verify caching works (offline mode available)

- [x] 2.3 Test update prompt functionality
  - With production build running, modify service worker version in `public/sw.js`
  - Trigger service worker update and verify update prompt appears
  - Test "Reload" button functionality

## 3. Verification

- [x] 3.1 Verify no breaking changes
  - Ensure all existing functionality works in production mode
  - Test PWA installation, offline usage, update prompts
  - Confirm no console errors in development or production

- [x] 3.2 Document development workflow change
  - Update README if needed to mention service worker behavior in dev mode
  - Add note about clearing existing service workers if previously registered

- [x] 3.3 Clean up any existing registered service workers
  - Use browser dev tools to unregister any previously registered service workers
  - Test fresh development session with clean state
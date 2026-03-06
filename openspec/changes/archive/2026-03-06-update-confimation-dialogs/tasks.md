## 1. Setup

- [x] 1.1 Add Shadcn `AlertDialog` primitive if not already fully integrated
- [x] 1.2 Add Shadcn `Sonner` primitive for alerts without confirmation

## 2. Core Implementation

- [x] 2.1 Refactor `views/ProfileSettings.tsx` to use `AlertDialog` instead of `window.confirm` for resetting data/profiles
- [x] 2.2 Refactor `App.tsx` or its children to replace generic `confirm` behavior (e.g. deleting events)
- [x] 2.3 Refactor `hooks/useTournamentExport.ts` to replace `window.alert` with Shadcn `Sonner` message

## 3. Verification

- [x] 3.1 Verify data deletion and resetting flows work correctly with the new asynchronous dialogs
- [x] 3.2 Verify application builds without errors (`npm run build`)

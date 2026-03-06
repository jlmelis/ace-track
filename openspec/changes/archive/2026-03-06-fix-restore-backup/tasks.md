## 1. Core Database Utilities

- [x] 1.1 Update `exportData` in `src/db.ts` (or equivalent database utility) to serialize all IndexedDB object stores (events, matches, stats, settings, etc.) into the exported JSON object.
- [x] 1.2 Implement `importData` or `restoreBackup` in `src/db.ts` to take a parsed JSON backup object, validate its structure, and atomically clear and repopulate all object stores using a `readwrite` transaction.

## 2. CSV Parsing Logic

- [x] 2.1 Create a utility function `parseEventsCsv` to read the exported AceTrack CSV format and extract valid `Event` objects.
- [x] 2.2 Implement `importEventsFromCsv` in `src/db.ts` that takes an array of parsed `Event` objects and upserts them into the `events` store.

## 3. UI Integration

- [x] 3.1 Update the Settings/Dashboard view's Backup button to use the new comprehensive export logic and prompt the user with the generated JSON file.
- [x] 3.2 Update the Restore button/flow to accept a JSON file, parse it, pass it to the new atomic restore utility, and handle success/error states (e.g., showing a toast and prompting a reload).
- [x] 3.3 Add a new "Import Events from CSV" button in the Settings/Dashboard view, implement the file picker, pass the file to the CSV parser, and handle the import UI flow.

## 4. Verification

- [x] 4.1 Verify that a backup JSON file contains all stores.
- [x] 4.2 Verify that restoring an invalid file fails gracefully without corrupting existing data.
- [x] 4.3 Verify that a valid JSON restore completely replaces the data and reflects in the UI.
- [x] 4.4 Verify that importing events from a CSV adds the missing events to the UI list and updates existing ones if IDs match.

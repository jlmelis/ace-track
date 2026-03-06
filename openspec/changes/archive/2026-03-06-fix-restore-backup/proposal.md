## Why

The current backup and restore functionality is broken. Backups do not capture all necessary data (missing some stores/tables), and the restore process fails completely, preventing users from recovering their data. Furthermore, because previous backups were incomplete, we also need a way to restore events directly from exported CSV files to ensure users don't lose data.

## What Changes

- Fix the IndexedDB backup logic to ensure all object stores are properly serialized and included in the export.
- Fix the restore logic to correctly parse the backup file and populate all stores.
- **NEW**: Add a feature to import/restore events specifically from exported CSV files to recover data that was missed by previous incomplete JSON backups.

## Capabilities

### New Capabilities
- `data-backup-restore`: Defines the requirements for reliably exporting and importing the complete application state (all IndexedDB stores) to/from JSON.
- `csv-event-import`: Defines the requirements for parsing and importing events from existing CSV export files as a fallback data recovery method.

### Modified Capabilities

## Impact

- Database utilities (`db.ts` or backup/restore helpers)
- Settings/Dashboard UI where Backup, Restore, and Import actions are triggered
- File parsing logic for both JSON backups and CSV exports

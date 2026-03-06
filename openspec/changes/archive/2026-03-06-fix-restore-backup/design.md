## Context

The current local-first PWA uses IndexedDB (via `db.ts`) for data persistence. The existing backup and restore feature serialized the IndexedDB data into a JSON file for the user to download and, ideally, restore later. However, this implementation is flawed: backups fail to capture all necessary tables/object stores, and the restore process is entirely broken, preventing data recovery. 

Additionally, because previous backups were incomplete, users are at risk of losing their created events. A side-effect is that some users have event data trapped in CSV review exports. We need a fallback mechanism to re-import event records exclusively from these exported CSVs.

## Goals / Non-Goals

**Goals:**
- Correctly serialize and export all relevant IndexedDB stores in the JSON backup.
- Safely parse and restore data from JSON backups, replacing or merging existing IndexedDB records.
- Implement a CSV parser and import pipeline specifically for recovering "Event" records from CSV exports.

**Non-Goals:**
- Implementing cloud or automatic syncing (we are strictly local-first).
- Supporting generic CSV imports for records other than Events.
- Live merging with remote databases.

## Decisions

- **Full Data Replacement on Restore**: When restoring from a JSON backup, we will clear existing stores and populate them completely from the backup file to avoid complex merging logic, as the backup represents a monolithic state.
- **CSV Event Import**: We will use a lightweight parsing logic (or an existing library if available, such as `papaparse` if already in the project, otherwise simple regex/split) to parse the CSV. If an event ID already exists in the database, we will prompt the user or overwrite it as a basic conflict resolution. Given it's a fallback recovery mechanism, we will default to overwriting/upserting based on the CSV data.
- **IndexedDB Transactions**: We will utilize robust `readwrite` transactions across all affected stores to ensure the restore process is atomic. If parsing fails halfway or a store fails to write, the transaction should abort, leaving the user with their previous state, preventing partial data corruption.

## Risks / Trade-offs

- [Risk] **Restore process corrupts existing data on failure** → We will mitigate this by reading the entire JSON/CSV into memory, validating its structure, and then performing the IndexedDB writes within a single atomic transaction.
- [Risk] **Large backups crashing the browser** → AceTrack data sizes are generally small (text/stats). We will monitor memory usage, but for typical use cases, a full memory read is acceptable and limits complexity.
- [Risk] **CSV format changes breaking import** → The CSV importer will be designed to handle the specific format exported by our own app. We'll add validation to check for expected column headers before proceeding with the import to avoid bad data entry.

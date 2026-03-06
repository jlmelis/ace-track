## ADDED Requirements

### Requirement: Complete Database Backup
The system MUST serialize and export all IndexedDB object stores containing user data into a single, valid JSON file.

#### Scenario: User initiates a backup
- **WHEN** the user triggers the backup action from the settings/dashboard
- **THEN** the system generates a JSON file containing complete data from all active object stores (e.g., events, matches, stats, settings).
- **THEN** the user is prompted to download the specific JSON file (e.g., `acetrack-backup-<date>.json`).

### Requirement: Atomic Database Restore
The system MUST parse a provided JSON backup file and atomically restore the IndexedDB state, completely replacing the existing data with the contents of the backup.

#### Scenario: User restores a valid backup
- **WHEN** the user uploads a valid AceTrack JSON backup file
- **THEN** the system validates the file structure.
- **THEN** the system atomically clears the current database and imports all object stores from the file.
- **THEN** the application reflects the restored state without requiring a manual refresh (or prompts to reload).

#### Scenario: User uploads an invalid file for restore
- **WHEN** the user uploads a corrupted, improperly formatted, or non-JSON file for restore
- **THEN** the system rejects the file.
- **THEN** no changes are made to the existing IndexedDB data.
- **THEN** the system displays an error message indicating the file is invalid.

## ADDED Requirements

### Requirement: CSV Event Import Parsing
The system MUST be able to parse an AceTrack-generated CSV file and extract `Event` records specifically to support data recovery from incomplete JSON backups.

#### Scenario: User imports a valid CSV for events
- **WHEN** the user uploads a CSV file containing event data (matching the app's export format)
- **THEN** the system successfully parses the rows into Event objects.
- **THEN** the system upserts (inserts or updates based on existing ID) these events into the IndexedDB `events` store.
- **THEN** the system notifies the user of the number of events successfully imported.

#### Scenario: User imports an invalid CSV
- **WHEN** the user uploads a CSV that does not contain the expected headers or data format for events
- **THEN** the system aborts the import before writing to the database.
- **THEN** the system alerts the user that the CSV format is unsupported or invalid.

## ADDED Requirements

### Requirement: Version display in UI
The application SHALL display the current version number to users.

#### Scenario: Version visible in footer
- **WHEN** user views any page
- **THEN** the current version number is displayed in the footer

#### Scenario: Version format display
- **WHEN** version is displayed
- **THEN** it shows in format "vX.Y.Z" (e.g., v1.2.3)

### Requirement: Service worker update detection
The service worker SHALL detect when a new version is available and notify users.

#### Scenario: New version detection
- **WHEN** a new version is deployed
- **THEN** the service worker detects the version change

#### Scenario: Update notification
- **WHEN** new version is detected
- **THEN** user is notified with an update prompt

#### Scenario: Cache busting on version change
- **WHEN** version changes
- **THEN** service worker cache is invalidated for new resources

### Requirement: Manual update triggering
Users SHALL be able to manually trigger updates when notified.

#### Scenario: Update acceptance
- **WHEN** user accepts update notification
- **THEN** page reloads with new version

#### Scenario: Update deferral
- **WHEN** user defers update notification
- **THEN** notification persists for later action
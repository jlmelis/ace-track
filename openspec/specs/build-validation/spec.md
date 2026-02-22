## ADDED Requirements

### Requirement: Pre-build version check
The build process SHALL validate version increment before starting compilation.

#### Scenario: Version check execution
- **WHEN** build command is executed
- **THEN** version validation runs before any compilation

#### Scenario: Validation failure
- **WHEN** version validation fails
- **THEN** build exits with non-zero code and error message

#### Scenario: Validation success
- **WHEN** version validation passes
- **THEN** build proceeds to compilation phase

### Requirement: Git history comparison
The validation SHALL compare current version with previous commit's version.

#### Scenario: Git available
- **WHEN** git is available in build environment
- **THEN** validation uses git history to compare versions

#### Scenario: Git unavailable fallback
- **WHEN** git is not available
- **THEN** validation falls back to file comparison with previous build artifact

### Requirement: Clear error messaging
Validation failures SHALL provide clear, actionable error messages.

#### Scenario: Version unchanged error
- **WHEN** version hasn't changed
- **THEN** error message explains how to increment version

#### Scenario: Version format error
- **WHEN** version format is invalid
- **THEN** error message shows expected format

### Requirement: Development mode bypass
Version validation SHALL be bypassed in development mode.

#### Scenario: Development build
- **WHEN** running development server
- **THEN** version validation is skipped

#### Scenario: Production build
- **WHEN** running production build
- **THEN** version validation is enforced
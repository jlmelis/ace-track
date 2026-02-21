## ADDED Requirements

### Requirement: Conditional service worker registration based on environment
The system SHALL detect whether it is running in development or production mode and conditionally register service workers accordingly.

#### Scenario: Service worker registration skipped in development mode
- **WHEN** the application runs in development mode (`import.meta.env.DEV` is true)
- **THEN** the service worker registration SHALL be skipped
- **AND** no service worker SHALL be registered or activated

#### Scenario: Service worker registration proceeds in production mode  
- **WHEN** the application runs in production mode (`import.meta.env.DEV` is false)
- **THEN** the service worker registration SHALL proceed normally
- **AND** the existing service worker at `/sw.js` SHALL be registered

### Requirement: Unchanged production service worker behavior
The system SHALL maintain existing service worker caching and update behavior unchanged in production mode.

#### Scenario: Production caching strategy unchanged
- **WHEN** the service worker is registered in production mode
- **THEN** the caching strategy defined in `/sw.js` SHALL remain unchanged
- **AND** assets SHALL continue to be cached according to existing logic

#### Scenario: Production update prompts unchanged
- **WHEN** a new service worker version is available in production
- **THEN** the update prompt functionality SHALL remain unchanged
- **AND** users SHALL continue to receive update notifications

### Requirement: Development workflow compatibility
The system SHALL not interfere with Vite's Hot Module Replacement (HMR) during development.

#### Scenario: HMR works without cache interference
- **WHEN** code changes are made during development
- **THEN** Vite's HMR SHALL reflect changes immediately without requiring cache clearing
- **AND** no cached service worker assets SHALL mask code changes
# event-detail-layout Specification

## Purpose
TBD - created by archiving change refactor-event-detail. Update Purpose after archive.
## Requirements
### Requirement: Layout Hierarchy
The system SHALL display the Event Detail page with a specific hierarchical component layout, prioritizing actionable items over summary data.

#### Scenario: User views an event with matches
- **WHEN** a user navigates to an event detail page that contains existing matches
- **THEN** the system SHALL display the header at the top
- **THEN** the system SHALL display the Matches list directly below the header
- **THEN** the system SHALL display the Tournament Stats section below the Matches list

#### Scenario: User views an empty event
- **WHEN** a user navigates to an event detail page with no existing matches
- **THEN** the system SHALL display the header
- **THEN** the system SHALL display the empty matches state (call to action to add a match)
- **THEN** the system SHALL NOT display the Tournament Stats section (as there are zero stats)

### Requirement: Component Encapsulation
The system SHALL encapsulate distinct functional areas of the Event Detail page into their own discrete components to maintain code health.

#### Scenario: Isolated rendering of components
- **WHEN** the Event Detail page renders
- **THEN** the application SHALL utilize a separate `MatchList` component for the matches list
- **THEN** the application SHALL utilize a separate `TournamentStats` component for the stats section
- **THEN** the application SHALL utilize a separate `EventHeader` component for the title, date, and export actions


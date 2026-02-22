# Tournament Stats

## Purpose

Define tournament-level statistics aggregation and display for the AceTrack volleyball statistics tracker, providing rollup views of player performance across multiple matches.

## MODIFIED Requirements

### Requirement: Tournament stats display
The system SHALL display tournament-level statistics in the EventDetail view, providing users with an overview of performance across the entire tournament.

#### Scenario: Shows tournament stats section
- **WHEN** a user views a tournament (EventDetail)
- **THEN** the system SHALL display a "Tournament Stats" section below the matches list

#### Scenario: Displays key metrics
- **WHEN** tournament stats are available and expanded
- **THEN** the system SHALL display totals for each stat category (Attacking, Serving, Defense, Setting, Blocking) similar to match-level display

#### Scenario: Shows efficiency score
- **WHEN** attacking stats are present and expanded
- **THEN** the system SHALL display tournament hitting percentage with formatting consistent with match-level efficiency display

#### Scenario: Updates in real-time
- **WHEN** stats are recorded or matches are added/removed from the tournament
- **THEN** the tournament stats display SHALL update immediately to reflect changes

#### Scenario: Collapsed by default
- **WHEN** a user views a tournament (EventDetail)
- **THEN** the tournament stats section SHALL be collapsed by default to save vertical screen space

#### Scenario: Toggle expansion
- **WHEN** the user interacts with the tournament stats header
- **THEN** the system SHALL toggle the visibility of the detailed metrics and efficiency scores

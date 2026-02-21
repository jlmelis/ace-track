# Tournament Stats

## Purpose

Define tournament-level statistics aggregation and display for the AceTrack volleyball statistics tracker, providing rollup views of player performance across multiple matches.

## Requirements

### Requirement: Tournament statistics aggregation
The system SHALL aggregate statistics across all matches within a tournament, calculating totals for each tracked stat and computing tournament-level efficiencies.

#### Scenario: Aggregates stats from multiple matches
- **WHEN** a tournament contains matches with recorded stats
- **THEN** the system SHALL sum the count of each stat ID across all sets in all matches

#### Scenario: Calculates hitting percentage across tournament
- **WHEN** a tournament has kills, attack errors, and total attack attempts recorded
- **THEN** the system SHALL compute hitting percentage as (kills - attack errors) / total attacks, using aggregated totals

#### Scenario: Handles empty tournament
- **WHEN** a tournament has no matches or no recorded stats
- **THEN** the system SHALL return zero for all stat totals and efficiencies

### Requirement: Tournament stats display
The system SHALL display tournament-level statistics in the EventDetail view, providing users with an overview of performance across the entire tournament.

#### Scenario: Shows tournament stats section
- **WHEN** a user views a tournament (EventDetail)
- **THEN** the system SHALL display a "Tournament Stats" section above the matches list

#### Scenario: Displays key metrics
- **WHEN** tournament stats are available
- **THEN** the system SHALL display totals for each stat category (Attacking, Serving, Defense, Setting, Blocking) similar to match-level display

#### Scenario: Shows efficiency score
- **WHEN** attacking stats are present
- **THEN** the system SHALL display tournament hitting percentage with formatting consistent with match-level efficiency display

#### Scenario: Updates in real-time
- **WHEN** stats are recorded or matches are added/removed from the tournament
- **THEN** the tournament stats display SHALL update immediately to reflect changes

### Requirement: Tournament stats export
The system SHALL include tournament-level statistics in the CSV export functionality available from the EventDetail view.

#### Scenario: Export includes tournament totals
- **WHEN** a user exports tournament data via the "REPORT" button
- **THEN** the CSV file SHALL include a "Tournament Totals" section with aggregated statistics

#### Scenario: Export maintains existing match detail
- **WHEN** a user exports tournament data
- **THEN** the CSV file SHALL continue to include all match and set-level detail as currently exported

### Requirement: Performance and data integrity
The system SHALL ensure tournament stats aggregation does not negatively impact application performance or data integrity.

#### Scenario: Efficient aggregation
- **WHEN** a tournament contains many matches (e.g., 50+)
- **THEN** aggregation SHALL complete within 100ms to maintain responsive UI

#### Scenario: Consistent calculations
- **WHEN** stats are aggregated at tournament level
- **THEN** the calculations SHALL match manual summation of match-level totals
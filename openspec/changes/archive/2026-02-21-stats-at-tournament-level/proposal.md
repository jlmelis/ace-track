## Why

Currently stats are only shown at the match level, requiring users to navigate into each match to see performance metrics. This makes it difficult to get an overall view of player performance across an entire tournament. Users need a rollup view of statistics at the tournament level to quickly assess overall performance trends and efficiency across multiple matches.

## What Changes

- Add tournament-level stats aggregation that calculates totals and efficiencies across all matches in a tournament
- Add tournament stats summary UI to the EventDetail view showing key metrics (kills, errors, hitting percentage, etc.)
- Add ability to export tournament-level statistics in CSV format alongside existing match-level export
- Ensure tournament stats update in real-time as matches are tracked
- No breaking changes to existing match or set tracking functionality

## Capabilities

### New Capabilities
- `tournament-stats`: Aggregation and display of statistics at tournament level. Includes calculation of totals, efficiencies, and visualization in the EventDetail view.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- **Frontend**: Update EventDetail component to include stats summary section, add aggregation logic in types/utilities
- **Data Model**: No schema changes required; uses existing Event/Match/Set data structure
- **Performance**: Aggregation runs client-side; should be efficient for typical tournament sizes (<50 matches)
- **User Experience**: Provides immediate value for coaches/parents to assess overall tournament performance
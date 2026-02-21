## Context

AceTrack is a volleyball statistics tracking PWA that records player performance at set, match, and tournament levels. Currently, statistics are aggregated and displayed at the match level (via MatchDetail component) but there is no rollup view at the tournament level. Users must navigate into each match to see performance metrics, making it difficult to assess overall tournament performance.

The data model already supports tournaments (Event) containing matches (Match) containing sets (Set) containing stat logs (StatLog). All data is stored client-side in IndexedDB via local-first architecture.

## Goals / Non-Goals

**Goals:**
- Aggregate statistics across all matches in a tournament
- Display tournament-level totals and efficiencies in the EventDetail view
- Provide tournament-level CSV export alongside existing match-level export
- Maintain real-time updates as matches are tracked
- Reuse existing stat definitions and UI patterns for consistency

**Non-Goals:**
- Changing the underlying data model or storage schema
- Adding new stat types or categories
- Tournament-level stat editing (stats are recorded at set level only)
- Advanced analytics or visualization (charts, graphs)
- Server-side aggregation or persistence

## Decisions

**1. Client-side aggregation**
- **Decision**: Perform aggregation client-side in the EventDetail component
- **Rationale**: Data is stored locally, tournament sizes are typically small (<50 matches), and computation is trivial. Avoids complexity of server-side logic or additional storage.
- **Alternative**: Pre-compute and cache aggregates in IndexedDB – rejected due to added complexity for minimal performance gain.

**2. Aggregation utility function**
- **Decision**: Create a reusable `aggregateTournamentStats` function that takes an Event and returns totals by stat ID
- **Rationale**: Encapsulates aggregation logic, promotes reuse, and enables testing. Similar pattern to `getTotals` in MatchDetail.
- **Alternative**: Inline aggregation in EventDetail component – rejected due to poor separation of concerns.

**3. UI placement and design**
- **Decision**: Add a "Tournament Stats" section above the matches list in EventDetail, mimicking the "Full Match Summary" from MatchDetail
- **Rationale**: Consistent user experience, natural hierarchy (tournament → matches → sets). Users expect tournament stats before drilling into matches.
- **Alternative**: Separate tab or modal – rejected as it adds navigation overhead for core functionality.

**4. Export enhancement**
- **Decision**: Extend existing CSV export in EventDetail to include tournament totals as a separate sheet or summary row
- **Rationale**: Users already export tournament data; adding totals provides immediate value without changing workflow.
- **Alternative**: Separate export button – rejected to avoid UI clutter.

**5. Efficiency calculations**
- **Decision**: Reuse same efficiency formulas as match level (hitting percentage = (kills - errors) / total attacks) aggregated across tournament
- **Rationale**: Consistency with existing metrics; users understand these calculations.
- **Alternative**: New tournament-specific metrics – rejected as out of scope.

## Risks / Trade-offs

**Performance for large tournaments**
- **Risk**: Tournaments with hundreds of matches/sets could cause UI lag during aggregation
- **Mitigation**: Aggregation runs only when EventDetail renders; typical usage is <20 matches. Can add memoization if needed.

**Code duplication**
- **Risk**: Aggregation logic may duplicate between match and tournament levels
- **Mitigation**: Extract shared logic into utility functions; keep DRY.

**UI complexity**
- **Risk**: EventDetail may become crowded with stats section
- **Mitigation**: Use collapsible section or progressive disclosure; start with simple summary.

**Real‑time sync**
- **Risk**: Tournament totals must update when matches are added/deleted or stats recorded
- **Mitigation**: React reactivity ensures re‑render when data changes; aggregation runs on each render.

**Export format clarity**
- **Risk**: Combining match‑detail and tournament totals in one CSV may confuse users
- **Mitigation**: Add clear headers and separate sections in CSV; consider adding a second sheet (Excel) but keep simple for MVP.
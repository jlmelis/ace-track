## 1. Aggregation utilities

- [x] 1.1 Add `aggregateTournamentStats` function to types.ts that takes an Event and returns totals by stat ID
- [x] 1.2 Add `calculateTournamentEfficiencies` function that computes hitting percentage and other metrics from aggregated totals
- [x] 1.3 Add TypeScript interfaces for aggregated stats result (TournamentStats)
- [x] 1.4 Ensure functions handle empty tournaments and missing stats gracefully

## 2. UI components

- [x] 2.1 Update EventDetail.tsx to import aggregation utilities
- [x] 2.2 Add tournament stats calculation in EventDetail component (useMemo)
- [x] 2.3 Create TournamentStatsSection component (or inline JSX) to display aggregated stats
- [x] 2.4 Style tournament stats section to match match-level summary design
- [x] 2.5 Add collapsible/expandable UI for tournament stats (optional enhancement)
- [x] 2.6 Ensure real-time updates when matches/stats change

## 3. Export enhancement

- [x] 3.1 Extend existing CSV export function in EventDetail to include tournament totals
- [x] 3.2 Add "Tournament Totals" section to CSV output with aggregated stats
- [x] 3.3 Maintain existing match/set detail export unchanged
- [x] 3.4 Test CSV export includes both tournament totals and match detail

## 4. Testing and verification

- [x] 4.1 Verify aggregation calculates correct totals across multiple matches
- [x] 4.2 Verify UI displays correct numbers and updates when data changes
- [x] 4.3 Verify CSV export contains tournament totals section
- [x] 4.4 Test edge cases: empty tournament, single match, many matches
- [x] 4.5 Ensure no regression in existing match and set tracking functionality
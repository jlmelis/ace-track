## Context

The Event Detail page (`views/EventDetail.tsx`) is currently a monolithic component of ~300 lines of code. It handles state, complex data aggregation (tournament totals and efficiencies), CSV export logic, and the entirety of the layout for both the match list and the tournament stats. 
Currently, the Tournament Stats are displayed at the very top, prioritizing global metrics over the immediate actions users need (e.g. creating a new match or selecting an existing match to track stats).

## Goals / Non-Goals

**Goals:**
- Extract key UI sections (TournamentStats, MatchList, EventHeader) into smaller, more maintainable components.
- Move business logic (like CSV export and data aggregations) into custom hooks.
- Re-order the layout to show the Matches section first, and Tournament Stats second.
- Ensure Tournament Stats is collapsed by default.

**Non-Goals:**
- We are *not* changing the underlying data schema (`Event`, `Match`, `Set`, `StatDefinition`).
- We are *not* changing any routing or URL structures.
- We are *not* adding new stats functionality outside of UI reorganization.

## Decisions

1. **Component Extraction**:
   - `components/EventHeader.tsx`: Will handle the title, date formatting, and the Export Report button.
   - `components/TournamentStats.tsx`: Will take the `tournamentTotals`, `efficiencies`, and `allStats`, but also encapsulate the collapse/expand state internally to simplify the parent.
   - `components/MatchList.tsx`: Will handle displaying the empty state, sorting, and listing matches.
   - `components/CreateMatchForm.tsx`: Will handle the "New Match" form state (`opponent`, `matchDate`) and submission logic.

2. **Custom Hooks**:
   - `hooks/useTournamentExport.ts`: Will encapsulate the large chunk of logic that formats CSV strings and triggers the browser download. This reduces noise in the main `EventDetail` component.

3. **Layout Order**:
   The `EventDetail` component will compose these new components, placing `MatchList` strictly above `TournamentStats`.

## Risks / Trade-offs

- **Risk**: Refactoring the CSV export logic into a hook might lose access to closure variables (like `allStats`). 
  -> **Mitigation**: The hook will explicitly accept `event` and `allStats` as arguments.
- **Risk**: Over-fragmentation of components might make tracing state passed via props annoying.
  -> **Mitigation**: We will keep the `EventDetail.tsx` as the "Smart" container component that controls the primary state (`isAdding`, etc.) and data aggregations, passing them down cleanly to "Dumb" presentation components.

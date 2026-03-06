## Context

The application currently displays events and tournaments in the order they are stored or fetched, which depends heavily on the IndexedDB structure and the order of insertion. Users need to see the most recent events first to quickly access their active or recent games. AceTrack is an offline-first PWA using local state and IndexedDB (via `db.ts`).

## Goals / Non-Goals

**Goals:**
- Ensure that lists of events and tournaments presented to the user are consistently ordered from newest to oldest.

**Non-Goals:**
- Refactoring the entire IndexedDB schema.
- Implementing UI toggles for custom sorting (e.g., sort by name, oldest to newest). We are only changing the default sort to newest-first.

## Decisions

- **Sorting Location:** The sorting will happen in the data fetching logic (right after fetching in `db.ts` or React hooks/components). Filtering and sorting arrays in memory is acceptable given the expected data scale of events for a local PWA.
  - *Rationale*: Easy to implement and avoids complex IndexedDB migrations right now.
  - *Alternative*: Change the IndexedDB index to sort by date natively. This might require a database version bump and migration logic. We prefer sorting the fetched array in memory for simplicity. In-memory sorting of a typical user's events (dozens to hundreds) is negligible.

## Risks / Trade-offs

- **[Performance]** → In-memory sorting might become slower if the user has thousands of events. Mitigation: If profiling shows issues later, we can add a date-based sequence index to IndexedDB.
- **[Date Formats]** → Sorting strings incorrectly can lead to bugs. Mitigation: Ensure we convert dates to comparable numeric timestamps or sortable ISO strings for accurate chronological ordering.

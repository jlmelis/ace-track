## Why

The Event Detail page (`EventDetail.tsx`) currently contains all of its UI and logic—including tournament stats and match listing—in a single, monolithic component. This makes it difficult to maintain, read, and extend. Additionally, the user experience can be improved: matches should be presented first since they are the primary action items (especially mobile viewing), while tournament stats can be secondary and initially collapsed to save space. Refactoring this now will improve code health and align the UI with the preferred user flow.

## What Changes

- Extract the tournament stats section into its own dedicated component (e.g., `TournamentStats`).
- Extract the match list and "new match" form into its own component.
- Extract the Event Detail header/title area into a separate component.
- Reorder the layout in `EventDetail.tsx` so that the Match List appears *above* the Tournament Stats section.
- Modify the Tournament Stats section to be collapsed by default.
- Move complex data aggregations and state management into custom hooks where appropriate to keep the UI components clean.
- Ensure all styling and responsiveness are maintained during the extraction.

## Capabilities

### New Capabilities

- `event-detail-layout`: Defines the structural layout and component hierarchy of the Event Detail view, including the reordering of matches and stats.

### Modified Capabilities

- `tournament-stats`: The tournament stats display requirement is changing so that it is collapsed by default, and positioned below the matches list.

## Impact

- **Frontend**: Significant structural changes to `views/EventDetail.tsx`. Creation of new component files (e.g., `components/TournamentStats.tsx`, `components/MatchList.tsx`, `components/EventHeader.tsx`).
- **Data Model**: No schema or data changes are required.
- **Performance**: Should slightly improve render organization, though the actual DOM output remains largely similar.
- **User Experience**: Users will see matches immediately upon opening an event, reducing scrolling to find the primary call to action (adding or selecting a match).

## 1. Setup & Utilities

- [ ] 1.1 Create `src/hooks/useTournamentExport.ts` and extract CSV export logic.
- [ ] 1.2 Create `src/components/EventDetail` folder to house the new components.

## 2. Component Extraction

- [ ] 2.1 Create `EventHeader.tsx` (Back button, Title, Date, Export button).
- [ ] 2.2 Create `TournamentStats.tsx` component (Metrics display, Efficiency display, Expansion toggle state).
- [ ] 2.3 Create `CreateMatchForm.tsx` component for the "New Match" form.
- [ ] 2.4 Create `MatchList.tsx` component to handle empty state and the list of matches.

## 3. Layout Integration

- [ ] 3.1 Update `EventDetail.tsx` to import and compose `EventHeader`, `MatchList`, and `TournamentStats`.
- [ ] 3.2 Ensure the layout order inside `EventDetail.tsx` places the `MatchList` *above* `TournamentStats`.
- [ ] 3.3 Ensure `TournamentStats.tsx` controls its own collapsed/expanded state and defaults to collapsed.

## 4. Verification

- [ ] 4.1 Verify that the Event page matches list is fully functional (can add and delete matches).
- [ ] 4.2 Verify that the CSV Export functionality still works flawlessly.
- [ ] 4.3 Verify that expanding the Tournament Stats shows correct aggregations.

## Why

Currently, events and tournaments might not be displayed in a consistent or user-friendly order. Sorting them from newest to oldest ensures that the most recent and relevant events are always at the top of the list, improving navigation and the overall user experience.

## What Changes

- Update the fetching or display logic for events and tournaments to sort them descending by date (newest first).

## Capabilities

### New Capabilities
- `event-list-sorting`: Defines the sorting behavior for the display of events and tournaments, ensuring they appear newest to oldest.

### Modified Capabilities


## Impact

- The UI components responsible for rendering event and tournament lists (e.g., event lists or history views).
- Data fetching or state selectors that retrieve the lists of events from IndexedDB or the store.

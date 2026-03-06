# Confirmation Dialogs

## Purpose
Defines the requirements for confirming destructive actions across the application.

## Requirements

### Requirement: Destructive Action Confirmations
The system SHALL intercept user actions that lead to data loss or irreversible state changes with a confirmation dialog.
The system MUST NOT use native `window.confirm` or `window.alert` dialogs for these flows.

#### Scenario: User attempts to delete an event
- **WHEN** the user clicks the delete button for an event
- **THEN** a Shadcn `AlertDialog` is presented asking to confirm the deletion
- **WHEN** the user confirms the action
- **THEN** the event is permanently deleted and the dialog closes
- **WHEN** the user cancels the action
- **THEN** the dialog closes and no data is deleted

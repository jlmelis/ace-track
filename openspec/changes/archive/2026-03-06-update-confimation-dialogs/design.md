## Context

The application currently uses native browser dialogs (`window.alert`, `window.confirm`) for destructive actions like deleting events or resetting stats. These native dialogs are visually inconsistent with the rest of the application, which heavily utilizes Shadcn UI and a customized Tailwind CSS theme. We need to replace these with a custom Shadcn `AlertDialog` that fits our design system.

## Goals / Non-Goals

**Goals:**
- Replace all `window.confirm` and `window.alert` calls with a React-based Shadcn `AlertDialog` component.
- Ensure the new dialog system is easily reusable across views.
- Maintain WCAG accessibility standards provided by the Shadcn primitives.

**Non-Goals:**
- Introducing a complex global modal manager (we will stick to localized components to keep it simple).
- Redesigning other types of popups (e.g., drawers, tooltips) that don't involve alerts/confirmations.

## Decisions

- **Decision: Use localized state for Dialogs**
  We will use localized state within the components that trigger the dialogs (e.g., the Settings page or the Event Card).
  **Rationale**: Confirmations usually tightly couple with a specific action. Keeping the `AlertDialog` co-located with the trigger code is simpler and avoids the overhead of a React context for now.
  **Alternatives Considered**: Creating a global `DialogProvider` context. Deemed overkill for the current application scope.
- **Decision: Use Shadcn `AlertDialog` directly**
  **Rationale**: Provides a built-in accessible overlay tailored for destructive or important confirmations.

## Risks / Trade-offs

- [Risk] Asynchronous flow changes vs blocking `window.confirm` -> Mitigation: The new `AlertDialog` is asynchronous (requires state and callbacks). We must carefully refactor code that currently relies on the synchronous boolean return of `window.confirm` into a callback pattern.

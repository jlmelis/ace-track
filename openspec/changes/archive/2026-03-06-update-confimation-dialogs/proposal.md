## Why

Currently, the application uses standard browser alert and confirmation popups (`window.alert`, `window.confirm`). These native dialogs look out of place, disrupt the user experience, and do not fit within the application's overall design system. Using Shadcn UI dialog components will provide a polished, consistent, and on-brand experience that seamlessly integrates with our interface.

## What Changes

- Replace all instances of `window.confirm` with a custom Shadcn `AlertDialog` component.
- Replace all instances of `window.alert` with a custom Shadcn `AlertDialog` component (or `Toast` depending on context).
- Ensure the new dialogs support the application's offline-first PWA nature (no external dependencies required at runtime).
- Maintain existing functionality for actions that require user confirmation (e.g., deleting events, resetting data).

## Capabilities

### New Capabilities

- `confirmation-dialogs`: Add a centralized, reusable confirmation dialog system built with Shadcn UI to handle destructive or critical user actions seamlessly across the application.

### Modified Capabilities

- `ui-components`: Update the centralized UI components spec to include the new `AlertDialog` patterns and behaviors.

## Impact

- **UI Components**: Introduces the Shadcn `AlertDialog` component.
- **Views/Pages**: Any page or component currently relying on native alerts/confirms (like data deletion, event management, or settings) will be refactored to use the new React-based dialogs.
- **User Experience**: Drastic improvement in visual consistency and perceived quality.

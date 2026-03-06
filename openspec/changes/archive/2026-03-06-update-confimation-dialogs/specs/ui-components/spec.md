## ADDED Requirements

### Requirement: Use Shadcn AlertDialog over Native Dialogs
The application MUST NOT use native `window.alert` or `window.confirm` dialogs. Where an analog exists (such as confirmation before destructive actions), the application MUST utilize the Shadcn `AlertDialog` or `Toast` components.

#### Scenario: Developer implements a confirmation flow
- **WHEN** a developer implements an action requiring user confirmation
- **THEN** it must use the Shadcn `AlertDialog` component instead of `window.confirm`.

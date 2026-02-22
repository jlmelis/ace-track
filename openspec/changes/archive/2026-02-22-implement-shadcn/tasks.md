## 1. Setup and Tooling

- [x] 1.1 Install Shadcn UI dependencies (`npx shadcn@latest init`) and configure `components.json`
- [x] 1.2 Update Tailwind CSS configuration (`app.css` and `tailwind.config.js`) to integrate Shadcn CSS variables while preserving the existing brand colors
- [x] 1.3 Verify the application still builds and runs correctly with the new CSS configuration

## 2. Base Components Implementation

- [x] 2.1 Add Shadcn Button component (`npx shadcn@latest add button`)
- [x] 2.2 Add Shadcn Input component (`npx shadcn@latest add input`)
- [x] 2.3 Add Shadcn Dialog component (`npx shadcn@latest add dialog`)
- [x] 2.4 Add Shadcn Card component (`npx shadcn@latest add card`)
- [x] 2.5 Add Shadcn Label component (`npx shadcn@latest add label`)

## 3. UI Component Migration (Part 1 - Core Forms)

- [x] 3.1 Replace generic/custom buttons across the application with the Shadcn `Button` component, updating all variants
- [x] 3.2 Replace generic text inputs with the Shadcn `Input` component
- [x] 3.3 Ensure custom `className` props work correctly via `tailwind-merge` and `clsx` (the `cn` utility provided by Shadcn)
- [x] 3.4 Manually verify all modified form elements function correctly and look consistent across desktop and mobile

## 4. UI Component Migration (Part 2 - Layout & Modals)

- [x] 4.1 Replace generic card containers in roster/team views with the Shadcn `Card` component
- [x] 4.2 Replace existing custom modals/dialogs with the Shadcn `Dialog` component
- [x] 4.3 Manually verify modal functionality, accessibility focus trapping, and card layout integrity

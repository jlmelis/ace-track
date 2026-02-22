## 1. Setup and Tooling

- [ ] 1.1 Install Shadcn UI dependencies (`npx shadcn@latest init`) and configure `components.json`
- [ ] 1.2 Update Tailwind CSS configuration (`app.css` and `tailwind.config.js`) to integrate Shadcn CSS variables while preserving the existing brand colors
- [ ] 1.3 Verify the application still builds and runs correctly with the new CSS configuration

## 2. Base Components Implementation

- [ ] 2.1 Add Shadcn Button component (`npx shadcn@latest add button`)
- [ ] 2.2 Add Shadcn Input component (`npx shadcn@latest add input`)
- [ ] 2.3 Add Shadcn Dialog component (`npx shadcn@latest add dialog`)
- [ ] 2.4 Add Shadcn Card component (`npx shadcn@latest add card`)
- [ ] 2.5 Add Shadcn Label component (`npx shadcn@latest add label`)

## 3. UI Component Migration (Part 1 - Core Forms)

- [ ] 3.1 Replace generic/custom buttons across the application with the Shadcn `Button` component, updating all variants
- [ ] 3.2 Replace generic text inputs with the Shadcn `Input` component
- [ ] 3.3 Ensure custom `className` props work correctly via `tailwind-merge` and `clsx` (the `cn` utility provided by Shadcn)
- [ ] 3.4 Manually verify all modified form elements function correctly and look consistent across desktop and mobile

## 4. UI Component Migration (Part 2 - Layout & Modals)

- [ ] 4.1 Replace generic card containers in roster/team views with the Shadcn `Card` component
- [ ] 4.2 Replace existing custom modals/dialogs with the Shadcn `Dialog` component
- [ ] 4.3 Manually verify modal functionality, accessibility focus trapping, and card layout integrity

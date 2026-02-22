## Context

The AceTrack application currently uses custom-built or generic UI components styled with Tailwind CSS. As the application grows, maintaining a consistent, accessible, and high-quality UI becomes increasingly complex. Shadcn UI provides a set of highly customizable, accessible components built on top of Radix UI and styled with Tailwind CSS. Unlike typical component libraries, Shadcn UI installs the component source code directly into the project, allowing for complete control over the design and implementation while providing a solid foundation.

## Goals / Non-Goals

**Goals:**
- Integrate Shadcn UI into the existing Vite + React + Tailwind CSS stack.
- Configure `components.json` to manage Shadcn UI installations.
- Establish a pattern for replacing existing custom UI components with Shadcn UI equivalents (e.g., Button, Input, Card).
- Ensure the new components respect the existing brand color palette (`brand-primary`, `brand-neutral`, etc.).
- Maintain the offline-first PWA requirements.

**Non-Goals:**
- Rewriting the entire application logic.
- Introducing a new state management library (we will stick with React local state and IndexedDB).
- Changing the overall architecture of `/components` and `/views`.

## Decisions

- **Installation Method:** We will use the Shadcn UI CLI (`npx shadcn@latest add <component>`) to install components. This ensures we get the latest versions and properly structured code.
- **Component Placement:** Shadcn UI components will be placed in `components/ui/` by default, as is the standard Shadcn UI convention. This keeps them separate from our domain-specific components.
- **Styling Integration:** We will update our existing Tailwind CSS configuration (`tailwind.config.js` or `app.css`) to merge our existing brand colors with Shadcn's CSS variables, ensuring a seamless visual integration. We need to be careful to adapt Shadcn's default variables to our established theme.
- **Icons:** We will continue using `lucide-react` as it is the default icon set for Shadcn UI and is likely already in use or easy to adopt.

## Risks / Trade-offs

- [Risk] **CSS Variable Conflicts** -> **Mitigation**: Carefully review and merge Shadcn's default CSS variables with our existing `app.css` to avoid overriding our brand colors unintentionally.
- [Risk] **Bundle Size Increase** -> **Mitigation**: While Shadcn copies code, relying on Radix UI primitives might slightly increase the bundle size. However, the benefits in accessibility and development speed outweigh this. We will rely on Vite's tree-shaking capabilities.
- [Risk] **Inconsistent UI during migration** -> **Mitigation**: The migration will be done incrementally. We will start with base components (Button, Input) and gradually replace them across the app to minimize jarring visual differences.

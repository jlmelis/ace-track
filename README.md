<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sOnEiCn4u-kNG-rmw7as11ZrJAIbM4gR

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
 3. Run the app:
    `npm run dev`

## Development Notes

- Service worker registration is automatically skipped during development (`npm run dev`) to avoid caching interference with Hot Module Replacement.
- If you previously registered a service worker during development, you may need to unregister it via browser dev tools (Application → Service Workers).

## Version Management

AceTrack has automated version management to ensure PWA updates are properly recognized by users. See [docs/version-management.md](docs/version-management.md) for detailed documentation.

### Key Commands:
- `npm run build:prod` - Production build with version validation and automatic version bumping
- `npm run version:bump` - Manually bump version and synchronize all files
- `npm run version:validate` - Validate version without building

### Production Deployments:
Always use `npm run build:prod` for production deployments to ensure version numbers are incremented and synchronized across all files.

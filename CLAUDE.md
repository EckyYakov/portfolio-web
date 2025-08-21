# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking without emitting files

## Architecture Overview

This is a TypeScript-based command-line portfolio website with a neobrutalist design. The interface mimics a command-line environment where users navigate using `/` prefixed commands (e.g., `/help`, `/about`).

### Core Architecture

**Command System**: The heart of the application is a command processor that handles `/` prefixed commands. Commands are registered in `src/commands/index.ts` and each command returns either text or HTML content that replaces the current display.

**UI Flow**: Users type commands into an input field. As they type `/`, autocomplete shows all available commands. Arrow keys navigate suggestions, Enter selects and executes immediately.

**Content Display**: Unlike a traditional terminal, this doesn't scroll history. Each command execution replaces the content area entirely, using full-page scrolling for long content.

### Key Components

- **CommandProcessor** (`src/core/`): Handles command parsing, execution, and autocomplete suggestions. Enforces `/` prefix requirement.
- **Terminal** (`src/ui/Terminal.ts`): Manages the UI, input handling, and autocomplete interactions. Arrow keys control autocomplete navigation, not command history.
- **Autocomplete** (`src/ui/Autocomplete.ts`): Provides smart command suggestions with keyboard navigation. Enter key both selects and executes commands.
- **ContentLoader** (`src/core/ContentLoader.ts`): Loads content from JSON files in `content/` directory (resume, projects, blog manifest).
- **ThemeManager** (`src/ui/ThemeManager.ts`): Handles light/dark theme switching. Must be initialized early in `main.ts` to prevent theme loading issues.

### Content Structure

Portfolio content lives in `public/content/` directory as JSON files:
- `resume.json` - Professional experience and skills
- `projects.json` - Portfolio projects with metadata (if exists)
- `blog/manifest.json` - Blog post listings (content expansion ready)

**Important**: Content must be in `public/` folder to be included in build output. Fetch paths use `import.meta.env.BASE_URL` for proper deployment.

### Styling System

Uses CSS variables for theming with neobrutalist design principles:
- High contrast borders (4px solid)
- Box shadows (8px offset, no blur)
- Clean typography (Inter + Space Grotesk)
- No rounded corners or gradients

The content window has no height constraints - it uses natural page scrolling instead of container scrolling for better UX with long content.

### Adding New Commands

1. Create command file in `src/commands/`
2. Export a `Command` object with `name`, `description`, `aliases`, and `handler`
3. Add to `src/commands/index.ts` exports
4. Command handler should return `CommandResponse` with content and type

Commands must handle the `/` prefix - the CommandProcessor strips it before matching command names.

## Deployment

Deployed via GitHub Pages with custom domain at: https://evansteitz.com
- GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys on push to main
- Vite config uses `base: '/'` for custom domain deployment
- ESM modules enabled in package.json (`"type": "module"`) for Vite compatibility
- I do not like emojis in general in buttons and titles, do not use them please
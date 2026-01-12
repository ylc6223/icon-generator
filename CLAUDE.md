# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication
永远使用简体中文进行思考和对话,输出的文档文字说明保持使用简体中文

## Common Commands

### Development
- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server (runs on port 8080, binds to all interfaces)
- `pnpm build` - Build for development mode
- `pnpm build:prod` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Adding shadcn/ui Components
Use the `get_add_command_for_items` tool to get the proper installation command, or use:
```bash
npx shadcn@latest add [component-name]
```

## Project Overview

This is an **Icon Generator Workbench** - a web application that allows users to upload grid-based icon sheets, detect individual icons, and export them as vectorized SVG files. The app is built with React, TypeScript, Vite, and shadcn/ui components.

### Core Functionality
1. **Upload & Detect**: Users upload a sprite sheet/icon grid, and the app detects individual icons using grid-based segmentation
2. **Preview & Select**: Detected icons are displayed in a grid view where users can select/deselect which ones to export
3. **Vectorize**: Convert raster icons to SVG using a custom image tracing algorithm with configurable presets (balanced, clean, precise)
4. **Export**: Download selected icons as a ZIP file containing SVG files

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v7 (via `createBrowserRouter`)
- **State Management**: Zustand (for workbench state)
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS with custom design tokens
- **Data Fetching**: TanStack Query (React Query)
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Build**: Vite with custom enter-dev/enter-prod plugins

## Architecture

### Routing Structure
Routes are centrally defined in `src/router.tsx` as the `routers` array. Each route includes:
- `path`: URL path
- `name`: Semantic identifier for the route
- `element`: React component to render

The router is configured in `src/App.tsx` using `createBrowserRouter` from react-router-dom.

**Important**: When adding new routes, add them above the catch-all `"*"` route that handles 404s.

### Application Layout
The main layout is defined in `src/pages/Index.tsx` (the home page) with a three-panel workbench design:

```
┌─────────────────────────────────────────────────┐
│                   TopBar                        │
├──────────┬──────────────────────────┬───────────┤
│ Assets   │       Canvas Area        │ Properties│
│ Panel    │                          │  Panel    │
│          │                          │           │
│ (lg)     │                          │  (xl)     │
├──────────┴──────────────────────────┴───────────┤
│                   StatusBar                     │
└─────────────────────────────────────────────────┘
```

- **TopBar**: Global actions and navigation
- **AssetsPanel**: Left sidebar for uploaded files/detected icons (hidden on smaller screens)
- **CanvasArea**: Main workspace showing the uploaded image and grid overlay
- **PropertiesPanel**: Right sidebar for export settings and configuration (hidden on smaller screens)
- **StatusBar**: Status messages and progress indicators

### State Management (Zustand)
The workbench state is managed by `src/stores/workbench-store.ts`:

**Key State**:
- `uploadedImage`: Data URL of the uploaded image
- `imageFile`: Original File object
- `imageInfo`: Image dimensions and filename
- `status`: Current processing stage (idle, uploading, detecting, processing, ready)
- `detectedIcons`: Array of detected icon regions with coordinates and selection state
- `viewMode`: Original image vs grid view toggle
- `vectorizationPreset`: SVG export quality setting
- `gridSize`: Rows/columns for grid detection

### Core Processing Logic
`src/lib/icon-processor.ts` contains the main icon processing algorithms:

1. **`detectIconsInImage`**: Divides the uploaded image into a grid and extracts each cell as a separate icon
2. **`imageToSvg`**: Converts raster icons to SVG using a potrace-like tracing algorithm
3. **`traceToSvg`**: Performs edge detection and contour tracing to generate SVG paths
4. **`exportIconsAsZip`**: Bundles selected icons into a ZIP file using jszip

The vectorization algorithm supports three presets:
- **balanced**: Default quality with moderate simplification
- **clean**: Higher threshold, more aggressive path simplification
- **precise**: Higher resolution, minimal simplification

### Component Organization

#### Workbench Components (`src/components/workbench/`)
These are the main application components:
- `TopBar.tsx`: App title, main actions
- `AssetsPanel.tsx`: Shows detected icons list
- `CanvasArea.tsx`: Main canvas with image and grid overlay
- `PropertiesPanel.tsx`: Export settings and options
- `StatusBar.tsx`: Status messages and progress
- `UploadZone.tsx`: Drag-and-drop upload area
- `IconPreviewCard.tsx`: Individual icon preview component

All workbench components are exported from `src/components/workbench/index.ts`.

#### UI Components (`src/components/ui/`)
Contains shadcn/ui components - pre-built, accessible components built on Radix UI primitives. These are standard UI components that should be used for consistency.

## Path Aliases
The project uses `@` as an alias for the `src` directory:
```typescript
import { Button } from '@/components/ui/button';
import { useWorkbenchStore } from '@/stores/workbench-store';
```

## Design System
The app uses custom CSS variables defined in `src/index.css` and configured in `tailwind.config.ts`:

**Custom Colors**:
- `surface`, `surface-subtle`: Background layers
- `canvas`: Main workspace background
- `primary-100/500/900`: Primary color variants
- Custom spacing tokens for panels (`topbar`, `statusbar`, `left-panel`, `right-panel`)

**Typography**:
- Custom font sizes: `display-lg/sm`, `headline-lg/sm`, `body-lg/sm`

**Effects**:
- Soft shadows: `shadow-soft-sm/md/lg`
- Subtle pulse animation

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Sets up global providers (QueryClient, TooltipProvider, Toaster) and router |
| `src/router.tsx` | Route definitions - add new routes here |
| `src/stores/workbench-store.ts` | Global state management via Zustand |
| `src/lib/icon-processor.ts` | Core icon detection and vectorization algorithms |
| `src/lib/utils.ts` | Utility functions (cn for className merging) |
| `CodeGuideline.md` | Project structure and coding conventions (keep updated!) |

## When Adding New Features

### Adding a New Page
1. Create `src/pages/PageName/index.tsx`
2. Add page-specific components in the same directory
3. Register route in `src/router.tsx`:
   ```tsx
   {
     path: "/page-name",
     name: 'pageName',
     element: <PageName />
   }
   ```

### Adding Reusable Components
- Add to `src/components/` with descriptive naming
- If it's a generic UI component, add to `src/components/ui/`
- Export from appropriate index file for cleaner imports

### Adding State
- For global state, extend `src/stores/workbench-store.ts` or create a new Zustand store
- For local component state, use React hooks

### Styling
- Use Tailwind utility classes
- Access custom design tokens via theme extensions (e.g., `bg-surface`, `text-body-lg`)
- Maintain consistency with existing component patterns

## Key Patterns

### Component Imports
```tsx
import { Button } from '@/components/ui/button';
import { TopBar, CanvasArea } from '@/components/workbench';
```

### Using the Store
```tsx
const { uploadedImage, setUploadedImage, status } = useWorkbenchStore();
```

### Async Processing
Icon processing is async and returns Promises - use `await` or `.then()` when calling functions from `icon-processor.ts`.

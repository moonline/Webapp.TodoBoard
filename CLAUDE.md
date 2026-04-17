# TodoBoard Development Guidelines

## Project Overview

TodoBoard is a todo.txt task management application with a Kanban-style board interface. It is structured as a **yarn workspaces monorepo** with three packages:

| Package              | Path                       | Purpose                                                   |
| -------------------- | -------------------------- | --------------------------------------------------------- |
| `todoboard-core`     | `packages/todoboard-core/` | Shared board logic, components, composables, types, utils |
| `todoboard-webapp`   | `packages/webapp/`         | Browser-based SPA (localStorage persistence)              |
| `todoboard-electron` | `packages/electron-app/`   | Electron desktop app (file-based persistence, multi-tab)  |

Both apps import `todoboard-core` as a workspace dependency and consume it as source (no pre-build step).

## Setup

- **Node**: 22+ (use `nvm use` — `.nvmrc` is at repo root)
- **Package Manager**: Yarn 1.x (`yarn install` at repo root)
- **Format**: `yarn format` before committing

## Architecture

### Core-Shell Pattern

The core package exposes `TodoBoardCore.vue` which accepts data and a `CoreHooks` callback interface. Shells (webapp, electron-app) implement persistence through these hooks:

```
Shell (webapp/electron) → passes initialTasks, initialConfig, initialFilter, hooks
  → TodoBoardCore.vue (core) → calls hooks.onTasksChanged, hooks.onConfigChanged, etc.
    → Shell persists (localStorage / Electron IPC file save)
```

### Key Files

**Core (`packages/todoboard-core/src/`):**

- `index.ts` — barrel export for all public API
- `types/todo.ts` — `TodoTask`, `BoardConfig`, `BoardColumn`, `Filter`, `ColumnType`
- `types/core-hooks.ts` — `CoreHooks` interface (onTasksChanged, onConfigChanged, onFilterChanged)
- `composables/useTasks.ts` — task state management (provide/inject), accepts `CoreHooks`
- `composables/useUI.ts` — UI state (activeTab, compactMode, filters)
- `components/TodoBoardCore.vue` — main wrapper with slots: `toolbar-start`, `settings-actions`
- `utils/todo-parser.ts` — todo.txt parsing/serialization
- `utils/storage.ts` — `getDefaultBoardConfig()`, `cloneBoardConfig()` only (no I/O)

**Webapp (`packages/webapp/src/`):**

- `views/web-board-view.vue` — wraps TodoBoardCore, localStorage persistence, file upload/download buttons via slots
- `utils/local-storage.ts` — localStorage persistence functions
- `utils/file-download.ts` — browser File System Access API wrapper

**Electron (`packages/electron-app/`):**

- `electron/main.ts` — Electron main process, window management
- `electron/preload.ts` — context bridge for IPC
- `electron/ipc-handlers.ts` — IPC handler registration
- `src/views/electron-board-view.vue` — file tabs, per-tab TodoBoardCore, debounced auto-save, session restore
- `src/composables/useElectron.ts` — Electron API wrapper

### State Management Separation

- **Data stores**: Business logic, persistence (`useTasks`)
- **UI stores**: UI-specific state — active tabs, modal visibility, filter collapse (`useUI`)
- **API wrappers**: External communication (`useElectron`)

### Slot-Based Customization

Core components expose named slots for shell-specific UI:

- `compact-toolbar.vue` → `<slot name="toolbar-start">` (before Create Task button)
- `settings-view.vue` → `<slot name="settings-actions">` (in header area), `<slot name="settings-banner">` (below header, above config)

## Scripts

| Command                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `yarn dev:web`            | Start webapp dev server (port 5173)                    |
| `yarn dev:electron`       | Start electron app in dev mode (renderer on port 5174) |
| `yarn build:web`          | Type-check + build webapp                              |
| `yarn build:electron`     | Build electron app + package all targets               |
| `yarn pack:appimage`      | Build electron app + package as Linux AppImage         |
| `yarn typecheck:web`      | Type-check webapp only                                 |
| `yarn typecheck:electron` | Type-check electron-app only                           |
| `yarn format`             | Format all code with Prettier                          |
| `yarn lint`               | Check formatting                                       |

### AppImage notes

- Output: `packages/electron-app/dist-electron/TodoBoard-<version>-x86_64.AppImage`
- The electron version in `packages/electron-app/package.json` must be pinned to an exact version (no `^` range) — electron-builder requires this to resolve the bundled Electron binary
- The window icon (`icon-todoboard-512.png`) must be listed in `electron-builder.yml` `files` to be available at runtime inside the asar
- The Vue router must use `createWebHashHistory` (not `createWebHistory`) — `file://` protocol does not support HTML5 history routing
- Use `app.isPackaged` to distinguish dev from production in the main process (not `process.env.NODE_ENV`, which is not replaced at compile time in the main process bundle)
- AppImages can be integrated into the desktop environment using [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)

## Clean Code Principles

### Type Safety

- **No `any` or `unknown` types** — use explicit, specific types
- **Explicit return type annotations** on all functions
- **Strict TypeScript mode** — all packages use `strict: true`
- **Type imports** — use `import type` for type-only imports
- **Interfaces over type aliases** for object shapes

### Function Style

- **Arrow functions** over classic function declarations
- **If-else over early returns** — makes control flow explicit, avoids multiple exit points
- **Braces on all if statements** — never single-line without braces
- **Avoid non-null assertions (`!`)** — use safe null checking

### Naming

- **Files**: kebab-case (`todo-parser.ts`, `board-view.vue`)
- **Types/Interfaces**: PascalCase (`TodoTask`, `BoardConfig`)
- **Functions/Variables**: camelCase (`getCurrentUser`, `boardConfig`)
- **No abbreviations** — use full, descriptive names
- **No single-letter variables** except in short loops

### Code Quality

- **Readable over brief** — clarity beats conciseness
- **Immutable array operations** — `.map()`, `.filter()`, `.reduce()` over mutations
- **One responsibility per function**
- **Extract repeated logic** into helper functions

### Vue.js

- **Explicit prop types** with TypeScript
- **Scoped styles** unless global styles are needed
- **PascalCase** component names in imports
- **Prefer Bootstrap classes** over custom CSS (`d-flex`, `flex-column`, `p-3`, `btn btn-primary`)

### Formatting

- **Tabs** for JS/TS/Vue/CSS, **spaces** for JSON/MD/YAML (configured in `.prettierrc`)
- Run `yarn format` before committing

## Testing and Quality

Before considering work complete:

1. `yarn lint` passes (Prettier check)
2. `yarn typecheck:web` passes
3. `yarn typecheck:electron` passes
4. `yarn build:web` succeeds
5. `yarn dev:electron` starts without errors

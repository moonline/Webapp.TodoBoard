# TodoBoard

A todo.txt task management application with a Kanban-style board interface. Supports both a browser-based web app and an Electron desktop app with multi-file tabs.

## Prerequisites

- Node.js 22+ (use [nvm](https://github.com/nvm-sh/nvm): `nvm use`)
- Yarn 1.x

## Getting Started

```bash
# Install dependencies
yarn install

# Start the web app
yarn dev:web        # http://localhost:5173

# Or start the Electron desktop app
yarn dev:electron
```

## Project Structure

```
packages/
  todoboard-core/     Shared board logic, components, types, utils
  webapp/             Browser SPA (localStorage persistence)
  electron-app/       Electron desktop app (file-based persistence)
```

Both apps import `todoboard-core` as a workspace dependency.

## Scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `yarn dev:web`        | Start webapp dev server             |
| `yarn dev:electron`   | Start Electron app in dev mode      |
| `yarn build:web`      | Type-check and build webapp         |
| `yarn build:electron` | Build and package Electron app      |
| `yarn pack:appimage`  | Build and package as Linux AppImage |
| `yarn format`         | Format code with Prettier           |
| `yarn lint`           | Check code formatting               |

## Installing the Linux AppImage

The AppImage can be run directly without installation. To integrate it into your desktop environment (app launcher, file associations, auto-update support), use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher).

## Technology Stack

- Vue.js 3 + TypeScript (strict mode)
- Bootstrap 5
- Vite / electron-vite
- todo-txt-ts parser
- Prettier (tabs for code, spaces for config)

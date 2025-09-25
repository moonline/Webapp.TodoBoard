# TodoBoard Application Requirements

Create a todo.txt task management application with the following specifications:

## Data Sources
* todo.txt format: https://github.com/todotxt/todo.txt
* Parser library: https://www.npmjs.com/package/todotxt-parser

## Core Features
- **Multi-file support**: Handle multiple todo.txt files in tabbed interface
- **Kanban-style board**: Display tasks as cards in configurable columns
- **Dual deployment**: Web app (static hosting) + Electron desktop app
- **todo.txt format compliance**: Use standard todo.txt format with todotxt-parser library

## Technology Stack
- **Frontend**: Vue.js + TypeScript + Bootstrap
- **Parser**: todotxt-parser npm package
- **Desktop**: Electron wrapper for local file access

## User Interface Layout
1. **Tab bar**: Open todo.txt files + new tab button
2. **Toolbar**: Filter controls, new task button, view switcher
3. **Main area**:
   - Task board (Kanban view)
   - Settings configuration panel


## Filtering System
- Filter by project, context, or key:value tags
- Store filter preferences in local storage
- Default: show all tasks

## Task Board Features
- **Configurable columns** based on task properties:
  - Priority levels
  - Project names (first project)
  - Context tags (first context)
  - Custom key:value tags
  - Default: status:* tag values
- **Special columns**: "Untagged" and "Done" tasks
- **Column customization**: order, icon, label, color, visibility rules
- **Task sorting** within columns by priority, project, context, date, or custom tags
- **Task cards** displaying: priority, completion status, due date, description, projects, contexts, tags, creation date

## Configuration Management
- **Per-project settings**: Each todo.txt file has independent configuration
- **Import/export**: JSON format for board configurations
- **Persistent storage**: Local storage for web, .config.json files for desktop


## Storage Requirements
- **Web app**: Local storage for tasks and configs, file upload/download for persistence
- **Desktop app**: Direct file system access, auto-save to todo.txt files, companion .config.json files
- **File history**: Track last 10 opened files

## Implementation Instructions
Generate this application with proper project structure, component architecture, and both web and desktop deployment configurations. Use Vue.js with TypeScript and Bootstrap for the frontend, and leverage the todotxt-parser npm package for parsing todo.txt files.
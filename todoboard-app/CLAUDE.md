# TodoBoard Development Guidelines

This document outlines the coding standards and best practices for the TodoBoard application.

## Clean Code Principles

### Type Safety

- **No `any` types**: Always use explicit, specific types
- **Explicit return type annotations**: All functions must specify return types for clarity

  ```typescript
  // Good
  function processTask(task: TodoTask): string {
    return task.description;
  }

  // Avoid
  function processTask(task) {
    return task.description;
  }
  ```

### Code Structure

- **Add braces to all if statements**: Never use single-line if statements without braces

  ```typescript
  // Good
  if (condition) {
    doSomething();
  }

  // Avoid
  if (condition) doSomething();
  ```

- **Avoid non-null assertions (`!`)**: Use safe null checking instead

  ```typescript
  // Good
  const existingTasks = columnMap.get(columnValue);
  if (existingTasks) {
    existingTasks.push(task);
  }

  // Avoid
  columnMap.get(columnValue)!.push(task);
  ```

### Readability Over Brevity

- **Prefer readable code over short code**: Clarity is more important than conciseness
- **Avoid "nerdy" expressions**: Don't use shortcuts like `!!value` or similar cryptic patterns
- **Extract helper functions**: Create dedicated functions for repeated logic

  ```typescript
  // Good
  function formatDateToString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Avoid repeated inline logic
  date.toISOString().split("T")[0]; // repeated multiple times
  ```

## Array Operations

- **Prefer immutable array modifiers**: Use `.map()`, `.filter()`, `.reduce()` over iterative approaches

  ```typescript
  // Good
  const processedTasks = tasks.map((task) => processTask(task));
  const validTasks = tasks.filter((task) => task.isValid);

  // Avoid
  const processedTasks = [];
  for (let i = 0; i < tasks.length; i++) {
    processedTasks.push(processTask(tasks[i]));
  }
  ```

## Naming Conventions

### File Names

- **kebab-case**: Use lowercase with hyphens for file names

  ```
  ✓ todo-parser.ts
  ✓ board-view.vue
  ✓ task-card.component.vue

  ✗ todoParser.ts
  ✗ BoardView.vue
  ✗ task_card.component.vue
  ```

### Classes

- **PascalCase**: Use uppercase first letter for classes and types

  ```typescript
  ✓ class TodoTask { }
  ✓ interface BoardConfig { }
  ✓ type FilterSettings = { }

  ✗ class todoTask { }
  ✗ interface boardConfig { }
  ```

### Functions and Variables

- **camelCase**: Use lowercase first letter for functions and variables

  ```typescript
  ✓ const currentUser = getCurrentUser();
  ✓ function processTaskList(taskList: TodoTask[]): void { }

  ✗ const CurrentUser = getCurrentUser();
  ✗ function ProcessTaskList(task_list: TodoTask[]): void { }
  ```

### Variable Names

- **No abbreviations**: Always use full, descriptive names

  ```typescript
  // Good
  const applicationConfiguration = loadConfig();
  const taskDescription = task.description;
  const userAccountSettings = account.settings;

  // Avoid
  const config = loadConfig();
  const str = task.description;
  const settings = account.settings;
  ```

- **Avoid single letter variables**: Exception only for very short, obvious loops

  ```typescript
  // Good
  const taskIndex = tasks.findIndex((task) => task.id === targetId);
  for (const task of tasks) {
    processTask(task);
  }

  // Avoid
  const i = tasks.findIndex((task) => task.id === targetId);
  for (let i = 0; i < tasks.length; i++) {
    processTask(tasks[i]);
  }
  ```

## Code Formatting

### Prettier Configuration

- **Tabs for JS/TS**: Use tabs for JavaScript and TypeScript indentation
- **Spaces for JSON/MD**: Use spaces for JSON and Markdown files
- **Consistent formatting**: Always run `yarn format` before committing

### Function Organization

- **One responsibility per function**: Each function should do one thing well
- **Extract complex logic**: Move complex operations into dedicated helper functions
- **Clear parameter types**: Always specify parameter and return types

## Technology-Specific Guidelines

### Vue.js Components

- **Explicit prop types**: Always define prop types using TypeScript
- **Scoped styles**: Use scoped CSS unless global styles are specifically needed
- **Component naming**: Use PascalCase for component names in imports

### TypeScript

- **Strict mode**: Project uses strict TypeScript configuration
- **Type imports**: Use `import type` for type-only imports
- **Interface over type**: Prefer interfaces for object shapes when possible

## Error Handling

- **Explicit error checking**: Always check for potential null/undefined values
- **Graceful degradation**: Handle errors gracefully with user-friendly messages
- **No silent failures**: Log errors appropriately for debugging

## Testing and Quality

- **Build verification**: Code must build without errors or warnings
- **Format verification**: Code must pass Prettier formatting checks
- **Type checking**: All code must pass TypeScript strict mode checks

---

_These guidelines ensure code consistency, readability, and maintainability across the TodoBoard application._

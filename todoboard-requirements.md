# TodoBoard

## Resources

* todo.txt format: https://github.com/todotxt/todo.txt
* todo.txt parser for TS: https://www.npmjs.com/package/todotxt-parser

## Description

A board that renders todo.txt tasks as cards in columns.

Multiple todo.txt files can be opened in tabs. The new-tab page offers to open a new todo.txt file (and shows a list of recently opened files in desktop mode) or start with a new empty todo list.

The user interface contains 3 areas of content (stacked):
1. A tab bar with the tabs of open todo.txt files and the new-tab tab.
2. A toolbar with tools like filtering, new todo button and a view switcher, to switch the main view
3. The main view, containing the following views, that can be switched with the view switcher:
   - Settings view. Here users can adjust columns and general configurations for the board
   - Task board. Tasks are shown in columns like in a Kanban Board


## Toolbar

### Filters

The filter allows to filter tasks by a project, a context or a key:value tag .

By default all tasks are shown.

Filters should be stored in the board configuration in local storage.

## Settings view

Board configuration is made on project level (each todo.txt file has it's own rules). User should have the possibility to import and export the configuration of a board as JSON.

### Columns

Users can choose which of the following task property should be used as column id:

- priority
- first project from projects
- the first context from contexts
- the values of a `key:value` tag.

Default: `status:*` tag values.

There are two special columns: Untagged (tasks without column value) and done (tasks marked as completed).

For all columns, including the special ones, Users have three options regarding their appearance:

- Show always (Default)
- Show only when it contains tasks
- Hide

For each column users can configure:
- Order (drag-drop)
- unicode icon (default: ≣)
- label (default: value from property)
- color (default: )


### Sorting

User can choose one or multiple task properties, that should be used for the order of the tasks inside of the column:

- priority
- first project
- first context
- create date
- the values of a `key:value` tag.
 
Default: priority.

For each sort criteria, ascending or descending can be used. Example:

1. priority ASC
2. first project ASC
   
This configuration should order tasks first by priority and then by project.


## Task board

The task board fills the remaining space of the user interface and allows horizontal and vertical scrolling, if there are more columns than fit into the window or the columns are longer than the available space.

Columns should be rendered regarding the column configuration in settings view.
Tasks should be ordered regarding sorting configuration in settings view.
Only tasks that match the filter should be shown.

Each task card should visualize task properties like following (All optional except description):

* Header: Priority, Completion, Due date (due:ISO-DATE tag)
* Body: Description, Projects, Contexts, Key/Value tags
* Footer: Creation date


## Delivery

The application should be created with Vue, Typescript and Bootstrap. It should be provided in two formats:

- As web application, that can be deploy to any static hosting.
- As Electron based desktop application, which works directly on local files

https://www.npmjs.com/package/todotxt-parser should be leveraged as todo.txt parser.

## Storage

For the web application, tasks as well as the board configurations should be stored in local storage.
Users selected and upload a todo.txt file to open it and save/export it again to file to store it locally.
When a board tab is closed, the data should be cleared from local storage.

For the desktop application, users selects a local file, which is updated when changes are saved. Any modification to the todos should be written directly to the local todo.txt file to keep it in sync.
The configuration of the board should be stored to a {todo-file-name}.config.json file, which is stored 
along with the todo file.
Only the currently open files and the history of the last 10 opened files should be stored in local storage.
import type { BoardConfig, TodoTask, Filter } from "@/types/todo";

const STORAGE_PREFIX = "todoboard";

export function saveTasks(boardId: string, tasks: TodoTask[]): void {
	localStorage.setItem(`${STORAGE_PREFIX}_tasks_${boardId}`, JSON.stringify(tasks));
}

export function loadTasks(boardId: string): TodoTask[] {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	return stored ? JSON.parse(stored) : [];
}

export function saveBoardConfig(boardId: string, config: BoardConfig): void {
	localStorage.setItem(`${STORAGE_PREFIX}_config_${boardId}`, JSON.stringify(config));
}

export function loadBoardConfig(boardId: string): BoardConfig | null {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_config_${boardId}`);
	return stored ? JSON.parse(stored) : null;
}

export function saveFilter(boardId: string, filter: Filter): void {
	localStorage.setItem(`${STORAGE_PREFIX}_filter_${boardId}`, JSON.stringify(filter));
}

export function loadFilter(boardId: string): Filter {
	const stored = localStorage.getItem(`${STORAGE_PREFIX}_filter_${boardId}`);
	return stored ? JSON.parse(stored) : { projects: [], contexts: [], tags: {} };
}

export function clearBoard(boardId: string): void {
	localStorage.removeItem(`${STORAGE_PREFIX}_tasks_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_config_${boardId}`);
	localStorage.removeItem(`${STORAGE_PREFIX}_filter_${boardId}`);
}

export function getDefaultBoardConfig(): BoardConfig {
	return {
		columnBy: "status",
		sortBy: [{ field: "priority", direction: "asc" }],
		columns: {
			todo: { id: "todo", title: "To Do", icon: "📝", visible: true, order: 0 },
			doing: { id: "doing", title: "Doing", icon: "⚡", visible: true, order: 1 },
			done: { id: "done", title: "Done", icon: "✅", visible: true, order: 2 },
			none: { id: "none", title: "Untagged", icon: "❓", visible: true, order: 3 },
		},
	};
}

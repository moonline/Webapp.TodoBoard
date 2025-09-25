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
	if (!stored) {
		return null;
	}

	try {
		const config = JSON.parse(stored) as BoardConfig;
		// Migrate old configurations to include new properties
		Object.keys(config.columns).forEach((key) => {
			const column = config.columns[key];
			if (!column.displayBehavior) {
				column.displayBehavior = "always";
			}
			if (!column.color) {
				// Set default colors based on column id
				switch (key) {
					case "todo":
						column.color = "#6c757d";
						break;
					case "doing":
						column.color = "#fd7e14";
						break;
					case "done":
						column.color = "#198754";
						break;
					case "none":
						column.color = "#adb5bd";
						break;
					default:
						column.color = "#6c757d";
				}
			}
		});
		return config;
	} catch (error) {
		console.error("Error loading board config:", error);
		return null;
	}
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
			todo: {
				id: "todo",
				title: "To Do",
				icon: "📝",
				color: "#6c757d",
				visible: true,
				displayBehavior: "always",
				order: 0,
			},
			doing: {
				id: "doing",
				title: "Doing",
				icon: "⚡",
				color: "#fd7e14",
				visible: true,
				displayBehavior: "always",
				order: 1,
			},
			done: {
				id: "done",
				title: "Done",
				icon: "✅",
				color: "#198754",
				visible: true,
				displayBehavior: "whenTasks",
				order: 2,
			},
			none: {
				id: "none",
				title: "Untagged",
				icon: "❓",
				color: "#adb5bd",
				visible: true,
				displayBehavior: "whenTasks",
				order: 3,
			},
		},
	};
}
